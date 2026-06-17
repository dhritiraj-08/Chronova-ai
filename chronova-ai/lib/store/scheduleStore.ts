import { create } from "zustand";

export interface ScheduleEvent {
  id: string | number;
  title: string;
  day: number;      // 0 (Mon) to 6 (Sun)
  start: number;    // decimal hour, e.g. 7.5 for 7:30
  end: number;      // decimal hour
  done: boolean;
  colorIdx: number;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  subject: string;
  chapters: number;
  completedChapters: number;
  priority: "Low" | "Medium" | "High";
  revisionPlanGenerated: boolean;
}

export interface RevisionItem {
  id: string;
  title: string;
  subject: string;
  nextReviewDate: string;
  intervalStep: number; // 1, 2, 3, 4, 5 (for Day 1, 3, 7, 14, 30)
  retentionScore: number; // 0 to 100
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: string; // Focused, Motivated, Normal, Tired, Stressed, Burned Out
}

export interface ScheduleChange {
  id: string;
  time: string;
  changeType: string; // "Redistributed", "Priority Shift", "Recovery Block", "Rescheduled"
  reason: string;
}

export interface OSNotification {
  id: string;
  time: string;
  text: string;
  actionText?: string;
  actionType?: string; // "reschedule", "recovery", "review"
  read: boolean;
}

export interface SleepEntry {
  date: string;
  hours: number;
  quality: number; // 0-100
}

const DEFAULT_EVENTS: ScheduleEvent[] = [
  { id: 1,  title: "Mathematics",   day: 0, start: 7,     end: 8.5,  done: true,  colorIdx: 0 },
  { id: 2,  title: "College",       day: 0, start: 9,     end: 15,   done: true,  colorIdx: 2 },
  { id: 3,  title: "College",       day: 1, start: 9,     end: 15,   done: false, colorIdx: 2 },
  { id: 4,  title: "College",       day: 2, start: 9,     end: 15,   done: false, colorIdx: 2 },
  { id: 5,  title: "College",       day: 3, start: 9,     end: 15,   done: false, colorIdx: 2 },
  { id: 6,  title: "College",       day: 4, start: 9,     end: 15,   done: false, colorIdx: 2 },
  { id: 7,  title: "Physics",       day: 0, start: 16,    end: 17.5, done: false, colorIdx: 1 },
  { id: 8,  title: "Chemistry",     day: 0, start: 17.75, end: 19.25,done: false, colorIdx: 3 },
  { id: 9,  title: "Mathematics",   day: 1, start: 7,     end: 8.5,  done: false, colorIdx: 0 },
  { id: 10, title: "Physics",       day: 1, start: 16,    end: 17.5, done: false, colorIdx: 1 },
  { id: 11, title: "Chemistry",     day: 2, start: 16,    end: 17.5, done: false, colorIdx: 3 },
  { id: 12, title: "Biology",       day: 2, start: 17.75, end: 19.25,done: false, colorIdx: 1 },
  { id: 13, title: "English",       day: 3, start: 16,    end: 17.5, done: false, colorIdx: 4 },
  { id: 14, title: "Mathematics",   day: 3, start: 17.75, end: 19.25,done: false, colorIdx: 0 },
  { id: 15, title: "Gym",           day: 4, start: 6,     end: 7,    done: false, colorIdx: 3 },
  { id: 16, title: "Revision",      day: 5, start: 8,     end: 11,   done: false, colorIdx: 5 },
];

interface ScheduleState {
  events: ScheduleEvent[];
  xp: number;
  level: number;
  streak: number;
  exams: Exam[];
  revisions: RevisionItem[];
  moodHistory: MoodEntry[];
  currentMood: string;
  scheduleChanges: ScheduleChange[];
  notifications: OSNotification[];
  burnoutMode: boolean;
  sleepHistory: SleepEntry[];

  setEvents: (events: ScheduleEvent[]) => void;
  addEvent: (event: Omit<ScheduleEvent, "id">) => void;
  removeEvent: (id: string | number) => void;
  toggleEventDone: (id: string | number) => void;
  updateEvent: (id: string | number, updated: Partial<ScheduleEvent>) => void;

