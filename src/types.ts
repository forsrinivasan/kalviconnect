export type Role = 'learner' | 'mentor' | 'coordinator';

export type Language = 'en' | 'ta';

export type TrackId = 'track-a' | 'track-b' | 'track-c';

export interface Milestone {
  week: number;
  title: string;
  titleTa: string;
  objective: string;
  objectiveTa: string;
  task: string;
  taskTa: string;
  deliverable: string;
  deliverableTa: string;
  status: 'pending' | 'submitted' | 'completed';
  submission?: string;
  submittedAt?: string;
  mentorFeedback?: string;
  verifiedAt?: string;
}

export interface MentoringTrack {
  id: TrackId;
  name: string;
  nameTa: string;
  tagline: string;
  taglineTa: string;
  description: string;
  descriptionTa: string;
  milestones: Milestone[];
}

export interface Learner {
  id: string;
  name: string;
  email: string;
  age: number;
  district: string;
  partnerInstitution: string; // College or NGO
  trackId: TrackId;
  preferredLanguage: 'tamil' | 'english' | 'bilingual';
  primaryGoal: string;
  assignedMentorId?: string;
  cohortStartDate: string;
  milestones: Milestone[];
  baselineCompleted: boolean;
  endlineCompleted: boolean;
  registrationStatus: 'pending_approval' | 'approved' | 'rejected';
  registeredAt: string;
  otpVerified: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  city: string;
  country: string;
  timezone: string; // e.g., 'America/New_York', 'Europe/London', 'Asia/Singapore', 'Asia/Kolkata'
  timezoneLabel: string;
  languages: string[];
  trackSpecialties: TrackId[];
  yearsExperience: number;
  avatarUrl?: string;
  vettingStatus: 'verified' | 'pending' | 'review_required';
  codeOfConductAccepted: boolean;
  safeguardingTrainingCompleted: boolean;
  weeklyCommitmentHours: number;
  bio: string;
  assignedLearnerIds: string[];
  registrationStatus: 'pending_approval' | 'approved' | 'rejected';
  registeredAt: string;
  otpVerified: boolean;
}

export interface MentoringSession {
  id: string;
  learnerId: string;
  mentorId: string;
  weekNumber: number;
  scheduledTimeUTC: string; // ISO 8601
  status: 'upcoming' | 'completed' | 'cancelled';
  cancellationReason?: string;
  cancelledBy?: 'coordinator' | 'learner' | 'mentor';
  meetingLink: string;
  mentorNotes?: string;
  learnerFeedbackRating?: number; // 1-5
  learnerFeedbackComments?: string;
  followUpTasks?: string[];
  durationMinutes: number;
}

export interface SafeguardingReport {
  id: string;
  dateReported: string;
  reporterRole: Role;
  reporterName: string;
  learnerId: string;
  mentorId?: string;
  category: 'inappropriate_conduct' | 'unreliable_attendance' | 'communication_boundary' | 'rematch_request' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  resolutionNotes?: string;
  confidentialLead: string;
}

export interface CoordinatorAdmin {
  id: string;
  email: string;
  name: string;
  role: 'coordinator';
  title: string;
}

export interface OtpChallenge {
  email: string;
  code: string;
  expiresAt: number;
  role: Role;
  registrationPayload: any;
}
