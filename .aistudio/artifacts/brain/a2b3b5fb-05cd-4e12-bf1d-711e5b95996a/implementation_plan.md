# Kalvi Connect — Global Mentors, Local Opportunity

A social-impact mentoring platform connecting underserved young people (aged 18–24) in Tamil Nadu with vetted volunteers and industry professionals worldwide for structured 6-week guidance across digital skills, career navigation, and professional readiness.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed based on your requirements and provide the blueprint for the prototype:

- **Confirmed Decision 1 (Testing Workflow)**: Multi-role switcher allowing instant switching between **Learner** (student view), **Mentor** (global volunteer view), and **Coordinator / Safeguarding Lead** (administrative and matching view) without losing session state.
- **Confirmed Decision 2 (Track Coverage)**: Full implementation of all three initial mentoring tracks:
  - **Track A**: Education & Career Navigation (pathways, personal learning plan, advisor questions).
  - **Track B**: Digital Skills & IT Careers (programming fundamentals, cloud & data concepts, portfolio project).
  - **Track C**: Communication & Professional Readiness (spoken English practice, CV review, interview preparation).
  Each track includes pre-configured 6-week milestone curricula and actionable tasks.
- **Confirmed Decision 3 (Language Support)**: English interface with a persistent **Tamil Translation Toggle** (`English` / `தமிழ்`), providing authentic Tamil translations for all navigation, guidance, forms, and status labels.
- **Confirmed Decision 4 (International Scheduling)**: Dual-timezone booking engine displaying learner local time (**IST — India Standard Time**) side-by-side with the mentor's local time zone (**US EST/PST, UK GMT/BST, Singapore SGT, Europe CET**), complete with verified external meeting links (Google Meet format) and calendar invitation export.

---

## 1. Overview & Core Concept

- **What It Does**: Facilitates respectful, structured, and safe 6-week mentorship cohorts. Supports end-to-end user journeys:
  - **Learners**: Register via community partner referral, declare goals and language preferences, review learning plans, schedule dual-timezone sessions, complete milestone tasks, and submit weekly feedback.
  - **Mentors**: Register professional expertise, complete identity/safeguarding onboarding, sign the code of conduct, specify availability across global time zones, submit post-session follow-ups, and log student milestones.
  - **Coordinators & Safeguarding Leads**: Verify and approve mentor credentials, review referred students, perform thoughtful 1-to-1 or small group pairings, monitor session attendance, and triage safeguarding escalations.
- **Target Audience / Personas**:
  - *Learners*: Young adults (18–24), first-generation college students from rural/semi-urban Tamil Nadu with limited access to professional networks.
  - *Mentors*: IT engineers, researchers, architects, and business professionals in India and the global diaspora (US, UK, Europe, Singapore).
  - *Coordinators*: Partner NGO/college liaisons and platform safeguarding administrators.
- **Key Value**: Delivers consistent, dignified, barrier-free human guidance without paywalls, ads, or impersonal automated scoring.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Role Switcher & Top-Level Context**:
   - A clean top bar with the brand wordmark **Kalvi Connect**, high-contrast language toggle (`English` / `தமிழ்`), role-switch pill-less segmented button (`Learner` · `Mentor` · `Coordinator`), and active user profile.
2. **Learner Flow**:
   - *Registration & Referral Onboarding*: College/partner selection, interest track selection (A, B, or C), language preference (Tamil, English, or Bilingual), and consent declaration.
   - *Active Match & 6-Week Learning Roadmap*: View assigned mentor bio (with location and time zone), weekly milestone timeline (Weeks 1 to 6), task submission checklist, and shared session notes.
   - *Session Management & Dual-Time Booking*: Upcoming session cards showing IST time and mentor local time, verified Google Meet link button, "Add to Calendar" ICS download, and post-session feedback.
   - *Safety & Support Drawer*: Direct "Report a Concern or Request Rematch" button with confidential submission directly to the Safeguarding Lead.
3. **Mentor Flow**:
   - *Onboarding & Safeguarding Acceptance*: Professional background verification, time zone selection, safeguarding charter & boundaries review, and code-of-conduct sign-off.
   - *Mentee Portal*: View assigned student goals, track progress across the 6-week roadmap, record session completion, leave constructive follow-up action items, and submit cohort reflections.
4. **Coordinator & Safeguarding Lead Flow**:
   - *Cohort Overview*: Total enrolled students, pending mentor approvals, active pairings, and attendance completion rate.
   - *Manual Matching Interface*: Matchmaker view matching by Track, Language, Career Goals, and Time-Zone overlap.
   - *Safeguarding & Escalation Queue*: Triage logged concerns, pause matches, or assign alternative mentors without penalty to the learner.

### Visual Identity & Theme

- **Aesthetic Direction**: Dignified, modern, human-centered educational platform. Clean editorial hierarchy inspired by thoughtful public-interest digital services.
- **Color Palette (60-30-10 Rule)**:
  - *60% Dominant Canvas*: Clean warm white/slate canvas (`bg-slate-50` / `bg-white`).
  - *30% Structural Surfaces*: Subtle hairline borders (`border-slate-200`), elevated card surfaces (`bg-white`), muted typography (`text-slate-600`).
  - *10% Accent Budget*: Deep Terracotta / Crimson accent (`#9A3412` / `#C2410C` representing traditional terracotta knowledge & warmth) paired with deep Navy Sapphire (`#1E3A8A` for academic credibility).
