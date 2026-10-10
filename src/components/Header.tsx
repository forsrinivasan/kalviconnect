import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { Role } from '../types';
import { Globe, Users, Shield, RotateCcw, KeyRound, UserCheck, Clock, X } from 'lucide-react';

interface HeaderProps {
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const {
    activeRole,
    setActiveRole,
    language,
    toggleLanguage,
    resetToDemoDefaults,
    activeLearner,
    activeMentor,
    currentAuthUser,
    generatedOtpAlert,
    dismissOtpAlert,
  } = useApp();

  const t = getTranslation(language);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      
      {/* Global OTP Notification Alert Banner */}
      {generatedOtpAlert && (
        <div className="bg-amber-900 text-amber-100 px-4 py-2 text-xs flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>
                <strong>Simulated Email One-Time Password (OTP):</strong> A 6-digit verification code was generated for <strong>{generatedOtpAlert.email}</strong>: <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider text-white text-sm">{generatedOtpAlert.code}</code>
              </span>
            </div>
            <button
              onClick={dismissOtpAlert}
              className="text-amber-300 hover:text-white text-xs font-semibold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              க
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Kalvi Connect
                </span>
                <span className="text-xs font-medium text-amber-800">
                  {language === 'ta' ? 'கல்வி கனெக்ட்' : 'Global Mentors'}
                </span>
              </div>
              <p className="text-xs text-slate-700 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Zone 2: Role Switcher (Learner, Mentor, Coordinator) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveRole('learner')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeRole === 'learner'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'ta' ? 'மாணவர்' : 'Learner'}</span>
            </button>
            <button
              onClick={() => setActiveRole('mentor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeRole === 'mentor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-700" />
              <span>{language === 'ta' ? 'வழிகாட்டி' : 'Mentor'}</span>
            </button>
            <button
              onClick={() => setActiveRole('coordinator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeRole === 'coordinator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'ta' ? 'ஒருங்கிணைப்பாளர்' : 'Coordinator (Admin)'}</span>
            </button>
          </div>

          {/* Zone 3: Actions & Language Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              aria-label="Toggle Language"
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="text-amber-800 font-bold">{language === 'en' ? 'EN' : 'தமிழ்'}</span>
              <span className="text-slate-600 text-[10px]">⇄</span>
              <span className="text-slate-700">{language === 'en' ? 'தமிழ்' : 'EN'}</span>
            </button>

            {/* OTP Sign In / Register Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'OTP பதிவு / உள்நுழைவு' : 'OTP Register / Sign In'}</span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset demo state to default seed data?')) {
                  resetToDemoDefaults();
                }
              }}
              title="Reset to default demo data"
              className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Sub-header context indicator with registration approval status */}
      <div className="bg-amber-50/60 border-t border-amber-100 px-4 py-1.5 text-xs text-amber-950 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{t.roleSwitchNotice}:</span>
            <span>
              {activeRole === 'learner' && `${activeLearner.name} (${activeLearner.email})`}
              {activeRole === 'mentor' && `${activeMentor.name} (${activeMentor.email})`}
              {activeRole === 'coordinator' && 'Dr. Revathi Raman (coordinator@kalviconnect.org)'}
            </span>

            {/* Registration status badge */}
            {activeRole === 'learner' && activeLearner.registrationStatus === 'pending_approval' && (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Awaiting Coordinator Approval</span>
              </span>
            )}
            {activeRole === 'mentor' && activeMentor.registrationStatus === 'pending_approval' && (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Awaiting Coordinator Approval</span>
              </span>
            )}
            {activeRole === 'coordinator' && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                Super Administrator
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-700 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              <span>Cloud: Firestore Real-Time Synchronized</span>
            </span>
            <span>·</span>
            <span>Tamil Nadu Pilot 2026</span>
            <span>·</span>
            <span>DPDP Compliant</span>
          </div>
        </div>
      </div>
    </header>
  );
};