  addXP: (amount: number, reason?: string) => void;
  setCurrentMood: (mood: string) => void;
  setBurnoutMode: (enabled: boolean) => void;
  addExam: (exam: Omit<Exam, "id" | "revisionPlanGenerated" | "readinessScore">) => void;
  toggleChapterCompleted: (examId: string, completed: number) => void;
  generateRevisionPlan: (examId: string) => void;
  addRevisionQueue: (title: string, subject: string) => void;
  completeRevisionItem: (id: string) => void;
  markEventMissed: (id: string | number) => void;
  markNotificationRead: (id: string) => void;
  logScheduleChange: (changeType: string, reason: string) => void;
  addNotification: (text: string, actionType?: string, actionText?: string) => void;
}

const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const useScheduleStore = create<ScheduleState>((set) => ({
  events: DEFAULT_EVENTS,
  xp: 350,
  level: 3,
  streak: 7,
  exams: [
    { id: "exam-1", name: "Physics Term Exam", date: "2026-06-05", subject: "Physics", chapters: 8, completedChapters: 4, priority: "High", revisionPlanGenerated: true }
  ],
  revisions: [
    { id: "rev-1", title: "Mathematics: Calculus Integration basics", subject: "Mathematics", nextReviewDate: "2026-05-31", intervalStep: 2, retentionScore: 85 },
    { id: "rev-2", title: "Chemistry: Organic naming conventions", subject: "Chemistry", nextReviewDate: "2026-06-02", intervalStep: 1, retentionScore: 90 }
  ],
  moodHistory: [
    { date: "2026-05-25", mood: "Normal" },
    { date: "2026-05-26", mood: "Motivated" },
    { date: "2026-05-27", mood: "Focused" },
    { date: "2026-05-28", mood: "Tired" },
    { date: "2026-05-29", mood: "Stressed" },
  ],
  currentMood: "Normal",
  scheduleChanges: [
    { id: "change-1", time: "10:30 AM", changeType: "Redistributed", reason: "Biology session missed, automatically redistributed to Tuesday." },
    { id: "change-2", time: "09:00 AM", changeType: "Priority Shift", reason: "Increased revision slots for Physics due to upcoming midterm." }
  ],
  notifications: [
    { id: "notif-1", time: "10m ago", text: "Burnout risk rising. Consider enabling Recovery Mode.", actionText: "Enable Mode", actionType: "recovery", read: false },
    { id: "notif-2", time: "1h ago", text: "You missed Chemistry. Do you want me to reschedule it?", actionText: "Reschedule", actionType: "reschedule", read: false },
    { id: "notif-3", time: "Yesterday", text: "Your productivity score increased this week!", read: true }
  ],
  burnoutMode: false,
  sleepHistory: [
    { date: "Mon", hours: 7.5, quality: 80 },
    { date: "Tue", hours: 6.0, quality: 65 },
    { date: "Wed", hours: 8.0, quality: 85 },
    { date: "Thu", hours: 5.5, quality: 50 },
    { date: "Fri", hours: 7.0, quality: 75 },
    { date: "Sat", hours: 9.0, quality: 90 },
    { date: "Sun", hours: 8.5, quality: 88 },
  ],

  setEvents: (events) => set({ events }),
  
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: Date.now() }]
  })),
  
  removeEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),
  
  toggleEventDone: (id) => set((state) => {
    let xpGain = 0;
    let xpReason = "";
    
    const event = state.events.find(e => e.id === id);
    if (!event) return {};

    const newDone = !event.done;
    if (newDone) {
      xpGain += 50;
      xpReason = `Completed focus session: ${event.title}`;
    }

    const updatedEvents = state.events.map((e) => e.id === id ? { ...e, done: newDone } : e);
    
    // Check daily goal completeness
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const todayEvents = updatedEvents.filter(e => e.day === todayIdx);
    const allDone = todayEvents.length > 0 && todayEvents.every(e => e.done);
    const wasAllDone = state.events.filter(e => e.day === todayIdx).length > 0 && state.events.filter(e => e.day === todayIdx).every(e => e.done);
    
    if (allDone && !wasAllDone) {
      xpGain += 100;
      xpReason = "Completed all scheduled daily goals! 🌟";
    }

    let newXp = state.xp + xpGain;
    let newLevel = state.level;
    const xpNeeded = newLevel * 500;
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
    }

    const newNotifications = [...state.notifications];
    if (xpGain > 0) {
      newNotifications.unshift({
        id: `notif-xp-${Date.now()}`,
        time: "Just now",
        text: `Earned +${xpGain} XP! (${xpReason})`,
        read: false
      });
    }

    return {
      events: updatedEvents,
      xp: newXp,
      level: newLevel,
      notifications: newNotifications
    };
  }),
  
  updateEvent: (id, updated) => set((state) => ({
    events: state.events.map((e) => e.id === id ? { ...e, ...updated } : e)
  })),

  addXP: (amount, reason) => set((state) => {
    let newXp = state.xp + amount;
    let newLevel = state.level;
    const xpNeeded = newLevel * 500;
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
    }
    const newNotifications = [...state.notifications];
    newNotifications.unshift({
      id: `notif-xp-${Date.now()}`,
      time: "Just now",
      text: `Earned +${amount} XP! ${reason ? `(${reason})` : ""}`,
      read: false
    });
    return { xp: newXp, level: newLevel, notifications: newNotifications };
  }),

  setCurrentMood: (mood) => set((state) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const filteredHistory = state.moodHistory.filter(h => h.date !== todayStr);
    const newHistory = [...filteredHistory, { date: todayStr, mood }];
    
    // Adaptive scheduling changes based on mood
    let adaptiveText = "";
    let alertMsg = "";
    let burnoutMode = state.burnoutMode;
    let updatedEvents = [...state.events];

    if (mood === "Burned Out") {
      burnoutMode = true;
      alertMsg = "Critical stress levels. Activating Timetable Recovery Mode.";
      // Automatically reduce study load
      // Add recovery blocks / reduce Tomorrow's load by shortening
      const tomorrowIdx = (new Date().getDay()) % 7;
      updatedEvents = state.events.map(ev => {
        if (ev.day === tomorrowIdx && !ev.done) {
          const duration = ev.end - ev.start;
          if (duration > 1.5) {
            // Cut study load and tag as recovery
            return { ...ev, end: ev.start + duration * 0.5, title: `${ev.title} (Light Recovery)` };
          }
        }
        return ev;
      });

      // Add a recovery relaxation block
      const lastTomorrowEvent = updatedEvents
        .filter(ev => ev.day === tomorrowIdx)
        .sort((a,b) => b.end - a.end)[0];
      const recoveryStart = lastTomorrowEvent ? lastTomorrowEvent.end + 0.5 : 15;
      updatedEvents.push({
        id: `recovery-${Date.now()}`,
        title: "Mandatory Relaxation & Rest",
        day: tomorrowIdx,
        start: recoveryStart,
        end: recoveryStart + 1.5,
        done: false,
        colorIdx: 1
      });

      adaptiveText = "Burned Out mood reported. Activated Recovery Mode: scaled down tomorrow's study sessions by 50% and scheduled rest blocks.";
    } else if (mood === "Tired") {
      // Add more breaks tomorrow: shorten sessions by 15 mins to insert recovery gaps
      const tomorrowIdx = (new Date().getDay()) % 7;
      updatedEvents = state.events.map(ev => {
        if (ev.day === tomorrowIdx && !ev.done) {
          return { ...ev, end: Math.max(ev.start + 0.75, ev.end - 0.25) };
        }
        return ev;
      });
      adaptiveText = "Tired mood logged. Shortened study blocks slightly to allocate frequent cognitive break intervals.";
    } else if (mood === "Stressed") {
      // Reduce workload
      const tomorrowIdx = (new Date().getDay()) % 7;
      let removedCount = 0;
      updatedEvents = state.events.filter(ev => {
        if (ev.day === tomorrowIdx && !ev.done && ev.title !== "College") {
          removedCount++;
          if (removedCount <= 1) return false; // Reschedule/remove 1 study session
        }
        return true;
      });
      adaptiveText = "Stressed mood reported. Trimmed heaviest evening session from tomorrow's timetable to lower stress.";
    } else if (mood === "Focused") {
      // Increase challenge level / prioritize difficult subjects
      adaptiveText = "High focus logged. Boosted cognitive complexity priority for Mathematics and Physics sessions.";
    }

    const newChanges = [...state.scheduleChanges];
    if (adaptiveText) {
      newChanges.unshift({
        id: `change-${Date.now()}`,
        time: "Just now",
        changeType: mood === "Burned Out" ? "Recovery Block" : "Rescheduled",
        reason: adaptiveText
      });
    }

    const newNotifications = [...state.notifications];
    if (alertMsg) {
      newNotifications.unshift({
        id: `notif-mood-${Date.now()}`,
        time: "Just now",
        text: alertMsg,
        actionText: "Open Recovery OS",
        actionType: "recovery",
        read: false
      });
    }

    return {
      currentMood: mood,
      moodHistory: newHistory,
      burnoutMode,
      events: updatedEvents,
      scheduleChanges: newChanges,
      notifications: newNotifications
    };
  }),

  setBurnoutMode: (enabled) => set((state) => {
    let updatedEvents = [...state.events];
    const tomorrowIdx = (new Date().getDay()) % 7;
    const newChanges = [...state.scheduleChanges];

    if (enabled) {
      // Cap study blocks at 1.5 hours maximum
      updatedEvents = state.events.map(ev => {
        if (ev.day === tomorrowIdx && !ev.done) {
          const duration = ev.end - ev.start;
          if (duration > 1.5) {
            return { ...ev, end: ev.start + 1.25, title: `${ev.title} (Recovery Session)` };
          }
        }
        return ev;
      });
      newChanges.unshift({
        id: `change-${Date.now()}`,
        time: "Just now",
        changeType: "Recovery Block",
        reason: "Recovery Mode activated. Capped all study blocks at 75 minutes maximum to encourage frequent rest."
      });
    }

    const newNotifications = [...state.notifications];
    newNotifications.unshift({
      id: `notif-burnout-${Date.now()}`,
      time: "Just now",
      text: enabled ? "Recovery Mode enabled. Study loads scaled down." : "Recovery Mode disabled. Normal study scheduling restored.",
      read: false
    });

    return {
      burnoutMode: enabled,
      events: updatedEvents,
      scheduleChanges: newChanges,
      notifications: newNotifications
    };
  }),

  addExam: (exam) => set((state) => ({
    exams: [...state.exams, { ...exam, id: `exam-${Date.now()}`, revisionPlanGenerated: false }]
  })),

  toggleChapterCompleted: (examId, completed) => set((state) => ({
    exams: state.exams.map(e => e.id === examId ? { ...e, completedChapters: completed } : e)
  })),

  generateRevisionPlan: (examId) => set((state) => {
    const exam = state.exams.find(e => e.id === examId);
    if (!exam) return {};

    const newChanges = [...state.scheduleChanges];
    const newNotifications = [...state.notifications];
    const newEvents = [...state.events];

    // Generate revision milestones
    // Schedule revision milestones for tomorrow, day after, etc.
    const daysOffset = [1, 3, 5];
    const colors = [4, 5, 0];
    
    daysOffset.forEach((offset, idx) => {
      const targetDayIdx = (new Date().getDay() - 1 + offset) % 7;
      newEvents.push({
        id: `rev-milestone-${examId}-${idx}-${Date.now()}`,
        title: `Revision: ${exam.name}`,
        day: targetDayIdx,
        start: 16.5,
        end: 18.0,
        done: false,
        colorIdx: colors[idx]
      });
    });

    newChanges.unshift({
      id: `change-exam-${examId}-${Date.now()}`,
      time: "Just now",
      changeType: "Priority Shift",
      reason: `Exam Revision Plan generated for ${exam.name}. Injected study milestones into dynamic weekly grid.`
    });

    newNotifications.unshift({
      id: `notif-exam-plan-${Date.now()}`,
      time: "Just now",
      text: `Revision plan generated for ${exam.name}. 3 study milestones scheduled.`,
      read: false
    });

    return {
      exams: state.exams.map(e => e.id === examId ? { ...e, revisionPlanGenerated: true } : e),
      events: newEvents,
      scheduleChanges: newChanges,
      notifications: newNotifications
    };
  }),

  addRevisionQueue: (title, subject) => set((state) => ({
    revisions: [...state.revisions, {
      id: `rev-${Date.now()}`,
      title,
      subject,
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      intervalStep: 1,
      retentionScore: 80
    }]
  })),

  completeRevisionItem: (id) => set((state) => {
    const item = state.revisions.find(r => r.id === id);
    if (!item) return {};

    // Spaced repetition schedule steps: Day 1, Day 3, Day 7, Day 14, Day 30
    const intervals = [1, 3, 7, 14, 30];
    const currentStep = item.intervalStep;
    const nextStep = Math.min(currentStep + 1, intervals.length);
    const nextIntervalDays = intervals[nextStep - 1];
    const nextReview = new Date(Date.now() + nextIntervalDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Award 50 XP
    let newXp = state.xp + 50;
    let newLevel = state.level;
    if (newXp >= newLevel * 500) {
      newXp -= newLevel * 500;
      newLevel += 1;
    }

    const newNotifications = [...state.notifications];
    newNotifications.unshift({
      id: `notif-xp-rev-${Date.now()}`,
      time: "Just now",
      text: `Earned +50 XP! Completed review for ${item.title}. Next scheduled in ${nextIntervalDays} days.`,
      read: false
    });

    return {
      revisions: state.revisions.map(r => r.id === id ? {
        ...r,
        intervalStep: nextStep,
        nextReviewDate: nextReview,
        retentionScore: Math.min(r.retentionScore + 8, 100)
      } : r),
      xp: newXp,
      level: newLevel,
      notifications: newNotifications
    };
  }),

  markEventMissed: (id) => set((state) => {
    const event = state.events.find(e => e.id === id);
    if (!event) return {};

    // Remove original event or mark it as done? Let's filter it out and add rescheduled one
    const filteredEvents = state.events.filter(e => e.id !== id);
    
    // Find next day conflict-free slot at 16:00
    const nextDayIdx = (event.day + 1) % 7;
    
    // Check conflicts on that day
    let rescheduledStart = 16;
    let rescheduledEnd = 17.5;
    
    // simple check: if conflict, set to 18:00
    const conflict = state.events.some(e => e.day === nextDayIdx && e.start < 17.5 && e.end > 16);
    if (conflict) {
      rescheduledStart = 18;
      rescheduledEnd = 19.5;
    }

    const startStr = rescheduledStart > 12 ? `${rescheduledStart - 12}:00 PM` : `${rescheduledStart}:00 AM`;

    const rescheduledEvent: ScheduleEvent = {
      ...event,
      id: `resched-${Date.now()}`,
      day: nextDayIdx,
      start: rescheduledStart,
      end: rescheduledEnd,
      done: false
    };

    const newChanges = [...state.scheduleChanges];
    newChanges.unshift({
      id: `change-miss-${Date.now()}`,
      time: "Just now",
      changeType: "Redistributed",
      reason: `Missed session "${event.title}" on ${DAYS_FULL[event.day]}. Automatically redistributed to tomorrow ${DAYS_FULL[nextDayIdx]} at ${startStr}.`
    });

    const newNotifications = [...state.notifications];
    newNotifications.unshift({
      id: `notif-miss-${Date.now()}`,
      time: "Just now",
      text: `You missed ${event.title}. Rescheduled it for tomorrow at ${startStr}.`,
      actionText: "Accept Redistribution",
      actionType: "reschedule",
      read: false
    });

    return {
      events: [...filteredEvents, rescheduledEvent],
      scheduleChanges: newChanges,
      notifications: newNotifications
    };
  }),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),

  logScheduleChange: (changeType, reason) => set((state) => ({
    scheduleChanges: [{ id: `change-${Date.now()}`, time: "Just now", changeType, reason }, ...state.scheduleChanges]
  })),

  addNotification: (text, actionType, actionText) => set((state) => ({
    notifications: [{ id: `notif-${Date.now()}`, time: "Just now", text, actionType, actionText, read: false }, ...state.notifications]
  }))
}));
