import { Mentor, MentoringSession } from '../types';

export interface DualTimeDisplay {
  istTime: string;
  istDate: string;
  mentorTime: string;
  mentorDate: string;
  timeDiffDescription: string;
}

export function formatDualTime(utcString: string, mentorTimezone: string): DualTimeDisplay {
  const date = new Date(utcString);

  // India Standard Time (IST)
  const istFormatterDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const istFormatterTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Mentor's local timezone
  const mentorFormatterDate = new Intl.DateTimeFormat('en-US', {
    timeZone: mentorTimezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const mentorFormatterTime = new Intl.DateTimeFormat('en-US', {
    timeZone: mentorTimezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const istDate = istFormatterDate.format(date);
  const istTime = istFormatterTime.format(date) + ' IST';

  let mentorDate = istDate;
  let mentorTime = istTime;

  try {
    mentorDate = mentorFormatterDate.format(date);
    mentorTime = mentorFormatterTime.format(date);
  } catch (err) {
    console.error('Timezone format error:', err);
  }

  // Calculate approximate offset description
  let timeDiffDescription = 'Coordinated times';
  try {
    const istOffset = 5.5; // IST is UTC+5.5
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: mentorTimezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
    timeDiffDescription = `Learner: IST (UTC+5:30) · Mentor: ${tzPart || mentorTimezone}`;
  } catch {
    timeDiffDescription = `Learner: IST (UTC+5:30) · Mentor: ${mentorTimezone}`;
  }

  return {
    istDate,
    istTime,
    mentorDate,
    mentorTime,
    timeDiffDescription,
  };
}

export function generateIcsCalendar(session: MentoringSession, learnerName: string, mentor: Mentor): void {
  const startDate = new Date(session.scheduledTimeUTC);
  const endDate = new Date(startDate.getTime() + session.durationMinutes * 60000);

  const formatIcsDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kalvi Connect//Mentorship Session//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:kalvi-session-${session.id}@kalviconnect.org`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:Kalvi Connect: Mentoring Week ${session.weekNumber} (${learnerName} & ${mentor.name})`,
    `DESCRIPTION:Structured 45-minute Kalvi Connect session.\\n\\nLearner: ${learnerName}\\nMentor: ${mentor.name} (${mentor.role})\\nMeeting Link: ${session.meetingLink}\\n\\nCode of Conduct: Professional, safe, and focused guidance.`,
    `LOCATION:${session.meetingLink}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `kalvi-session-week-${session.weekNumber}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST - UTC+5:30)' },
  { value: 'Asia/Singapore', label: 'Singapore / Malaysia (SGT - UTC+8:00)' },
  { value: 'Asia/Dubai', label: 'UAE / Gulf (GST - UTC+4:00)' },
  { value: 'Europe/London', label: 'United Kingdom (GMT/BST - UTC+1:00)' },
  { value: 'Europe/Berlin', label: 'Central Europe (CET/CEST - UTC+2:00)' },
  { value: 'America/New_York', label: 'US Eastern (EDT/EST - UTC-4:00)' },
  { value: 'America/Chicago', label: 'US Central (CDT/CST - UTC-5:00)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (PDT/PST - UTC-7:00)' },
  { value: 'Australia/Sydney', label: 'Australia Eastern (AEST - UTC+10:00)' },
];
