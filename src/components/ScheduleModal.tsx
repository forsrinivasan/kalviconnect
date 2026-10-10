import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { Mentor, Learner } from '../types';
import { formatDualTime } from '../utils/timeZone';
import { Calendar, Clock, Video, X, Check } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner;
  mentor: Mentor;
  currentWeek: number;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  learner,
  mentor,
  currentWeek,
}) => {
  const { scheduleSession, language } = useApp();
  const t = getTranslation(language);

  const [selectedDate, setSelectedDate] = useState('2026-10-14');
  const [selectedIstHour, setSelectedIstHour] = useState('19:00'); // 7:00 PM IST
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Compute UTC string from selected date & IST time (IST is UTC+5:30, so subtract 5h30m)
  const calculateUtcIso = (dateStr: string, istTimeStr: string) => {
    const [hours, minutes] = istTimeStr.split(':').map(Number);
    const dateObj = new Date(dateStr);
    // Set time in IST by adjusting for UTC
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const localMs = Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours, minutes);
    const utcMs = localMs - istOffsetMs;
    return new Date(utcMs).toISOString();
  };

  const previewUtc = calculateUtcIso(selectedDate, selectedIstHour);
  const dualTime = formatDualTime(previewUtc, mentor.timezone);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleSession(learner.id, mentor.id, currentWeek, previewUtc);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-800" />
            <h3 className="text-base font-semibold text-slate-900">
              {language === 'ta' ? 'வழிகாட்டல் அமர்வு திட்டமிடல்' : 'Schedule Mentoring Session'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-1">
              {language === 'ta' ? 'அமர்வு வெற்றிகரமாக திட்டமிடப்பட்டது!' : 'Session Scheduled Successfully!'}
            </h4>
            <p className="text-xs text-slate-700">
              {language === 'ta'
                ? 'அழைப்பிதழ் மற்றும் கூகிள் மீட் இணைப்பு உருவாக்கப்பட்டது.'
                : 'Google Meet link and dual-timezone invitation have been created.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-6 space-y-5">
            
            {/* Participants Summary */}
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-3 text-xs text-amber-950 flex justify-between items-center">
              <div>
                <span className="font-semibold block text-slate-900">{learner.name}</span>
                <span className="text-slate-700">Tamil Nadu (IST UTC+5:30)</span>
              </div>
              <div className="text-center font-bold text-amber-800">⟷</div>
              <div className="text-right">
                <span className="font-semibold block text-slate-900">{mentor.name}</span>
                <span className="text-slate-700">{mentor.city} ({mentor.timezoneLabel})</span>
              </div>
            </div>

            {/* Date and Time Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'தேதி' : 'Session Date'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min="2026-10-11"
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'நேரம் (இந்திய நேரம் - IST)' : 'Learner Time (India - IST)'}
                </label>
                <select
                  value={selectedIstHour}
                  onChange={e => setSelectedIstHour(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="17:00">5:00 PM IST</option>
                  <option value="17:30">5:30 PM IST</option>
                  <option value="18:00">6:00 PM IST</option>
                  <option value="18:30">6:30 PM IST</option>
                  <option value="19:00">7:00 PM IST (Recommended)</option>
                  <option value="19:30">7:30 PM IST</option>
                  <option value="20:00">8:00 PM IST</option>
                  <option value="20:30">8:30 PM IST</option>
                  <option value="21:00">9:00 PM IST</option>
                </select>
              </div>
            </div>

            {/* Dual Timezone Live Verification Box */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Dual-Timezone Synchronization</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-white p-2.5 rounded-md border border-slate-200">
                  <span className="text-[11px] text-slate-700 block font-medium">India Standard Time</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{dualTime.istTime}</span>
                  <span className="text-[11px] text-slate-700">{dualTime.istDate}</span>
                </div>
                
                <div className="bg-white p-2.5 rounded-md border border-slate-200">
                  <span className="text-[11px] text-slate-700 block font-medium">Mentor Local Time ({mentor.city})</span>
                  <span className="font-semibold text-amber-900 block mt-0.5">{dualTime.mentorTime}</span>
                  <span className="text-[11px] text-slate-700">{dualTime.mentorDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-700">
                <Video className="w-3.5 h-3.5 text-slate-600" />
                <span>45-minute 1-on-1 session with approved Google Meet link</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs"
              >
                {language === 'ta' ? 'அமர்வை உறுதி செய்' : 'Confirm & Generate Meet Link'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
