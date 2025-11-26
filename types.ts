
export enum DayType {
  WORK = 'WORK',
  OFF = 'OFF',
}

export enum QuestPriority {
  LOW = 'LOW',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Quest {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  priority: QuestPriority;
  completed: boolean;
}

export interface ScheduleItem {
  id: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  activity: string;
  duration?: number; // Optional helper
  completed?: boolean; // New field for task tracking
}

export interface TemplateCategory {
  id: string;
  name: string;
  baseType: DayType; // Determines if it counts as work or off for stats/AI
  color: string; // CSS class for border/text
}

export interface Template {
  id: string;
  name: string;
  categoryId: string; // Link to Category
  items: ScheduleItem[];
  // Legacy support or cache
  color?: string; 
}

export interface CalendarEntry {
  date: string; // YYYY-MM-DD
  templateId: string;
  customItems?: ScheduleItem[]; // If user modified the template for this specific day
  notes?: string;
}

export interface AIGenerationRequest {
  type: DayType;
  focus?: string; // e.g., "Deep Work", "Relaxation", "House Chores"
}

export interface PomodoroSession {
  id: string;
  timestamp: number; // Epoch ms
  durationMinutes: number;
  type: 'WORK' | 'BREAK';
  questId?: string; // Optional link to a specific quest
}

export interface LongTermGoal {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
}

export interface UserProfile {
  username: string;
  tagline: string; // e.g. "Netrunner lvl 1"
  xp: number;
  longTermGoals: LongTermGoal[];
  theme?: 'light' | 'dark';
  fontScale?: number; // 0.8 to 1.5
  currentStreak?: number;
  longestStreak?: number;
}

export interface BackupData {
  version: number;
  categories: TemplateCategory[];
  templates: Template[];
  entries: CalendarEntry[];
  quests: Quest[];
  pomodoroHistory: PomodoroSession[];
  profile: UserProfile;
}