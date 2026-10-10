import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { SEED_TRACKS } from '../data/seedData';
import { formatDualTime, generateIcsCalendar } from '../utils/timeZone';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  Download,
  AlertCircle,
  ShieldAlert,
  Send,
  Star,
  BookOpen,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface LearnerDashboardProps {
  onOpenSchedule: () => void;
  onOpenSafeguarding: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onOpenSchedule,
  onOpenSafeguarding,
}) => {
  const {
    activeLearner,
    mentors,
    sessions,
    submitTask,
    submitLearnerFeedback,
    language,
    learners,
    setActiveLearnerId,
  } = useApp();

  const t = getTranslation(language);

  const assignedMentor = mentors.find(m => m.id === activeLearner.assignedMentorId);
  const track = SEED_TRACKS.find(tr => tr.id === activeLearner.trackId) || SEED_TRACKS[0];

  // Find upcoming session
  const upcomingSession = sessions.find(
    s => s.learnerId === activeLearner.id && s.status === 'upcoming'
  );

  // Find completed session needing feedback
  const completedSession = sessions.find(
    s => s.learnerId === activeLearner.id && s.status === 'completed'
  );

  // Milestone submission local state
  const [activeWeekSubmitting, setActiveWeekSubmitting] = useState<number | null>(null);
  const [submissionInput, setSubmissionInput] = useState('');

  // Session feedback local state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleTaskSubmit = (weekNum: number) => {
    if (!submissionInput.trim()) return;
    submitTask(activeLearner.id, weekNum, submissionInput);
    setActiveWeekSubmitting(null);
    setSubmissionInput('');
  };

  const handleFeedbackSubmit = (sessionId: string) => {
    submitLearnerFeedback(sessionId, feedbackRating, feedbackComment);
    setFeedbackSubmitted(true);
  };

  const dualTime = upcomingSession && assignedMentor
    ? formatDualTime(upcomingSession.scheduledTimeUTC, assignedMentor.timezone)
    : null;

  const completedMilestonesCount = activeLearner.milestones.filter(m => m.status === 'completed').length;
  const progressPercent = Math.round((completedMilestonesCount / 6) * 100);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Learner Selector & Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white shadow-md">
        <img
          src="/src/assets/images/hero_kalvi_students_1791648018794.jpg"
          alt="Tamil Nadu students collaborating in learning centre"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative p-6 sm:p-8 max-w-3xl">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ta' ? 'கல்வி கனெக்ட் — 2026 பைலட் குழு' : 'Kalvi Connect · 2026 Pilot Cohort'}</span>
            <span>·</span>
            <span>{activeLearner.partnerInstitution}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {t.learner.welcome} {activeLearner.name}
          </h1>

          <p className="text-sm text-slate-200 leading-relaxed max-w-2xl mb-4">
            {language === 'ta' ? track.descriptionTa : track.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeLearner.district}, Tamil Nadu</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-md">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ta' ? track.nameTa : track.name}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tabular-nums">{completedMilestonesCount} / 6 {language === 'ta' ? 'வாரங்கள் முடிந்தது' : 'Weeks Completed'} ({progressPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Demo Switcher for Testing different Learners */}
        <div className="bg-slate-950/80 border-t border-white/10 px-6 py-2 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            {language === 'ta' ? 'சோதனை மாணவர் மாற்றம்:' : 'Switch test learner persona:'}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {learners.map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLearnerId(l.id)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                  l.id === activeLearner.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white bg-white/5'
                }`}
              >
                {l.name} ({l.district})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left (Session & Mentor Card), Right (6-Week Roadmap) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 cols): Mentor & Next Session */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upcoming Session Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t.learner.upcomingSession}
                </h3>
              </div>
              <button
                onClick={onOpenSchedule}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900"
              >
                {upcomingSession ? (language === 'ta' ? 'நேரம் மாற்ற' : 'Reschedule') : t.learner.scheduleNew}
              </button>
            </div>

            {upcomingSession && assignedMentor && dualTime ? (
              <div className="space-y-4">
                {/* Dual Timezone Visual Display */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-900 font-medium">
                    <span>Week {upcomingSession.weekNumber} · 45 Mins</span>
                    <span className="font-mono">{dualTime.timeDiffDescription}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-white p-2 rounded-md border border-amber-200/60 shadow-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Your Time (India)</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">{dualTime.istTime}</span>
                      <span className="text-[11px] text-slate-600">{dualTime.istDate}</span>
                    </div>
                    <div className="bg-white p-2 rounded-md border border-amber-200/60 shadow-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Mentor Time ({assignedMentor.city})</span>
                      <span className="font-bold text-amber-900 text-sm block mt-0.5">{dualTime.mentorTime}</span>
                      <span className="text-[11px] text-slate-600">{dualTime.mentorDate}</span>
                    </div>
                  </div>
                </div>

                {/* Approved Link Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={upcomingSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{t.learner.joinGoogleMeet}</span>
                  </a>

                  <button
                    onClick={() => generateIcsCalendar(upcomingSession, activeLearner.name, assignedMentor)}
                    title="Export .ics calendar invitation"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium py-2 px-3 rounded-md flex items-center gap-1 transition-colors border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">.ICS</span>
                  </button>
                </div>

                {upcomingSession.followUpTasks && upcomingSession.followUpTasks.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 text-xs">
                    <span className="font-semibold text-slate-800 block mb-1">
                      {language === 'ta' ? 'அமர்வுக்கு முந்தைய குறிப்புகள்:' : 'Session Agenda & Follow-ups:'}
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                      {upcomingSession.followUpTasks.map((tsk, i) => (
                        <li key={i}>{tsk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-5 text-center text-xs text-slate-600">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-800 mb-1">{t.learner.noUpcomingSession}</p>
                {assignedMentor && (
                  <button
                    onClick={onOpenSchedule}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors"
                  >
                    {t.learner.scheduleNew}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Assigned Mentor Bio Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {t.learner.assignedMentor}
            </h3>

            {assignedMentor ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={assignedMentor.avatarUrl || '/src/assets/images/avatar_mentor_lead_1791648043121.jpg'}
                    alt={assignedMentor.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {assignedMentor.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {assignedMentor.role} · <span className="font-medium">{assignedMentor.organization}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{assignedMentor.city}, {assignedMentor.country}</span>
                      <span>·</span>
                      <span className="font-mono text-amber-900">{assignedMentor.timezoneLabel}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {assignedMentor.bio}
                </p>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{t.learner.languages}:</span>
                    <span className="font-medium text-slate-800">{assignedMentor.languages.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Safeguarding Status:</span>
                    <span className="font-medium text-emerald-700">Verified & Trained Volunteer</span>
                  </div>
                </div>

                {/* Report / Rematch Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={onOpenSafeguarding}
                    className="w-full text-left py-2 px-3 text-xs text-slate-600 hover:text-red-700 hover:bg-red-50/50 rounded-md transition-colors flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                      <span>{t.learner.reportConcern}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <p className="text-[10px] text-slate-500 mt-1 px-1">
                    {t.learner.reportNotice}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-600">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p>{t.learner.noMentorAssigned}</p>
              </div>
            )}
          </div>

          {/* Post-Session Feedback Box (if completed session exists) */}
          {completedSession && !feedbackSubmitted && !completedSession.learnerFeedbackRating && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-700 fill-emerald-700" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase">
                  {language === 'ta' ? 'அமர்வு கருத்துப் பதிவு' : 'Rate Your Last Mentoring Session'}
                </h4>
              </div>
              <p className="text-xs text-slate-700">
                {language === 'ta'
                  ? 'வாரம் 2 அமர்வு நிறைவடைந்தது. வழிகாட்டுதல் உங்களுக்கு பயனுள்ளதாக இருந்ததா?'
                  : 'How was your Week 2 session? Your anonymous feedback helps maintain quality.'}
              </p>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= feedbackRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={feedbackComment}
                onChange={e => setFeedbackComment(e.target.value)}
                placeholder={language === 'ta' ? 'கருத்துக்கள் (விருப்பத்தேர்வு)...' : 'Brief reflection or note for coordinator...'}
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-emerald-200 rounded-md focus:outline-hidden"
              />

              <button
                onClick={() => handleFeedbackSubmit(completedSession.id)}
                className="w-full py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors"
              >
                {language === 'ta' ? 'கருத்தை சமர்ப்பி' : 'Submit Session Feedback'}
              </button>
            </div>
          )}

        </div>

        {/* Right Column (7 cols): 6-Week Learning Roadmap & Milestone Submissions */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t.learner.roadmapTitle}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t.learner.roadmapSubtitle}
                </p>
              </div>

              {/* Progress pill-less indicator */}
              <div className="text-right">
                <span className="text-xs font-semibold text-amber-900 tabular-nums">
                  {completedMilestonesCount} / 6
                </span>
                <span className="text-xs text-slate-500 block">Milestones</span>
              </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-4">
              {activeLearner.milestones.map((m, idx) => {
                const isSubmittingThis = activeWeekSubmitting === m.week;

                return (
                  <div
                    key={m.week}
                    className={`rounded-lg border p-4 transition-all ${
                      m.status === 'completed'
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : m.status === 'submitted'
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Week Title & Status */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {m.week}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {language === 'ta' ? m.titleTa : m.title}
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            {language === 'ta' ? m.objectiveTa : m.objective}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {m.status === 'completed' && (
                          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.common.completed}</span>
                          </span>
                        )}
                        {m.status === 'submitted' && (
                          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{t.common.pending}</span>
                          </span>
                        )}
                        {m.status === 'pending' && (
                          <span className="text-xs text-slate-600">Upcoming</span>
                        )}
                      </div>
                    </div>

                    {/* Task & Deliverable Info */}
                    <div className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-md border border-slate-100 space-y-1.5 mt-2">
                      <div>
                        <span className="font-semibold text-slate-800">
                          {language === 'ta' ? 'பணி:' : 'Practical Task:'}{' '}
                        </span>
                        <span>{language === 'ta' ? m.taskTa : m.task}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-medium text-slate-700">
                          {language === 'ta' ? 'சமர்ப்பிக்க வேண்டியது:' : 'Expected Deliverable:'}{' '}
                        </span>
                        <span>{language === 'ta' ? m.deliverableTa : m.deliverable}</span>
                      </div>
                    </div>

                    {/* Previous Submission info */}
                    {m.submission && (
                      <div className="mt-2.5 p-2.5 bg-white border border-slate-200 rounded-md text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium">Your Submission</span>
                          <span>{m.submittedAt}</span>
                        </div>
                        <p className="text-slate-800 font-mono text-[11px] break-all">
                          {m.submission}
                        </p>
                      </div>
                    )}

                    {/* Mentor Feedback info */}
                    {m.mentorFeedback && (
                      <div className="mt-2 p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-md text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{t.learner.mentorNotes}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-[11px] pt-1">
                          "{m.mentorFeedback}"
                        </p>
                      </div>
                    )}

                    {/* In-line Submission Form */}
                    {m.status !== 'completed' && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        {isSubmittingThis ? (
                          <div className="w-full space-y-2">
                            <textarea
                              value={submissionInput}
                              onChange={e => setSubmissionInput(e.target.value)}
                              placeholder={
                                language === 'ta'
                                  ? 'உங்கள் குறிப்புகள், GitHub இணைப்பு அல்லது ஆவண உரையை உள்ளிடவும்...'
                                  : 'Paste link (GitHub repo, Google Doc) or type your submission notes...'
                              }
                              rows={2}
                              className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setActiveWeekSubmitting(null)}
                                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                              >
                                {t.common.cancel}
                              </button>
                              <button
                                onClick={() => handleTaskSubmit(m.week)}
                                className="px-3 py-1 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>{t.learner.submitTaskBtn}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex justify-end">
                            <button
                              onClick={() => {
                                setActiveWeekSubmitting(m.week);
                                setSubmissionInput(m.submission || '');
                              }}
                              className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline"
                            >
                              {m.status === 'submitted'
                                ? (language === 'ta' ? 'சமர்ப்பிப்பை திருத்து' : 'Update Submission')
                                : (language === 'ta' ? 'பணியை சமர்ப்பி' : 'Submit Deliverable')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
