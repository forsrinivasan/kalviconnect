import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LearnerDashboard } from './components/LearnerDashboard';
import { MentorDashboard } from './components/MentorDashboard';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { ScheduleModal } from './components/ScheduleModal';
import { SafeguardingModal } from './components/SafeguardingModal';
import { OtpAuthModal } from './components/OtpAuthModal';
import { getTranslation } from './translations';
import { Shield, Heart, Globe, BookOpen, Clock, AlertCircle } from 'lucide-react';

function AppContent() {
  const {
    activeRole,
    activeLearner,
    activeMentor,
    mentors,
    language,
    currentAuthUser,
    setActiveRole,
  } = useApp();

  const t = getTranslation(language);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isSafeguardingOpen, setIsSafeguardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const assignedMentor = mentors.find(m => m.id === activeLearner.assignedMentorId) || activeMentor;

  // Determine if active persona is awaiting coordinator approval
  const isPendingApproval =
    (activeRole === 'learner' && activeLearner.registrationStatus === 'pending_approval') ||
    (activeRole === 'mentor' && activeMentor.registrationStatus === 'pending_approval');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Bar Contract Navigation */}
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Pending Approval Notice Banner for newly registered users */}
      {isPendingApproval && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 text-xs text-amber-950">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <strong className="font-semibold">Registration Pending Coordinator Approval:</strong>{' '}
                Your email ({activeRole === 'learner' ? activeLearner.email : activeMentor.email}) was verified via OTP. The Lead Programme Coordinator (Dr. Revathi Raman) is reviewing your profile.
              </div>
            </div>
            <button
              onClick={() => setActiveRole('coordinator')}
              className="self-start sm:self-auto px-3 py-1 bg-amber-800 text-white font-semibold rounded text-[11px] hover:bg-amber-900 transition-colors shrink-0"
            >
              Switch to Coordinator to Approve →
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeRole === 'learner' && (
          <LearnerDashboard
            onOpenSchedule={() => setIsScheduleOpen(true)}
            onOpenSafeguarding={() => setIsSafeguardingOpen(true)}
          />
        )}

        {activeRole === 'mentor' && (
          <MentorDashboard
            onOpenSchedule={() => setIsScheduleOpen(true)}
          />
        )}

        {activeRole === 'coordinator' && (
          <CoordinatorDashboard />
        )}
      </main>

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        learner={activeLearner}
        mentor={assignedMentor}
        currentWeek={3}
      />

      <SafeguardingModal
        isOpen={isSafeguardingOpen}
        onClose={() => setIsSafeguardingOpen(false)}
        learnerId={activeLearner.id}
        mentorId={activeLearner.assignedMentorId}
      />

      <OtpAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer with Safeguarding & Guiding Principles */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-amber-800 text-white font-bold text-xs flex items-center justify-center">
              க
            </div>
            <div>
              <span className="font-bold text-slate-800">Kalvi Connect</span>
              <span className="mx-2">·</span>
              <span>{t.missionKicker}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600 text-[11px]">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-amber-700" />
              <span>Dignity & Equity First</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Vetted Safeguarding Charter</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-700" />
              <span>India Standard Time & Global Diaspora</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>100% Free for Learners</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Tamil Nadu Pilot 2026 · DPDP Privacy Compliant
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