- **Typography**:
  - *Display*: `Plus Jakarta Sans` for clean, confident titles and module headers.
  - *Body*: `DM Sans` for high legibility across English and Tamil unicode text.
  - *Tabular Numbers*: `tabular-nums` for session times, week counters, and cohort statistics.
- **Anti-Slop Discipline**:
  - No decorative status dots, no fake telemetry, no "AI innovation scores", no code-comment titles.
  - No pill badge sandwiches; clean inline metadata with middle dots (`·`).

---

## 3. Key Product Decisions & Trade-Offs

- **Coordinator-Led Matching vs. Automated AI Matching**:
  - *Chosen*: Manual coordinator matching workbench with intelligent compatibility suggestions (track, language, timezone).
  - *Why*: In social-impact programs involving vulnerable learners, coordinator oversight ensures psychological safety and authentic alignment, strictly adhering to the PRD mandate ("Do not build AI matching before validating relationships").
- **Client-Side State with Local Persistence**:
  - *Chosen*: Reactive state store initialized with rich demo seed data (pre-populated learners, mentors in different continents, active cohorts) persisted in browser `localStorage`.
  - *Why*: Allows instant testing of the complete cross-role workflow without requiring external credentials or risking session dropouts during review.
- **Bilingual Architecture**:
  - *Chosen*: Centralized dictionary module containing translations for all key UI labels, instructions, track descriptions, and safeguarding prompts.
- **Dual-Timezone Clock Computation**:
  - *Chosen*: Native `Intl.DateTimeFormat` calculations converting IST session times to Mentor local time zones (e.g., America/New_York, Europe/London, Asia/Singapore) with explicit UTC offset indicators.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│  [Kalvi Connect Wordmark] — [Role Switcher: Learner | Mentor | Admin]  │
│  [Language: EN | தமிழ்] — [Active User Quick Profile]                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│     Learner View     │ │     Mentor View      │ │   Coordinator View   │
│ ──────────────────── │ │ ──────────────────── │ │ ──────────────────── │
│ • Track & Goals Card │ │ • Safeguarding Badge │ │ • Cohort Stats KPIs  │
│ • 6-Week Curriculum  │ │ • Assigned Mentees   │ │ • Mentor Vetting Tab │
│ • Dual-Time Booking  │ │ • Session Logger     │ │ • Matching Console   │
│ • Task Checklist     │ │ • Task Assignee Log  │ │ • Safeguarding Lead  │
│ • Safeguarding Modal │ │ • Feedback Notes     │ │   Incident Queue     │
└──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Application State Store (Local Storage)               │
│ • Learners List (profiles, tracks, colleges, enrolled cohort)          │
│ • Mentors List (global timezone, verified skills, vetting status)      │
│ • Match Pairs & 6-Week Milestones (status, submissions, notes)         │
│ • Scheduled Sessions (IST time, mentor local time, Meet link, status)  │
│ • Safeguarding Reports (confidential triage tickets)                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Entities

- `Learner`: ID, name, district/city, partner college, track (A/B/C), preferred language, baseline goal, assigned mentor ID.
- `Mentor`: ID, name, role/company, city, timezone (e.g., `America/New_York`), languages, vetting status (`verified` / `pending`), track specialties, code of conduct signed date.
- `CohortTrack`: Track ID, track name (EN/Tamil), description, 6 weekly milestones with titles, tasks, and deliverables.
- `Session`: ID, learner ID, mentor ID, scheduled UTC timestamp, status (`upcoming` / `completed` / `rescheduled`), meeting link, mentor follow-up notes, learner rating/feedback.
- `SafeguardingIncident`: ID, reporter role, learner ID, category, description, status (`open` / `investigating` / `resolved`), coordinator resolution notes.

### Interactive Component & State Mapping

- **Role Switcher**: Updates active persona state (`activeRole: 'learner' | 'mentor' | 'coordinator'`) and swaps the main dashboard view while preserving shared cohort data.
- **Language Switcher**: Toggles `currentLang: 'en' | 'ta'`, seamlessly translating interface headings, track titles, buttons, and safeguarding notices.
- **Matchmaker Interface**: Allows the coordinator to click "Assign Mentor", select an approved mentor with matching track and timezone, which immediately updates the learner's dashboard with their new mentor and milestone plan.
- **Session Scheduler**: Interactive booking drawer allowing either participant to schedule a session, automatically computing the IST and Mentor local time, generating an approved Google Meet room link, and enabling an ICS calendar download.
- **Milestone Tracker**: Checkbox and text entry for learners to submit tasks (e.g., "Draft Resume for Review", "Submit Git Repository Link"), allowing mentors to approve milestones and leave feedback.
- **Safeguarding Modal**: One-click reporting modal available on learner and mentor views, submitting directly to the Coordinator's triage queue with immediate reassurance messaging.
