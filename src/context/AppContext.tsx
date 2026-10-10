import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';
import {
  CoordinatorAdmin,
  Language,
  Learner,
  Mentor,
  MentoringSession,
  OtpChallenge,
  Role,
  SafeguardingReport,
} from '../types';
import {
  COORDINATOR_ADMIN,
  SEED_LEARNERS,
  SEED_MENTORS,
  SEED_SESSIONS,
  SEED_SAFEGUARDING_REPORTS,
  SEED_TRACKS,
} from '../data/seedData';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  registrationStatus: 'approved' | 'pending_approval' | 'rejected';
}

interface AppContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;

  // Real-time Cloud state
  isCloudConnected: boolean;

  // Registered Entities
  learners: Learner[];
  mentors: Mentor[];
  sessions: MentoringSession[];
  safeguardingReports: SafeguardingReport[];
  coordinatorAdmin: CoordinatorAdmin;

  // Active Personas
  activeLearner: Learner;
  activeMentor: Mentor;
  currentAuthUser: AuthUser;
  setActiveLearnerId: (id: string) => void;
  setActiveMentorId: (id: string) => void;
  setCurrentAuthUser: (user: AuthUser) => void;

  // OTP Authentication & Registration
  activeOtpChallenge: OtpChallenge | null;
  generatedOtpAlert: { email: string; code: string; role: Role } | null;
  dismissOtpAlert: () => void;
  requestOtpForRegistration: (email: string, role: 'learner' | 'mentor', payload: any) => { code: string; success: boolean };
  verifyOtpAndCompleteRegistration: (code: string) => { success: boolean; error?: string };
  requestOtpForLogin: (email: string) => { code: string; success: boolean; error?: string };
  verifyOtpAndLogin: (code: string) => { success: boolean; error?: string };
  quickLoginAs: (role: Role, email?: string) => void;

  // Coordinator Approval Workflow
  approveUserRegistration: (userId: string, role: 'learner' | 'mentor') => void;
  rejectUserRegistration: (userId: string, role: 'learner' | 'mentor') => void;

  // Coordinator Event / Session Management
  cancelSessionByCoordinator: (sessionId: string, reason: string) => void;
  deleteSessionByCoordinator: (sessionId: string) => void;

  // Existing Core Workflows
  submitTask: (learnerId: string, week: number, submissionText: string) => void;
  verifyMilestoneTask: (learnerId: string, week: number, mentorFeedback: string) => void;
  matchLearner: (learnerId: string, mentorId: string) => void;
  unmatchLearner: (learnerId: string, reason?: string) => void;
  approveMentor: (mentorId: string) => void;
  scheduleSession: (
    learnerId: string,
    mentorId: string,
    weekNumber: number,
    utcIsoString: string
  ) => void;
  completeSession: (sessionId: string, notes: string, followUpTasks: string[]) => void;
  submitLearnerFeedback: (sessionId: string, rating: number, comments: string) => void;
  submitSafeguardingReport: (
    category: SafeguardingReport['category'],
    description: string,
    learnerId: string,
    mentorId?: string
  ) => void;
  resolveSafeguardingReport: (reportId: string, resolutionNotes: string) => void;
  resetToDemoDefaults: () => void;
}

