import { Language } from './types';

export const translations = {
  en: {
    appTitle: 'Kalvi Connect',
    appSubtitle: 'Global Mentors, Local Opportunity',
    missionKicker: 'Community Mentorship Platform',
    missionDesc: 'Empowering first-generation learners and youth in Tamil Nadu with structured 6-week mentorship from vetted global volunteers.',
    
    // Roles
    roles: {
      learner: 'Learner (Student)',
      mentor: 'Mentor (Volunteer)',
      coordinator: 'Programme Coordinator',
    },
    roleSwitchNotice: 'Active Persona View',
    
    // Navigation
    nav: {
      overview: 'Overview',
      roadmap: '6-Week Roadmap',
      sessions: 'Sessions & Schedule',
      safeguarding: 'Safeguarding & Support',
      matching: 'Matching Console',
      mentors: 'Mentor Approvals',
      analytics: 'Cohort Analytics',
    },

    // Tracks
    tracks: {
      trackA: 'Track A: Education & Career Navigation',
      trackADesc: 'Explore career pathways, set educational goals, and develop practical plans with guidance.',
      trackB: 'Track B: Digital Skills & IT Careers',
      trackBDesc: 'Hands-on programming fundamentals, cloud & data essentials, and portfolio projects.',
      trackC: 'Track C: Communication & Professional Readiness',
      trackCDesc: 'Workplace communication, spoken English practice, resume review, and interview confidence.',
    },

    // Learner Dashboard
    learner: {
      welcome: 'Welcome,',
      partnerCollege: 'Partner Institution',
      district: 'District',
      assignedMentor: 'Your Assigned Mentor',
      noMentorAssigned: 'Your mentor assignment is currently being finalized by the coordinator.',
      mentorLocation: 'Location & Timezone',
      languages: 'Languages',
      roadmapTitle: 'Your 6-Week Learning Roadmap',
      roadmapSubtitle: 'Complete tasks and collaborate with your mentor every week.',
      upcomingSession: 'Upcoming Mentoring Session',
      noUpcomingSession: 'No upcoming session scheduled yet. Propose a time slot with your mentor.',
      joinGoogleMeet: 'Join Google Meet',
      addToCalendar: 'Add to Calendar (.ics)',
      scheduleNew: 'Propose Session Slot',
      taskSubmission: 'Task Submission & Notes',
      submitTaskBtn: 'Submit Task for Review',
      taskSubmitted: 'Submitted — Awaiting Mentor Review',
      taskVerified: 'Approved by Mentor',
      mentorNotes: 'Mentor Feedback & Next Steps',
      reportConcern: 'Request Rematch or Report Concern',
      reportNotice: 'Safe, confidential, and penalty-free. Your wellbeing is our priority.',
    },

    // Mentor Dashboard
    mentor: {
      welcome: 'Mentor Portal',
      vettingStatus: 'Vetting Status',
      verifiedVolunteer: 'Verified Volunteer',
      pendingVetting: 'Pending Coordinator Review',
      safeguardingCharter: 'Safeguarding Charter Signed',
      timezoneNotice: 'Your timezone is set to',
      istEquiv: 'Learner local time is always India Standard Time (IST, UTC+5:30)',
      activeMentees: 'Your Assigned Mentees',
      logSession: 'Log Completed Session',
      reviewMilestone: 'Review Student Submissions',
      provideFeedback: 'Provide Constructive Feedback',
      commitmentHours: 'Weekly commitment',
      hoursPerWeek: 'hrs / week',
    },

    // Coordinator Dashboard
    coordinator: {
      dashboardTitle: 'Programme & Safeguarding Administration',
      stats: {
        enrolledLearners: 'Enrolled Learners',
        verifiedMentors: 'Vetted Mentors',
        activePairings: 'Active Pairings',
        sessionsHeld: 'Sessions Held',
        openConcerns: 'Safeguarding Tickets',
      },
      matchWorkbench: 'Coordinator Matching Workbench',
      matchWorkbenchDesc: 'Pair referred students with approved volunteers based on track, language, and timezone overlap.',
      matchAction: 'Assign Match',
      unmatchedStudents: 'Unmatched Learners',
      approvedMentors: 'Available Approved Mentors',
      vettingTab: 'Mentor Screening & Approvals',
      safeguardingQueue: 'Safeguarding & Escalation Queue',
      safeguardingDesc: 'All reports are reviewed confidentially by the designated Safeguarding Lead.',
      cohortMetrics: 'Cohort Progress & Retention',
      exportReport: 'Export Impact Report (CSV)',
    },

    // Common & Scheduling
    common: {
      week: 'Week',
      status: 'Status',
      actions: 'Actions',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      close: 'Close',
      submit: 'Submit',
      verified: 'Verified',
      pending: 'Pending',
      completed: 'Completed',
      scheduled: 'Scheduled',
      timezone: 'Timezone',
      indiaTime: 'India Time (IST)',
      mentorTime: 'Mentor Local Time',
      duration: '45 mins',
      confidential: 'Strictly Confidential',
      switchView: 'Switch Persona',
      languageToggle: 'Language',
    },
  },

  ta: {
    appTitle: 'கல்வி கனெக்ட் (Kalvi Connect)',
    appSubtitle: 'உலகளாவிய வழிகாட்டிகள், உள்ளூர் வாய்ப்புகள்',
    missionKicker: 'சமூக வழிகாட்டல் தளம்',
    missionDesc: 'தமிழகத்தில் உள்ள முதலாம் தலைமுறை கல்லூரி மாணவர்களுக்கும் இளைஞர்களுக்கும் உலகளாவிய வழிகாட்டிகளுடன் 6 வார கட்டமைக்கப்பட்ட வழிகாட்டல்.',
    
    // Roles
    roles: {
      learner: 'மாணவர் (Learner)',
      mentor: 'வழிகாட்டி (Mentor)',
      coordinator: 'ஒருங்கிணைப்பாளர் (Coordinator)',
    },
    roleSwitchNotice: 'செயலில் உள்ள பயனர் பார்வை',

    // Navigation
    nav: {
      overview: 'முகப்பு',
      roadmap: '6-வார வழிகாட்டி திட்டம்',
      sessions: 'நேரலை அமர்வுகள்',
      safeguarding: 'பாதுகாப்பு & உதவி',
      matching: 'இணைப்பு மேடை',
      mentors: 'வழிகாட்டிகள் சரிபார்ப்பு',
      analytics: 'வளர்ச்சி புள்ளிவிவரங்கள்',
    },

    // Tracks
    tracks: {
      trackA: 'பிரிவு A: கல்வி மற்றும் தொழில் வழிகாட்டுதல்',
      trackADesc: 'உயர்கல்வி வாய்ப்புகள் மற்றும் தொழில் பாதைகளை ஆராய்ந்து தனிப்பயன் கற்றல் திட்டத்தை உருவாக்குங்கள்.',
      trackB: 'பிரிவு B: டிஜிட்டல் திறன்கள் & மென்பொருள் துறை',
      trackBDesc: 'நிரலாக்க அடிப்படைகள், கிளவுட் & தரவு தொழில்நுட்பங்கள் மற்றும் நேரடி செயல்திட்டங்கள்.',
      trackC: 'பிரிவு C: தொடர்புத் திறன் & தொழில் தயார்நிலை',
      trackCDesc: 'ஆங்கில உரையாடல் பயிற்சி, பயோடேட்டா தயாரிப்பு மற்றும் நேர்காணல் எதிர்கொள்ளும் தன்னம்பிக்கை.',
    },

    // Learner Dashboard
    learner: {
      welcome: 'வணக்கம்,',
      partnerCollege: 'இணைப்பு கல்லூரி / நிறுவனம்',
      district: 'மாவட்டம்',
      assignedMentor: 'உங்கள் வழிகாட்டி',
      noMentorAssigned: 'உங்களுக்கான வழிகாட்டியை ஒருங்கிணைப்பாளர் விரைவில் இணைப்பார்.',
      mentorLocation: 'இடம் & நேர மண்டலம்',
      languages: 'மொழிகள்',
      roadmapTitle: 'உங்கள் 6-வார கற்றல் பயணம்',
      roadmapSubtitle: 'ஒவ்வொரு வாரமும் உங்கள் வழிகாட்டியுடன் பணிகளை முடித்து முன்னேறுங்கள்.',
      upcomingSession: 'வரவிருக்கும் வழிகாட்டல் அமர்வு',
      noUpcomingSession: 'அடுத்த அமர்வு இன்னும் திட்டமிடப்படவில்லை. உங்கள் வழிகாட்டியுடன் நேரத்தை முடிவு செய்யுங்கள்.',
      joinGoogleMeet: 'கூகிள் மீட்டில் இணையுங்கள்',
      addToCalendar: 'நாட்காட்டியில் சேர்க்கவும் (.ics)',
      scheduleNew: 'நேரத்தை முன்மொழியவும்',
      taskSubmission: 'பணி சமர்ப்பிப்பு & குறிப்புகள்',
      submitTaskBtn: 'பணியை சமர்ப்பிக்கவும்',
      taskSubmitted: 'சமர்ப்பிக்கப்பட்டது — வழிகாட்டி மதிப்பாய்வு செய்கிறார்',
      taskVerified: 'வழிகாட்டியால் அங்கீகரிக்கப்பட்டது',
      mentorNotes: 'வழிகாட்டியின் கருத்துகள் & அடுத்த கட்டம்',
      reportConcern: 'வழிகாட்டியை மாற்ற கோரிக்கை / கவலையை பதிவு செய்க',
      reportNotice: 'முழுமையான ரகசியத்தன்மை மற்றும் மாணவர் நலன் உறுதி செய்யப்படுகிறது.',
    },

    // Mentor Dashboard
    mentor: {
      welcome: 'வழிகாட்டி தளம்',
      vettingStatus: 'சரிபார்ப்பு நிலை',
      verifiedVolunteer: 'சரிபார்க்கப்பட்ட தன்னார்வலர்',
      pendingVetting: 'ஒருங்கிணைப்பாளர் ஆய்வில் உள்ளது',
      safeguardingCharter: 'பாதுகாப்பு சாசனம் கையொப்பமிடப்பட்டது',
      timezoneNotice: 'உங்கள் நேர மண்டலம்',
      istEquiv: 'மாணவர் நேரம் எப்போதும் இந்திய நேரம் (IST, UTC+5:30)',
      activeMentees: 'உங்களுக்கு ஒதுக்கப்பட்ட மாணவர்கள்',
      logSession: 'அமர்வை பதிவு செய்க',
      reviewMilestone: 'மாணவர் பணிகளை மதிப்பாய்வு செய்க',
      provideFeedback: 'ஆக்கபூர்வமான கருத்துக்களை பகிரவும்',
      commitmentHours: 'வாராந்திர நேரம்',
      hoursPerWeek: 'மணி / வாரம்',
    },

    // Coordinator Dashboard
    coordinator: {
      dashboardTitle: 'திட்டம் மற்றும் பாதுகாப்பு நிர்வாகம்',
      stats: {
        enrolledLearners: 'பதிவு செய்த மாணவர்கள்',
        verifiedMentors: 'சரிபார்க்கப்பட்ட வழிகாட்டிகள்',
        activePairings: 'செயலில் உள்ள இணைப்புகள்',
        sessionsHeld: 'நடைபெற்ற அமர்வுகள்',
        openConcerns: 'பாதுகாப்பு புகார்கள்',
      },
      matchWorkbench: 'ஒருங்கிணைப்பாளர் இணைப்பு மேடை',
      matchWorkbenchDesc: 'பாடப்பிரிவு, மொழி மற்றும் நேர மண்டல பொருத்தம் அடிப்படையில் மாணவர்களையும் வழிகாட்டிகளையும் இணையுங்கள்.',
      matchAction: 'இணைப்பை உறுதி செய்',
      unmatchedStudents: 'இணைக்கப்படாத மாணவர்கள்',
      approvedMentors: 'தயாராக உள்ள வழிகாட்டிகள்',
      vettingTab: 'வழிகாட்டி சரிபார்ப்பு',
      safeguardingQueue: 'பாதுகாப்பு & புகார் தீர்வு வரிசை',
      safeguardingDesc: 'அனைத்து புகார்களும் பாதுகாப்பு பொறுப்பாளரால் ரகசியமாக விசாரிக்கப்படும்.',
      cohortMetrics: 'குழு முன்னேற்றம் & வருகை',
      exportReport: 'அறிக்கையை பதிவிறக்கு (CSV)',
    },

    // Common & Scheduling
    common: {
      week: 'வாரம்',
      status: 'நிலை',
      actions: 'செயல்கள்',
      cancel: 'ரத்து செய்',
      confirm: 'உறுதி செய்',
      save: 'சேமி',
      close: 'மூடு',
      submit: 'சமர்ப்பி',
      verified: 'சரிபார்க்கப்பட்டது',
      pending: 'நிலுவையில்',
      completed: 'நிறைவுற்றது',
      scheduled: 'திட்டமிடப்பட்டது',
      timezone: 'நேர மண்டலம்',
      indiaTime: 'இந்திய நேரம் (IST)',
      mentorTime: 'வழிகாட்டி உள்ளூர் நேரம்',
      duration: '45 நிமிடங்கள்',
      confidential: 'முற்றிலும் ரகசியமானது',
      switchView: 'பார்வையை மாற்றவும்',
      languageToggle: 'மொழி',
    },
  },
};

export const getTranslation = (lang: Language) => translations[lang] || translations.en;
