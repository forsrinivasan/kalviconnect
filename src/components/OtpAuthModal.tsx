import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../translations';
import { TrackId, Role } from '../types';
import { COMMON_TIMEZONES } from '../utils/timeZone';
import {
  KeyRound,
  Mail,
  UserPlus,
  LogIn,
  Check,
  AlertCircle,
  X,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface OtpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register' | 'login' | 'demo';
}

export const OtpAuthModal: React.FC<OtpAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
}) => {
  const {
    language,
    requestOtpForRegistration,
    verifyOtpAndCompleteRegistration,
    requestOtpForLogin,
    verifyOtpAndLogin,
    quickLoginAs,
    activeOtpChallenge,
    coordinatorAdmin,
    learners,
    mentors,
  } = useApp();

  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'demo'>(initialMode);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [role, setRole] = useState<'learner' | 'mentor'>('learner');

  // Form Fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Tirunelveli');
  const [institution, setInstitution] = useState('Government Arts & Science College');
  const [trackId, setTrackId] = useState<TrackId>('track-b');
  const [preferredLanguage, setPreferredLanguage] = useState<'tamil' | 'english' | 'bilingual'>('bilingual');
  const [primaryGoal, setPrimaryGoal] = useState('');

  // Mentor specific fields
  const [mentorRole, setMentorRole] = useState('Senior Software Engineer');
  const [organization, setOrganization] = useState('Tech Solutions');
  const [city, setCity] = useState('Chennai');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [yearsExperience, setYearsExperience] = useState(6);

  // OTP State
  const [otpInput, setOtpInput] = useState('');
  const [generatedCodePreview, setGeneratedCodePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Request OTP for Registration
  const handleRequestRegOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !name) {
      setErrorMessage('Please provide both your name and email address.');
      return;
    }

    const payload =
      role === 'learner'
        ? {
            name,
            age: 20,
            district,
            partnerInstitution: institution,
            trackId,
            preferredLanguage,
            primaryGoal: primaryGoal || 'Seeking guidance in digital skills and tech careers.',
          }
        : {
            name,
            role: mentorRole,
            organization,
            city,
            country: 'Global',
            timezone,
            timezoneLabel: COMMON_TIMEZONES.find(t => t.value === timezone)?.label || timezone,
            yearsExperience,
            languages: ['Tamil', 'English'],
            trackSpecialties: [trackId],
            weeklyCommitmentHours: 2,
            bio: 'Registered volunteer for Kalvi Connect mentoring cohorts.',
          };

    const res = requestOtpForRegistration(email, role, payload);
    setGeneratedCodePreview(res.code);
    setStep('otp');
  };

  // Handle Request OTP for Login
  const handleRequestLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = requestOtpForLogin(email);
    if (!res.success) {
      setErrorMessage(res.error || 'User not found. Please register or check email.');
      return;
    }

    setGeneratedCodePreview(res.code);
    setStep('otp');
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'register') {
      const res = verifyOtpAndCompleteRegistration(otpInput);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid OTP code.');
        return;
      }
      setSuccessMessage('Registration submitted and verified! Awaiting Coordinator approval.');
      setTimeout(() => {
        setSuccessMessage(null);
        setStep('form');
        onClose();
      }, 1600);
    } else {
      const res = verifyOtpAndLogin(otpInput);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid OTP code.');
        return;
      }
      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        setStep('form');
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-800" />
            <h3 className="text-base font-semibold text-slate-900">
              {language === 'ta' ? 'மின்னஞ்சல் OTP பதிவு & உள்நுழைவு' : 'Email OTP Registration & Sign In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => {
              setActiveTab('register');
              setStep('form');
              setErrorMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-amber-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'புதிய பதிவு' : 'New Registration'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('login');
              setStep('form');
              setErrorMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-amber-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'உள்நுழைவு' : 'Sign In with OTP'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('demo');
              setStep('form');
              setErrorMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'டெமோ கணக்குகள்' : 'Demo Accounts'}</span>
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: REGISTRATION FLOW */}
          {activeTab === 'register' && step === 'form' && (
            <form onSubmit={handleRequestRegOtp} className="space-y-4">
              
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  I want to register as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('learner')}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      role === 'learner'
                        ? 'border-amber-700 bg-amber-50/50 text-amber-900 ring-1 ring-amber-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Learner (Student 18–24)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('mentor')}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      role === 'mentor'
                        ? 'border-blue-700 bg-blue-50/50 text-blue-900 ring-1 ring-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Global Volunteer Mentor
                  </button>
                </div>
              </div>

              {/* Email Address & Name */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. srinivasan@gmail.com"
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    A 6-digit One-Time Password (OTP) will be generated for email verification.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Anand Srinivasan"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {role === 'learner' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                      <input
                        type="text"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        placeholder="e.g. Madurai, Salem"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">College / NGO</label>
                      <input
                        type="text"
                        value={institution}
                        onChange={e => setInstitution(e.target.value)}
                        placeholder="College Name"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mentoring Track</label>
                    <select
                      value={trackId}
                      onChange={e => setTrackId(e.target.value as TrackId)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                    >
                      <option value="track-a">Track A: Education & Career Navigation</option>
                      <option value="track-b">Track B: Digital Skills & IT Careers</option>
                      <option value="track-c">Track C: Communication & Professional Readiness</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Role</label>
                      <input
                        type="text"
                        value={mentorRole}
                        onChange={e => setMentorRole(e.target.value)}
                        placeholder="e.g. Lead Engineer"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Org</label>
                      <input
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="e.g. Google / Infosys"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Timezone</label>
                    <select
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                    >
                      {COMMON_TIMEZONES.map(tz => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Send 6-Digit OTP to Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: SIGN IN FLOW */}
          {activeTab === 'login' && step === 'form' && (
            <form onSubmit={handleRequestLoginOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. coordinator@kalviconnect.org"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  We'll generate a secure One-Time Password for instant passwordless login.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Pre-Registered Accounts Available:</span>
                <p>• Administrator: <code>coordinator@kalviconnect.org</code></p>
                <p>• Learner: <code>anitha.muthu@kalviconnect.org</code></p>
                <p>• Mentor: <code>karthik.sg@kalviconnect.org</code></p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Send One-Time Password</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* STEP 2: ENTER OTP CODE */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              
              {/* Simulated Email / OTP Notification Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-800" />
                    <span>One-Time Password Sent to Email</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Valid for 10m
                  </span>
                </div>
                <p className="text-slate-700 text-[11px]">
                  Simulated dispatch to <strong>{email}</strong>
                </p>
                {generatedCodePreview && (
                  <div className="pt-1 flex items-center justify-between bg-white p-2 rounded border border-amber-200/80">
                    <span className="font-mono font-extrabold text-base tracking-widest text-slate-900">
                      {generatedCodePreview}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpInput(generatedCodePreview)}
                      className="text-[11px] font-semibold text-amber-800 hover:underline"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full text-center tracking-widest font-mono text-xl py-2 px-3 border-2 border-slate-300 rounded-md focus:border-amber-700 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  ← Back to Email
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs"
                >
                  Verify OTP & {activeTab === 'register' ? 'Submit Registration' : 'Log In'}
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: QUICK DEMO USER SWITCHER */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2">
                Select an existing persona for instantaneous role and approval testing:
              </p>

              {/* Administrator */}
              <button
                type="button"
                onClick={() => {
                  quickLoginAs('coordinator');
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-lg border border-slate-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{coordinatorAdmin.name}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                      SUPER ADMINISTRATOR
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">{coordinatorAdmin.email}</span>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Can approve/reject users, match cohorts, delete events</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-800" />
              </button>

              {/* Sample Learner */}
              <button
                type="button"
                onClick={() => {
                  quickLoginAs('learner', 'anitha.muthu@kalviconnect.org');
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-lg border border-slate-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Anitha Muthu</span>
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Approved Learner
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">anitha.muthu@kalviconnect.org (Tirunelveli, Track B)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-800" />
              </button>

              {/* Sample Mentor */}
              <button
                type="button"
                onClick={() => {
                  quickLoginAs('mentor', 'karthik.sg@kalviconnect.org');
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-lg border border-slate-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Karthik Ramanathan</span>
                    <span className="text-[10px] font-medium text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded">
                      Approved Mentor
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">karthik.sg@kalviconnect.org (Singapore SGT)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-800" />
              </button>

              {/* Pending Learner for testing Coordinator Approval */}
              <button
                type="button"
                onClick={() => {
                  quickLoginAs('learner', 'suresh.salem@kalviconnect.org');
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Suresh Kannan (Salem)</span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-200 px-1.5 py-0.2 rounded">
                      Awaiting Coordinator Approval
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">suresh.salem@kalviconnect.org</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-800" />
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