const STORAGE_KEY = 'kalvi_connect_v2_store';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<Role>('learner');
  const [language, setLanguage] = useState<Language>('en');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // Entities state with local storage fallback
  const [learners, setLearners] = useState<Learner[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_learners`);
      return saved ? JSON.parse(saved) : SEED_LEARNERS;
    } catch {
      return SEED_LEARNERS;
    }
  });

  const [mentors, setMentors] = useState<Mentor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_mentors`);
      return saved ? JSON.parse(saved) : SEED_MENTORS;
    } catch {
      return SEED_MENTORS;
    }
  });

  const [sessions, setSessions] = useState<MentoringSession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      return saved ? JSON.parse(saved) : SEED_SESSIONS;
    } catch {
      return SEED_SESSIONS;
    }
  });

  const [safeguardingReports, setSafeguardingReports] = useState<SafeguardingReport[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_safeguarding`);
      return saved ? JSON.parse(saved) : SEED_SAFEGUARDING_REPORTS;
    } catch {
      return SEED_SAFEGUARDING_REPORTS;
    }
  });

  const [activeLearnerId, setActiveLearnerId] = useState<string>('learner-1');
  const [activeMentorId, setActiveMentorId] = useState<string>('mentor-1');

  // Authenticated user state
  const [currentAuthUser, setCurrentAuthUser] = useState<AuthUser>(() => {
    return {
      id: 'learner-1',
      email: 'anitha.muthu@kalviconnect.org',
      name: 'Anitha Muthu',
      role: 'learner',
      registrationStatus: 'approved',
    };
  });

  // OTP Challenges
  const [activeOtpChallenge, setActiveOtpChallenge] = useState<OtpChallenge | null>(null);
  const [generatedOtpAlert, setGeneratedOtpAlert] = useState<{ email: string; code: string; role: Role } | null>(null);

  // 1. Initial Cloud Boot & Seeding + Real-Time onSnapshot listeners
  useEffect(() => {
    testFirestoreConnection().then(ok => setIsCloudConnected(ok));

    // Seed Firestore if empty
    const seedCloudIfEmpty = async () => {
      try {
        const learnersSnap = await getDocs(collection(db, 'learners'));
        if (learnersSnap.empty) {
          console.log('Seeding initial production data into Firestore...');
          for (const lrn of SEED_LEARNERS) {
            await setDoc(doc(db, 'learners', lrn.id), lrn);
          }
          for (const mtr of SEED_MENTORS) {
            await setDoc(doc(db, 'mentors', mtr.id), mtr);
          }
          for (const ssn of SEED_SESSIONS) {
            await setDoc(doc(db, 'sessions', ssn.id), ssn);
          }
          for (const sg of SEED_SAFEGUARDING_REPORTS) {
            await setDoc(doc(db, 'safeguardingReports', sg.id), sg);
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'learners');
      }
    };
    seedCloudIfEmpty();

    // 2. Attach real-time listeners across all devices
    const unsubLearners = onSnapshot(
      collection(db, 'learners'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudLearners = snapshot.docs.map(d => d.data() as Learner);
          setLearners(cloudLearners);
          try {
            localStorage.setItem(`${STORAGE_KEY}_learners`, JSON.stringify(cloudLearners));
          } catch {}
        }
      },
      err => handleFirestoreError(err, OperationType.LIST, 'learners')
    );

    const unsubMentors = onSnapshot(
      collection(db, 'mentors'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudMentors = snapshot.docs.map(d => d.data() as Mentor);
          setMentors(cloudMentors);
          try {
            localStorage.setItem(`${STORAGE_KEY}_mentors`, JSON.stringify(cloudMentors));
          } catch {}
        }
      },
      err => handleFirestoreError(err, OperationType.LIST, 'mentors')
    );

    const unsubSessions = onSnapshot(
      collection(db, 'sessions'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudSessions = snapshot.docs.map(d => d.data() as MentoringSession);
          setSessions(cloudSessions);
          try {
            localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(cloudSessions));
          } catch {}
        }
      },
      err => handleFirestoreError(err, OperationType.LIST, 'sessions')
    );

    const unsubReports = onSnapshot(
      collection(db, 'safeguardingReports'),
      snapshot => {
        if (!snapshot.empty) {
          const cloudReports = snapshot.docs.map(d => d.data() as SafeguardingReport);
          setSafeguardingReports(cloudReports);
          try {
            localStorage.setItem(`${STORAGE_KEY}_safeguarding`, JSON.stringify(cloudReports));
          } catch {}
        }
      },
      err => handleFirestoreError(err, OperationType.LIST, 'safeguardingReports')
    );

    return () => {
      unsubLearners();
      unsubMentors();
      unsubSessions();
      unsubReports();
    };
  }, []);

  // Sync activeRole with auth user when role is switched
  useEffect(() => {
    if (activeRole === 'coordinator') {
      setCurrentAuthUser({
        id: COORDINATOR_ADMIN.id,
        email: COORDINATOR_ADMIN.email,
        name: COORDINATOR_ADMIN.name,
        role: 'coordinator',
        registrationStatus: 'approved',
      });
    } else if (activeRole === 'mentor') {
      const currentM = mentors.find(m => m.id === activeMentorId) || mentors[0];
      if (currentM) {
        setCurrentAuthUser({
          id: currentM.id,
          email: currentM.email,
          name: currentM.name,
          role: 'mentor',
          registrationStatus: currentM.registrationStatus,
        });
      }
    } else if (activeRole === 'learner') {
      const currentL = learners.find(l => l.id === activeLearnerId) || learners[0];
      if (currentL) {
        setCurrentAuthUser({
          id: currentL.id,
          email: currentL.email,
          name: currentL.name,
          role: 'learner',
          registrationStatus: currentL.registrationStatus,
        });
      }
    }
  }, [activeRole, activeLearnerId, activeMentorId, learners, mentors]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  const dismissOtpAlert = () => {
    setGeneratedOtpAlert(null);
  };

  const activeLearner = learners.find(l => l.id === activeLearnerId) || learners[0];
  const activeMentor = mentors.find(m => m.id === activeMentorId) || mentors[0];

  const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Request OTP for Registration
  const requestOtpForRegistration = (email: string, role: 'learner' | 'mentor', payload: any) => {
    const code = generateOtpCode();
    const challenge: OtpChallenge = {
      email: email.trim().toLowerCase(),
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      role,
      registrationPayload: payload,
    };
    setActiveOtpChallenge(challenge);
    setGeneratedOtpAlert({ email: challenge.email, code, role });
    return { code, success: true };
  };

  // Verify OTP and complete Registration -> writes to Cloud Firestore!
  const verifyOtpAndCompleteRegistration = (code: string) => {
    if (!activeOtpChallenge) {
      return { success: false, error: 'No active OTP request found. Please request a new code.' };
    }
    if (Date.now() > activeOtpChallenge.expiresAt) {
      return { success: false, error: 'OTP has expired. Please request a new code.' };
    }
    if (activeOtpChallenge.code.trim() !== code.trim()) {
      return { success: false, error: 'Incorrect OTP. Please check the 6-digit code provided.' };
    }

    const { role, email, registrationPayload } = activeOtpChallenge;
    const today = new Date().toISOString().split('T')[0];

    if (role === 'learner') {
      const track = SEED_TRACKS.find(t => t.id === registrationPayload.trackId) || SEED_TRACKS[0];
      const newLearner: Learner = {
        id: `learner-${Date.now()}`,
        name: registrationPayload.name,
        email,
        age: Number(registrationPayload.age) || 20,
        district: registrationPayload.district || 'Tamil Nadu',
        partnerInstitution: registrationPayload.partnerInstitution || 'Government College',
        trackId: registrationPayload.trackId || 'track-b',
        preferredLanguage: registrationPayload.preferredLanguage || 'bilingual',
        primaryGoal: registrationPayload.primaryGoal || 'Seeking structured career guidance.',
        cohortStartDate: today,
        milestones: JSON.parse(JSON.stringify(track.milestones)),
        baselineCompleted: true,
        endlineCompleted: false,
        registrationStatus: 'pending_approval',
        registeredAt: today,
        otpVerified: true,
      };

      // Optimistic update
      setLearners(prev => [newLearner, ...prev]);
      setActiveLearnerId(newLearner.id);
      setActiveRole('learner');
      setCurrentAuthUser({
        id: newLearner.id,
        email: newLearner.email,
        name: newLearner.name,
        role: 'learner',
        registrationStatus: 'pending_approval',
      });

      // Write to Cloud Firestore
      setDoc(doc(db, 'learners', newLearner.id), newLearner).catch(err =>
        handleFirestoreError(err, OperationType.CREATE, `learners/${newLearner.id}`)
      );
    } else {
      const newMentor: Mentor = {
        id: `mentor-${Date.now()}`,
        name: registrationPayload.name,
        email,
        role: registrationPayload.role || 'Volunteer Mentor',
        organization: registrationPayload.organization || 'Global Tech Partner',
        city: registrationPayload.city || 'Chennai',
        country: registrationPayload.country || 'India',
        timezone: registrationPayload.timezone || 'Asia/Kolkata',
        timezoneLabel: registrationPayload.timezoneLabel || 'IST (UTC+5:30)',
        languages: registrationPayload.languages || ['Tamil', 'English'],
        trackSpecialties: registrationPayload.trackSpecialties || ['track-b'],
        yearsExperience: Number(registrationPayload.yearsExperience) || 5,
        vettingStatus: 'pending',
        codeOfConductAccepted: true,
        safeguardingTrainingCompleted: true,
        weeklyCommitmentHours: Number(registrationPayload.weeklyCommitmentHours) || 2,
        bio: registrationPayload.bio || 'Eager volunteer supporting Kalvi Connect learners.',
        assignedLearnerIds: [],
        registrationStatus: 'pending_approval',
        registeredAt: today,
        otpVerified: true,
      };

      setMentors(prev => [newMentor, ...prev]);
      setActiveMentorId(newMentor.id);
      setActiveRole('mentor');
      setCurrentAuthUser({
        id: newMentor.id,
        email: newMentor.email,
        name: newMentor.name,
        role: 'mentor',
        registrationStatus: 'pending_approval',
      });

      // Write to Cloud Firestore
      setDoc(doc(db, 'mentors', newMentor.id), newMentor).catch(err =>
        handleFirestoreError(err, OperationType.CREATE, `mentors/${newMentor.id}`)
      );
    }

    setActiveOtpChallenge(null);
    setGeneratedOtpAlert(null);
    return { success: true };
  };

  // Request OTP for Login
  const requestOtpForLogin = (emailInput: string) => {
    const email = emailInput.trim().toLowerCase();
    let userRole: Role = 'learner';
    let foundUser: any = null;

    if (email === COORDINATOR_ADMIN.email.toLowerCase()) {
      userRole = 'coordinator';
      foundUser = COORDINATOR_ADMIN;
    } else {
      const learner = learners.find(l => l.email.toLowerCase() === email);
      if (learner) {
        userRole = 'learner';
        foundUser = learner;
      } else {
        const mentor = mentors.find(m => m.email.toLowerCase() === email);
        if (mentor) {
          userRole = 'mentor';
          foundUser = mentor;
        }
      }
    }

    if (!foundUser) {
      return { code: '', success: false, error: 'Email address not found. Please register first or check the spelling.' };
    }

    const code = generateOtpCode();
    const challenge: OtpChallenge = {
      email,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      role: userRole,
      registrationPayload: foundUser,
    };
    setActiveOtpChallenge(challenge);
    setGeneratedOtpAlert({ email, code, role: userRole });
    return { code, success: true };
  };

  // Verify OTP and Log In
  const verifyOtpAndLogin = (code: string) => {
    if (!activeOtpChallenge) {
      return { success: false, error: 'No active OTP challenge found. Please request an OTP.' };
    }
    if (Date.now() > activeOtpChallenge.expiresAt) {
      return { success: false, error: 'OTP has expired. Please request a new code.' };
    }
    if (activeOtpChallenge.code.trim() !== code.trim()) {
      return { success: false, error: 'Invalid OTP code. Please enter the correct 6 digits.' };
    }

    const { role, registrationPayload } = activeOtpChallenge;
    setActiveRole(role);

    if (role === 'coordinator') {
      setCurrentAuthUser({
        id: COORDINATOR_ADMIN.id,
        email: COORDINATOR_ADMIN.email,
        name: COORDINATOR_ADMIN.name,
        role: 'coordinator',
        registrationStatus: 'approved',
      });
    } else if (role === 'learner') {
      setActiveLearnerId(registrationPayload.id);
      setCurrentAuthUser({
        id: registrationPayload.id,
        email: registrationPayload.email,
        name: registrationPayload.name,
        role: 'learner',
        registrationStatus: registrationPayload.registrationStatus,
      });
    } else if (role === 'mentor') {
      setActiveMentorId(registrationPayload.id);
      setCurrentAuthUser({
        id: registrationPayload.id,
        email: registrationPayload.email,
        name: registrationPayload.name,
        role: 'mentor',
        registrationStatus: registrationPayload.registrationStatus,
      });
    }

    setActiveOtpChallenge(null);
    setGeneratedOtpAlert(null);
    return { success: true };
  };

  // Quick Login
  const quickLoginAs = (role: Role, email?: string) => {
    setActiveRole(role);
    if (role === 'coordinator') {
      setCurrentAuthUser({
        id: COORDINATOR_ADMIN.id,
        email: COORDINATOR_ADMIN.email,
        name: COORDINATOR_ADMIN.name,
        role: 'coordinator',
        registrationStatus: 'approved',
      });
    } else if (role === 'learner') {
      const l = email ? learners.find(item => item.email === email) || learners[0] : learners[0];
      setActiveLearnerId(l.id);
      setCurrentAuthUser({
        id: l.id,
        email: l.email,
        name: l.name,
        role: 'learner',
        registrationStatus: l.registrationStatus,
      });
    } else if (role === 'mentor') {
      const m = email ? mentors.find(item => item.email === email) || mentors[0] : mentors[0];
      setActiveMentorId(m.id);
      setCurrentAuthUser({
        id: m.id,
        email: m.email,
        name: m.name,
        role: 'mentor',
        registrationStatus: m.registrationStatus,
      });
    }
  };

  // Coordinator Approvals (Syncs to Cloud Firestore)
  const approveUserRegistration = (userId: string, role: 'learner' | 'mentor') => {
    if (role === 'learner') {
      setLearners(prev =>
        prev.map(l => (l.id === userId ? { ...l, registrationStatus: 'approved' } : l))
      );
      updateDoc(doc(db, 'learners', userId), { registrationStatus: 'approved' }).catch(err =>
        handleFirestoreError(err, OperationType.UPDATE, `learners/${userId}`)
      );
    } else {
      setMentors(prev =>
        prev.map(m => (m.id === userId ? { ...m, registrationStatus: 'approved', vettingStatus: 'verified' } : m))
      );
      updateDoc(doc(db, 'mentors', userId), { registrationStatus: 'approved', vettingStatus: 'verified' }).catch(err =>
        handleFirestoreError(err, OperationType.UPDATE, `mentors/${userId}`)
      );
    }
  };

  const rejectUserRegistration = (userId: string, role: 'learner' | 'mentor') => {
    if (role === 'learner') {
      setLearners(prev =>
        prev.map(l => (l.id === userId ? { ...l, registrationStatus: 'rejected' } : l))
      );
      updateDoc(doc(db, 'learners', userId), { registrationStatus: 'rejected' }).catch(err =>
        handleFirestoreError(err, OperationType.UPDATE, `learners/${userId}`)
      );
    } else {
      setMentors(prev =>
        prev.map(m => (m.id === userId ? { ...m, registrationStatus: 'rejected' } : m))
      );
      updateDoc(doc(db, 'mentors', userId), { registrationStatus: 'rejected' }).catch(err =>
        handleFirestoreError(err, OperationType.UPDATE, `mentors/${userId}`)
      );
    }
  };

  // Coordinator Event Management: Cancel and Delete (Syncs to Cloud Firestore)
  const cancelSessionByCoordinator = (sessionId: string, reason: string) => {
    const patch = {
      status: 'cancelled' as const,
      cancellationReason: reason || 'Cancelled by Programme Coordinator',
      cancelledBy: 'coordinator' as const,
    };
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, ...patch } : s))
    );
    updateDoc(doc(db, 'sessions', sessionId), patch).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `sessions/${sessionId}`)
    );
  };

  const deleteSessionByCoordinator = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    deleteDoc(doc(db, 'sessions', sessionId)).catch(err =>
      handleFirestoreError(err, OperationType.DELETE, `sessions/${sessionId}`)
    );
  };

  // Learner & Mentor Workflows (Syncs to Cloud Firestore)
  const submitTask = (learnerId: string, week: number, submissionText: string) => {
    const today = new Date().toISOString().split('T')[0];
    const target = learners.find(l => l.id === learnerId);
    if (!target) return;

    const updatedMilestones = target.milestones.map(m => {
      if (m.week !== week) return m;
      return {
        ...m,
        status: 'submitted' as const,
        submission: submissionText,
        submittedAt: today,
      };
    });

    setLearners(prev =>
      prev.map(l => (l.id === learnerId ? { ...l, milestones: updatedMilestones } : l))
    );
    updateDoc(doc(db, 'learners', learnerId), { milestones: updatedMilestones }).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `learners/${learnerId}`)
    );
  };

  const verifyMilestoneTask = (learnerId: string, week: number, mentorFeedback: string) => {
    const today = new Date().toISOString().split('T')[0];
    const target = learners.find(l => l.id === learnerId);
    if (!target) return;

    const updatedMilestones = target.milestones.map(m => {
      if (m.week !== week) return m;
      return {
        ...m,
        status: 'completed' as const,
        mentorFeedback,
        verifiedAt: today,
      };
    });

    setLearners(prev =>
      prev.map(l => (l.id === learnerId ? { ...l, milestones: updatedMilestones } : l))
    );
    updateDoc(doc(db, 'learners', learnerId), { milestones: updatedMilestones }).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `learners/${learnerId}`)
    );
  };

  const matchLearner = (learnerId: string, mentorId: string) => {
    setLearners(prev =>
      prev.map(l => (l.id === learnerId ? { ...l, assignedMentorId: mentorId } : l))
    );
    updateDoc(doc(db, 'learners', learnerId), { assignedMentorId: mentorId }).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `learners/${learnerId}`)
    );

    setMentors(prev =>
      prev.map(m => {
        if (m.id === mentorId && !m.assignedLearnerIds.includes(learnerId)) {
          const updated = [...m.assignedLearnerIds, learnerId];
          updateDoc(doc(db, 'mentors', mentorId), { assignedLearnerIds: updated }).catch(err =>
            handleFirestoreError(err, OperationType.UPDATE, `mentors/${mentorId}`)
          );
          return { ...m, assignedLearnerIds: updated };
        }
        return m;
      })
    );
  };

  const unmatchLearner = (learnerId: string) => {
    const targetLearner = learners.find(l => l.id === learnerId);
    if (!targetLearner || !targetLearner.assignedMentorId) return;
    const oldMentorId = targetLearner.assignedMentorId;

    setLearners(prev =>
      prev.map(l => (l.id === learnerId ? { ...l, assignedMentorId: undefined } : l))
    );
    updateDoc(doc(db, 'learners', learnerId), { assignedMentorId: '' }).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `learners/${learnerId}`)
    );

    setMentors(prev =>
      prev.map(m => {
        if (m.id === oldMentorId) {
          const updated = m.assignedLearnerIds.filter(id => id !== learnerId);
          updateDoc(doc(db, 'mentors', oldMentorId), { assignedLearnerIds: updated }).catch(err =>
            handleFirestoreError(err, OperationType.UPDATE, `mentors/${oldMentorId}`)
          );
          return { ...m, assignedLearnerIds: updated };
        }
        return m;
      })
    );
  };

  const approveMentor = (mentorId: string) => {
    setMentors(prev =>
      prev.map(m => (m.id === mentorId ? { ...m, vettingStatus: 'verified', registrationStatus: 'approved' } : m))
    );
    updateDoc(doc(db, 'mentors', mentorId), { vettingStatus: 'verified', registrationStatus: 'approved' }).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `mentors/${mentorId}`)
    );
  };

  const scheduleSession = (
    learnerId: string,
    mentorId: string,
    weekNumber: number,
    utcIsoString: string
  ) => {
    const newSession: MentoringSession = {
      id: `session-${Date.now()}`,
      learnerId,
      mentorId,
      weekNumber,
      scheduledTimeUTC: utcIsoString,
      status: 'upcoming',
      meetingLink: `https://meet.google.com/kalvi-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`,
      durationMinutes: 45,
      followUpTasks: [
        'Review past week milestones and prepare questions',
        'Review practical exercises and code repository',
      ],
    };
    setSessions(prev => [newSession, ...prev]);
    setDoc(doc(db, 'sessions', newSession.id), newSession).catch(err =>
      handleFirestoreError(err, OperationType.CREATE, `sessions/${newSession.id}`)
    );
  };

  const completeSession = (sessionId: string, notes: string, followUpTasks: string[]) => {
    const patch = {
      status: 'completed' as const,
      mentorNotes: notes,
      followUpTasks,
    };
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, ...patch } : s))
    );
    updateDoc(doc(db, 'sessions', sessionId), patch).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `sessions/${sessionId}`)
    );
  };

  const submitLearnerFeedback = (sessionId: string, rating: number, comments: string) => {
    const patch = {
      learnerFeedbackRating: rating,
      learnerFeedbackComments: comments,
    };
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, ...patch } : s))
    );
    updateDoc(doc(db, 'sessions', sessionId), patch).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `sessions/${sessionId}`)
    );
  };

  const submitSafeguardingReport = (
    category: SafeguardingReport['category'],
    description: string,
    learnerId: string,
    mentorId?: string
  ) => {
    const newReport: SafeguardingReport = {
      id: `sg-${Date.now()}`,
      dateReported: new Date().toISOString().split('T')[0],
      reporterRole: activeRole,
      reporterName:
        activeRole === 'learner'
          ? activeLearner.name
          : activeRole === 'mentor'
          ? activeMentor.name
          : 'Coordinator Officer',
      learnerId,
      mentorId: mentorId || activeLearner.assignedMentorId,
      category,
      description,
      status: 'open',
      confidentialLead: COORDINATOR_ADMIN.name,
    };
    setSafeguardingReports(prev => [newReport, ...prev]);
    setDoc(doc(db, 'safeguardingReports', newReport.id), newReport).catch(err =>
      handleFirestoreError(err, OperationType.CREATE, `safeguardingReports/${newReport.id}`)
    );
  };

  const resolveSafeguardingReport = (reportId: string, resolutionNotes: string) => {
    const patch = { status: 'resolved' as const, resolutionNotes };
    setSafeguardingReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, ...patch } : r))
    );
    updateDoc(doc(db, 'safeguardingReports', reportId), patch).catch(err =>
      handleFirestoreError(err, OperationType.UPDATE, `safeguardingReports/${reportId}`)
    );
  };

  const resetToDemoDefaults = async () => {
    localStorage.removeItem(`${STORAGE_KEY}_learners`);
    localStorage.removeItem(`${STORAGE_KEY}_mentors`);
    localStorage.removeItem(`${STORAGE_KEY}_sessions`);
    localStorage.removeItem(`${STORAGE_KEY}_safeguarding`);
    setLearners(SEED_LEARNERS);
    setMentors(SEED_MENTORS);
    setSessions(SEED_SESSIONS);
    setSafeguardingReports(SEED_SAFEGUARDING_REPORTS);
    setActiveLearnerId('learner-1');
    setActiveMentorId('mentor-1');
    setActiveRole('learner');

    // Overwrite cloud docs
    for (const l of SEED_LEARNERS) {
      await setDoc(doc(db, 'learners', l.id), l);
    }
    for (const m of SEED_MENTORS) {
      await setDoc(doc(db, 'mentors', m.id), m);
    }
    for (const s of SEED_SESSIONS) {
      await setDoc(doc(db, 'sessions', s.id), s);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        language,
        toggleLanguage,
        setLanguage,
        isCloudConnected,
        learners,
        mentors,
        sessions,
        safeguardingReports,
        coordinatorAdmin: COORDINATOR_ADMIN,
        activeLearner,
        activeMentor,
        currentAuthUser,
        setActiveLearnerId,
        setActiveMentorId,
        setCurrentAuthUser,
        activeOtpChallenge,
        generatedOtpAlert,
        dismissOtpAlert,
        requestOtpForRegistration,
        verifyOtpAndCompleteRegistration,
        requestOtpForLogin,
        verifyOtpAndLogin,
        quickLoginAs,
        approveUserRegistration,
        rejectUserRegistration,
        cancelSessionByCoordinator,
        deleteSessionByCoordinator,
        submitTask,
        verifyMilestoneTask,
        matchLearner,
        unmatchLearner,
        approveMentor,
        scheduleSession,
        completeSession,
        submitLearnerFeedback,
        submitSafeguardingReport,
        resolveSafeguardingReport,
        resetToDemoDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
