import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  FileText,
  Languages,
  MapPin,
  Menu,
  Moon,
  Pause,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react';
import {
  AppSurface,
  GlassPanel,
  IconButton,
  SearchInput,
  SegmentButton,
  TextButton,
} from './components/ui';

type Locale = 'ja' | 'en';
type ThemePreference = 'light' | 'dark' | 'system';
type ViewMode = 'day' | 'week' | 'month';
type SheetKind = 'menu' | 'create' | 'settings' | 'today' | 'profile';
type EventTone =
  | 'blue'
  | 'green'
  | 'purple'
  | 'yellow'
  | 'indigo'
  | 'pink'
  | 'teal'
  | 'cyan'
  | 'red'
  | 'orange';

interface CalendarEvent {
  id: string;
  title: Record<Locale, string>;
  startTime: string;
  endTime: string;
  tone: EventTone;
  day: number;
  description: Record<Locale, string>;
  location: Record<Locale, string>;
  attendees: Record<Locale, string[]>;
  organizer: Record<Locale, string>;
}

interface EventPlacement {
  day: number;
  startTime: string;
  endTime: string;
}

interface CalendarMonth {
  year: number;
  month: number;
  activeDate: number;
}

const themeKey = 'melius-official-app-calendar-command-theme';
const localeKey = 'melius-official-app-calendar-command-locale';

const copy = {
  ja: {
    appName: 'Calendar',
    search: '予定を検索',
    create: '作成',
    quickAdd: 'クイック追加',
    month: '2025年3月',
    currentDate: '3月5日',
    today: '今日',
    workspaceLabel: '業務カレンダー',
    agenda: {
      title: '今日の予定',
      subtitle: '3月5日 水曜日',
      week: '今週',
      events: '予定',
      focus: 'フォーカス',
      focusNote: '午後のレビューが連続しています',
      next: '次の予定',
      assistant: 'Focus assist',
    },
    sheets: {
      common: {
        close: '閉じる',
        cancel: 'キャンセル',
        save: '保存',
        open: '開く',
      },
      menu: {
        title: 'ワークスペース',
        subtitle: '予定、チーム、空き時間を切り替えます',
        items: ['カレンダー', 'チーム予定', '空き時間', '分析'],
        section: 'クイック操作',
        actions: ['共有リンクを作成', '外部カレンダーを同期', '通知ルールを確認'],
      },
      create: {
        title: '予定を作成',
        subtitle: '業務予定の下書きを作成します',
        eventTitle: '予定名',
        eventTitleValue: '四半期レビュー',
        calendar: 'カレンダー',
        date: '日付',
        time: '時間',
        guests: '参加者',
        room: '場所',
        notes: 'メモ',
        notesValue: '資料確認と次のアクション整理。',
        templates: 'テンプレート',
        templateItems: ['会議', 'レビュー', '1on1'],
      },
      search: {
        title: '予定を検索',
        subtitle: '予定名、場所、参加者で絞り込み',
        placeholder: '検索キーワード',
        results: '検索結果',
        empty: '一致する予定はありません',
      },
      settings: {
        title: '表示設定',
        subtitle: '作業スタイルに合わせてカレンダーを調整します',
        appearance: '外観',
        density: '密度',
        densityItems: ['標準', 'コンパクト', '広め'],
        notifications: '通知',
        notificationItems: ['会議10分前', '日次サマリー', '集中時間を保護'],
        timezone: 'タイムゾーン',
        workHours: '勤務時間',
      },
      today: {
        title: '今日の運用ビュー',
        subtitle: '3月5日の予定と集中時間',
        workload: '会議時間',
        available: '空き時間',
        conflict: '注意',
        conflictValue: '14:00台にレビューが重なっています',
        timeline: 'タイムライン',
      },
      profile: {
        title: 'アカウント',
        subtitle: '個人設定と同期状況',
        role: 'Workspace Admin',
        plan: 'Business',
        sync: 'Google Calendar 同期済み',
        status: '通知は有効です',
      },
    },
    myCalendars: 'マイカレンダー',
    views: {
      day: '日',
      week: '週',
      month: '月',
    },
    weekDays: ['日', '月', '火', '水', '木', '金', '土'],
    miniWeekDays: ['日', '月', '火', '水', '木', '金', '土'],
    calendars: ['個人', '仕事', 'プロジェクト', '家族'],
    assistant: {
      prompt:
        '今日は会議が少なめです。集中モードに入れるよう、作業用プレイリストを流しますか？',
      yes: '再生する',
      no: '閉じる',
      pause: 'プレイリストを一時停止',
    },
    detail: {
      time: '時間',
      location: '場所',
      date: '日付',
      attendees: '参加者',
      organizer: '主催者',
      description: '詳細',
      close: '閉じる',
    },
    theme: {
      light: 'ライト',
      dark: 'ダーク',
    },
    localeToggle: 'English',
  },
  en: {
    appName: 'Calendar',
    search: 'Search',
    create: 'Create',
    quickAdd: 'Quick add',
    month: 'March 2025',
    currentDate: 'March 5',
    today: 'Today',
    workspaceLabel: 'Business calendar',
    agenda: {
      title: "Today's schedule",
      subtitle: 'Wednesday, March 5',
      week: 'This week',
      events: 'Events',
      focus: 'Focus',
      focusNote: 'Reviews are clustered this afternoon',
      next: 'Up next',
      assistant: 'Focus assist',
    },
    sheets: {
      common: {
        close: 'Close',
        cancel: 'Cancel',
        save: 'Save',
        open: 'Open',
      },
      menu: {
        title: 'Workspace',
        subtitle: 'Switch between schedule, teams, and availability',
        items: ['Calendar', 'Team schedule', 'Availability', 'Insights'],
        section: 'Quick actions',
        actions: ['Create share link', 'Sync external calendar', 'Review notification rules'],
      },
      create: {
        title: 'Create event',
        subtitle: 'Draft a business calendar event',
        eventTitle: 'Event title',
        eventTitleValue: 'Quarterly review',
        calendar: 'Calendar',
        date: 'Date',
        time: 'Time',
        guests: 'Guests',
        room: 'Location',
        notes: 'Notes',
        notesValue: 'Review materials and align next actions.',
        templates: 'Templates',
        templateItems: ['Meeting', 'Review', '1:1'],
      },
      search: {
        title: 'Search events',
        subtitle: 'Filter by title, location, or attendees',
        placeholder: 'Search keyword',
        results: 'Results',
        empty: 'No matching events',
      },
      settings: {
        title: 'Display settings',
        subtitle: 'Tune the calendar for your working style',
        appearance: 'Appearance',
        density: 'Density',
        densityItems: ['Default', 'Compact', 'Spacious'],
        notifications: 'Notifications',
        notificationItems: ['10 min before meetings', 'Daily summary', 'Protect focus time'],
        timezone: 'Timezone',
        workHours: 'Working hours',
      },
      today: {
        title: 'Today operations',
        subtitle: 'March 5 schedule and focus time',
        workload: 'Meeting load',
        available: 'Available',
        conflict: 'Watch',
        conflictValue: 'Reviews are stacked around 2 PM',
        timeline: 'Timeline',
      },
      profile: {
        title: 'Account',
        subtitle: 'Personal settings and sync status',
        role: 'Workspace Admin',
        plan: 'Business',
        sync: 'Google Calendar synced',
        status: 'Notifications enabled',
      },
    },
    myCalendars: 'My calendars',
    views: {
      day: 'Day',
      week: 'Week',
      month: 'Month',
    },
    weekDays: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    miniWeekDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    calendars: ['My Calendar', 'Work', 'Projects', 'Family'],
    assistant: {
      prompt:
        "Looks like you don't have many meetings today. Shall I play a focus playlist to help you get into flow state?",
      yes: 'Yes',
      no: 'No',
      pause: 'Pause focus playlist',
    },
    detail: {
      time: 'Time',
      location: 'Location',
      date: 'Date',
      attendees: 'Attendees',
      organizer: 'Organizer',
      description: 'Description',
      close: 'Close',
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
    },
    localeToggle: '日本語',
  },
} satisfies Record<Locale, Record<string, unknown>>;

const events: CalendarEvent[] = [
  {
    id: 'team-meeting',
    title: { ja: 'チーム定例', en: 'Team Meeting' },
    startTime: '09:00',
    endTime: '10:00',
    tone: 'blue',
    day: 1,
    description: { ja: '週次の進捗確認と今週の優先順位整理。', en: 'Weekly team sync-up.' },
    location: { ja: '会議室 A', en: 'Conference Room A' },
    attendees: { ja: ['プロダクトチーム', 'デザインチーム'], en: ['Product Team', 'Design Team'] },
    organizer: { ja: 'Mina', en: 'Mina' },
  },
  {
    id: 'lunch-with-sarah',
    title: { ja: 'Sarah とランチ', en: 'Lunch with Sarah' },
    startTime: '12:30',
    endTime: '13:30',
    tone: 'green',
    day: 1,
    description: { ja: 'ローンチ計画と制作スケジュールの相談。', en: 'Discuss project timeline.' },
    location: { ja: 'Cafe Nero', en: 'Cafe Nero' },
    attendees: { ja: ['Sarah Lee'], en: ['Sarah Lee'] },
    organizer: { ja: 'You', en: 'You' },
  },
  {
    id: 'product-planning',
    title: { ja: '製品計画', en: 'Product Planning' },
    startTime: '14:00',
    endTime: '15:30',
    tone: 'pink',
    day: 1,
    description: { ja: '次四半期のロードマップ整理。', en: 'Roadmap discussion for Q3.' },
    location: { ja: 'Strategy Room', en: 'Strategy Room' },
    attendees: { ja: ['Product Team', 'Engineering Leads'], en: ['Product Team', 'Engineering Leads'] },
    organizer: { ja: 'Product Manager', en: 'Product Manager' },
  },
  {
    id: 'morning-standup',
    title: { ja: '朝会', en: 'Morning Standup' },
    startTime: '08:30',
    endTime: '09:30',
    tone: 'blue',
    day: 2,
    description: { ja: '開発チームの日次確認。', en: 'Daily team standup.' },
    location: { ja: 'Slack Huddle', en: 'Slack Huddle' },
    attendees: { ja: ['Development Team'], en: ['Development Team'] },
    organizer: { ja: 'Scrum Master', en: 'Scrum Master' },
  },
  {
    id: 'client-call',
    title: { ja: 'クライアント通話', en: 'Client Call' },
    startTime: '10:00',
    endTime: '11:00',
    tone: 'yellow',
    day: 2,
    description: { ja: '主要クライアントとの四半期レビュー。', en: 'Quarterly review with a major client.' },
    location: { ja: 'Zoom Meeting', en: 'Zoom Meeting' },
    attendees: { ja: ['Client Team', 'Sales Team'], en: ['Client Team', 'Sales Team'] },
    organizer: { ja: 'Account Manager', en: 'Account Manager' },
  },
  {
    id: 'budget-review',
    title: { ja: '予算レビュー', en: 'Budget Review' },
    startTime: '13:30',
    endTime: '15:00',
    tone: 'yellow',
    day: 3,
    description: { ja: '四半期予算の確認と調整。', en: 'Quarterly budget analysis.' },
    location: { ja: 'Finance Office', en: 'Finance Office' },
    attendees: { ja: ['Finance Team', 'Department Heads'], en: ['Finance Team', 'Department Heads'] },
    organizer: { ja: 'CFO', en: 'CFO' },
  },
  {
    id: 'project-review',
    title: { ja: 'プロジェクト確認', en: 'Project Review' },
    startTime: '14:00',
    endTime: '15:30',
    tone: 'purple',
    day: 3,
    description: { ja: 'Q2プロジェクトの進捗レビュー。', en: 'Q2 project progress review.' },
    location: { ja: 'Meeting Room 3', en: 'Meeting Room 3' },
    attendees: { ja: ['Team Alpha', 'Stakeholders'], en: ['Team Alpha', 'Stakeholders'] },
    organizer: { ja: 'Project Manager', en: 'Project Manager' },
  },
  {
    id: 'team-training',
    title: { ja: 'チーム研修', en: 'Team Training' },
    startTime: '09:30',
    endTime: '11:30',
    tone: 'green',
    day: 4,
    description: { ja: '新しい業務ツールのオンボーディング。', en: 'New tool onboarding session.' },
    location: { ja: 'Training Room', en: 'Training Room' },
    attendees: { ja: ['All Departments'], en: ['All Departments'] },
    organizer: { ja: 'HR', en: 'HR' },
  },
  {
    id: 'brainstorm',
    title: { ja: 'ブレインストーム', en: 'Team Brainstorm' },
    startTime: '13:00',
    endTime: '14:30',
    tone: 'indigo',
    day: 4,
    description: { ja: '新機能アイデアの検討。', en: 'Ideation session for new product features.' },
    location: { ja: 'Creative Space', en: 'Creative Space' },
    attendees: { ja: ['Product Team', 'Design Team'], en: ['Product Team', 'Design Team'] },
    organizer: { ja: 'Product Owner', en: 'Product Owner' },
  },
  {
    id: 'product-demo',
    title: { ja: '製品デモ', en: 'Product Demo' },
    startTime: '11:00',
    endTime: '12:00',
    tone: 'pink',
    day: 5,
    description: { ja: 'ステークホルダー向けの新機能デモ。', en: 'Showcase new features to stakeholders.' },
    location: { ja: 'Demo Room', en: 'Demo Room' },
    attendees: { ja: ['Stakeholders', 'Dev Team'], en: ['Stakeholders', 'Dev Team'] },
    organizer: { ja: 'Tech Lead', en: 'Tech Lead' },
  },
  {
    id: 'design-review',
    title: { ja: 'デザインレビュー', en: 'Design Review' },
    startTime: '14:30',
    endTime: '15:45',
    tone: 'purple',
    day: 5,
    description: { ja: '新UIデザインの確認。', en: 'Review new UI designs.' },
    location: { ja: 'Design Lab', en: 'Design Lab' },
    attendees: { ja: ['UX Team', 'Product Manager'], en: ['UX Team', 'Product Manager'] },
    organizer: { ja: 'Lead Designer', en: 'Lead Designer' },
  },
  {
    id: 'client-presentation',
    title: { ja: '提案プレゼン', en: 'Client Presentation' },
    startTime: '11:00',
    endTime: '12:30',
    tone: 'orange',
    day: 6,
    description: { ja: '新規プロジェクト提案の発表。', en: 'Present new project proposal.' },
    location: { ja: 'Client Office', en: 'Client Office' },
    attendees: { ja: ['Sales Team', 'Client Representatives'], en: ['Sales Team', 'Client Representatives'] },
    organizer: { ja: 'Account Executive', en: 'Account Executive' },
  },
  {
    id: 'marketing-meeting',
    title: { ja: 'マーケ会議', en: 'Marketing Meeting' },
    startTime: '13:00',
    endTime: '14:00',
    tone: 'teal',
    day: 6,
    description: { ja: 'Q3マーケティング戦略の確認。', en: 'Discuss Q3 marketing strategy.' },
    location: { ja: 'Marketing Office', en: 'Marketing Office' },
    attendees: { ja: ['Marketing Team'], en: ['Marketing Team'] },
    organizer: { ja: 'Marketing Director', en: 'Marketing Director' },
  },
  {
    id: 'investor-meeting',
    title: { ja: '投資家ミーティング', en: 'Investor Meeting' },
    startTime: '10:30',
    endTime: '12:00',
    tone: 'red',
    day: 7,
    description: { ja: '四半期アップデートの共有。', en: 'Quarterly investor update.' },
    location: { ja: 'Board Room', en: 'Board Room' },
    attendees: { ja: ['Executive Team', 'Investors'], en: ['Executive Team', 'Investors'] },
    organizer: { ja: 'CEO', en: 'CEO' },
  },
  {
    id: 'code-review',
    title: { ja: 'コードレビュー', en: 'Code Review' },
    startTime: '15:00',
    endTime: '16:00',
    tone: 'cyan',
    day: 7,
    description: { ja: '新機能プルリクエストの確認。', en: 'Review pull requests for a new feature.' },
    location: { ja: 'Dev Area', en: 'Dev Area' },
    attendees: { ja: ['Dev Team'], en: ['Dev Team'] },
    organizer: { ja: 'Senior Developer', en: 'Senior Developer' },
  },
];

const calendarMonths: CalendarMonth[] = [
  { year: 2025, month: 1, activeDate: 5 },
  { year: 2025, month: 2, activeDate: 5 },
  { year: 2025, month: 3, activeDate: 5 },
  { year: 2025, month: 4, activeDate: 5 },
];
const timeSlots = Array.from({ length: 9 }, (_, index) => index + 8);
const calendarTones: EventTone[] = ['blue', 'green', 'purple', 'orange'];

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'ja';
  return document.documentElement.lang === 'en' ? 'en' : 'ja';
}

function getInitialTheme(): ThemePreference {
  if (typeof document === 'undefined') return 'system';
  const preference = document.documentElement.dataset.themePreference;
  if (preference === 'light' || preference === 'dark' || preference === 'system') return preference;
  return 'system';
}

function resolveTheme(preference: ThemePreference) {
  if (preference === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale;
  try {
    localStorage.setItem(localeKey, locale);
  } catch {
    // Ignore storage failures in embedded previews.
  }
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
  try {
    localStorage.setItem(themeKey, preference);
  } catch {
    // Ignore storage failures in embedded previews.
  }
}

function calculateEventStyle(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = startHour + startMinute / 60;
  const end = endHour + endMinute / 60;
  return {
    top: `${(start - 8) * 78}px`,
    height: `${Math.max((end - start) * 78, 46)}px`,
  };
}

function parseTime(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour + minute / 60;
}

function formatTime(value: number) {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getEventDuration(event: CalendarEvent) {
  return parseTime(event.endTime) - parseTime(event.startTime);
}

function formatHour(hour: number, locale: Locale) {
  if (locale === 'ja') return `${hour}:00`;
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

function getMonthLabel(month: CalendarMonth, locale: Locale) {
  if (locale === 'ja') return `${month.year}年${month.month + 1}月`;
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(month.year, month.month, 1),
  );
}

function getCurrentDateLabel(month: CalendarMonth, locale: Locale) {
  if (locale === 'ja') return `${month.month + 1}月${month.activeDate}日`;
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(
    new Date(month.year, month.month, month.activeDate),
  );
}

function getAgendaDateLabel(month: CalendarMonth, locale: Locale) {
  const date = new Date(month.year, month.month, month.activeDate);
  if (locale === 'ja') {
    const day = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month.month + 1}月${month.activeDate}日 ${day}曜日`;
  }
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

function getWeekDates(month: CalendarMonth) {
  const active = new Date(month.year, month.month, month.activeDate);
  const start = new Date(active);
  start.setDate(active.getDate() - active.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date.getDate();
  });
}

function getActiveDay(month: CalendarMonth) {
  return new Date(month.year, month.month, month.activeDate).getDay() + 1;
}

function getMiniCalendarDays(month: CalendarMonth) {
  const firstDay = new Date(month.year, month.month, 1).getDay();
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, index) => {
    if (index < firstDay || index >= firstDay + daysInMonth) return null;
    return index - firstDay + 1;
  });
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialTheme);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetKind | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [eventPlacements, setEventPlacements] = useState<Record<string, EventPlacement>>({});
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: number; hour: number } | null>(null);
  const [resizingEventId, setResizingEventId] = useState<string | null>(null);
  const [activeMonthIndex, setActiveMonthIndex] = useState(1);

  const text = copy[locale];
  const resolvedTheme = useMemo(() => resolveTheme(themePreference), [themePreference]);
  const activeMonth = calendarMonths[activeMonthIndex];
  const monthLabel = useMemo(() => getMonthLabel(activeMonth, locale), [activeMonth, locale]);
  const currentDateLabel = useMemo(() => getCurrentDateLabel(activeMonth, locale), [activeMonth, locale]);
  const agendaDateLabel = useMemo(() => getAgendaDateLabel(activeMonth, locale), [activeMonth, locale]);
  const weekDates = useMemo(() => getWeekDates(activeMonth), [activeMonth]);
  const activeDay = useMemo(() => getActiveDay(activeMonth), [activeMonth]);
  const miniCalendarDays = useMemo(() => getMiniCalendarDays(activeMonth), [activeMonth]);
  const scheduleEvents = useMemo(
    () =>
      events.map((event) => {
        const placement = eventPlacements[event.id];
        return placement ? { ...event, ...placement } : event;
      }),
    [eventPlacements],
  );
  const todaysEvents = useMemo(() => scheduleEvents.filter((event) => event.day === activeDay), [activeDay, scheduleEvents]);
  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return scheduleEvents.slice(0, 6);
    return scheduleEvents.filter((event) => {
      const values = [
        event.title[locale],
        event.location[locale],
        event.description[locale],
        event.organizer[locale],
        ...event.attendees[locale],
      ];
      return values.some((value) => value.toLowerCase().includes(query));
    });
  }, [locale, scheduleEvents, searchTerm]);
  const eventsByDay = useMemo(
    () => weekDates.map((date, index) => ({ date, count: scheduleEvents.filter((event) => event.day === index + 1).length })),
    [scheduleEvents],
  );

  useEffect(() => {
    setIsLoaded(true);
    const timer = window.setTimeout(() => setShowAssistant(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  useEffect(() => {
    applyTheme(themePreference);
  }, [themePreference]);

  useEffect(() => {
    if (!showAssistant) return;

    setTypedText('');
    let index = 0;
    const sentence = text.assistant.prompt;
    const timer = window.setInterval(() => {
      setTypedText((current) => current + sentence.charAt(index));
      index += 1;
      if (index >= sentence.length) window.clearInterval(timer);
    }, 8);

    return () => window.clearInterval(timer);
  }, [showAssistant, text.assistant.prompt]);

  useEffect(() => {
    if (!activeSheet && !selectedEvent && !isSearchOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (isSearchOpen) {
        setIsSearchOpen(false);
        return;
      }
      if (activeSheet) {
        setActiveSheet(null);
        return;
      }
      setSelectedEvent(null);
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeSheet, isSearchOpen, selectedEvent]);

  function toggleLocale() {
    setLocale((current) => (current === 'ja' ? 'en' : 'ja'));
  }

  function toggleTheme() {
    setThemePreference((current) => (resolveTheme(current) === 'dark' ? 'light' : 'dark'));
  }

  function openSheet(sheet: SheetKind) {
    setActiveSheet(sheet);
  }

  function closeSheet() {
    setActiveSheet(null);
  }

  function moveMonth(direction: -1 | 1) {
    setActiveMonthIndex((current) => (current + direction + calendarMonths.length) % calendarMonths.length);
  }

  function returnToToday() {
    setActiveMonthIndex(1);
    openSheet('today');
  }

  function getDropHour(target: HTMLElement, clientY: number) {
    const rect = target.getBoundingClientRect();
    const rawHour = 8 + ((clientY - rect.top) / 78);
    return Math.min(16.5, Math.max(8, Math.round(rawHour * 2) / 2));
  }

  function handleDropOnDay(day: number, target: HTMLElement, clientY: number) {
    if (!draggingEventId) return;
    const event = scheduleEvents.find((item) => item.id === draggingEventId);
    if (!event) return;

    const duration = getEventDuration(event);
    const start = Math.min(getDropHour(target, clientY), 17 - duration);
    setEventPlacements((current) => ({
      ...current,
      [event.id]: {
        day,
        startTime: formatTime(start),
        endTime: formatTime(start + duration),
      },
    }));
    setDraggingEventId(null);
    setDropTarget(null);
  }

  function handleResizeStart(pointerEvent: ReactPointerEvent<HTMLSpanElement>, event: CalendarEvent) {
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    const column = pointerEvent.currentTarget.closest('.day-column') as HTMLElement | null;
    if (!column) return;
    const resizeColumn = column;

    setResizingEventId(event.id);

    function resize(moveEvent: PointerEvent) {
      const start = parseTime(event.startTime);
      const end = Math.min(17, Math.max(start + 0.5, getDropHour(resizeColumn, moveEvent.clientY)));
      setEventPlacements((current) => ({
        ...current,
        [event.id]: {
          day: event.day,
          startTime: event.startTime,
          endTime: formatTime(end),
        },
      }));
    }

    function stopResize() {
      setResizingEventId(null);
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', stopResize);
    }

    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stopResize);
  }

  return (
    <AppSurface data-loaded={isLoaded ? 'true' : 'false'}>
      <div data-melius-ui-id="app-background" data-melius-ui-role="media" className="app-background" />

      <header data-melius-ui-id="app-header" data-melius-ui-role="navigation" className="app-header">
        <div className="brand-cluster">
          <IconButton dataId="menu-button" label="Menu" onClick={() => openSheet('menu')}>
            <Menu size={22} />
          </IconButton>
          <div className="brand-copy">
            <div data-melius-ui-id="product-name" className="product-name">
              {text.appName}
            </div>
            <div data-melius-ui-id="workspace-label" className="workspace-label">
              {text.workspaceLabel}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div data-melius-ui-id="search-container" data-melius-ui-role="search" className="search-container">
            <SearchInput
              dataId="global-search"
              label={text.search}
              placeholder={text.search}
              icon={<Search size={16} />}
              value={searchTerm}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => {
                setSearchTerm(event.currentTarget.value);
                setIsSearchOpen(true);
              }}
            />
            {isSearchOpen ? (
              <div data-melius-ui-id="search-dropdown" data-melius-ui-role="listbox" className="search-dropdown">
                <div className="search-dropdown-head">
                  <span>{text.sheets.search.results}</span>
                  <button
                    type="button"
                    data-melius-ui-id="search-dropdown-close"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="search-dropdown-list">
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 5).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        data-melius-ui-id={`search-dropdown-result-${event.id}`}
                        data-tone={event.tone}
                        className="search-dropdown-result"
                        onMouseDown={(mouseEvent) => mouseEvent.preventDefault()}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsSearchOpen(false);
                        }}
                      >
                        <span>{event.startTime} - {event.endTime}</span>
                        <strong>{event.title[locale]}</strong>
                        <small>{event.location[locale]}</small>
                      </button>
                    ))
                  ) : (
                    <div data-melius-ui-id="search-dropdown-empty" className="empty-state">
                      {text.sheets.search.empty}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <TextButton dataId="locale-toggle" onClick={toggleLocale}>
            <Languages size={16} />
            {text.localeToggle}
          </TextButton>
          <IconButton
            dataId="theme-toggle"
            label={resolvedTheme === 'dark' ? text.theme.light : text.theme.dark}
            onClick={toggleTheme}
          >
            {resolvedTheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <IconButton dataId="settings-button" label="Settings" onClick={() => openSheet('settings')}>
            <Settings size={21} />
          </IconButton>
          <button
            type="button"
            data-melius-ui-id="user-avatar"
            data-melius-ui-role="avatar"
            className="user-avatar"
            onClick={() => openSheet('profile')}
          >
            U
          </button>
        </div>
      </header>

      <main data-melius-ui-id="calendar-shell" className="calendar-shell">
        <aside data-melius-ui-id="calendar-sidebar" data-melius-ui-role="sidebar" className="calendar-sidebar">
          <div className="sidebar-main">
            <TextButton
              dataId="create-event-button"
              roleName="primary-action"
              variant="primary"
              onClick={() => openSheet('create')}
            >
              <Plus size={18} />
              {text.create}
            </TextButton>

            <GlassPanel dataId="mini-calendar" roleName="calendar">
              <div className="mini-calendar-head">
                <h2>{monthLabel}</h2>
                <div className="mini-calendar-controls">
                  <IconButton dataId="mini-calendar-previous" label="Previous month" onClick={() => moveMonth(-1)}>
                    <ChevronLeft size={16} />
                  </IconButton>
                  <IconButton dataId="mini-calendar-next" label="Next month" onClick={() => moveMonth(1)}>
                    <ChevronRight size={16} />
                  </IconButton>
                </div>
              </div>

              <div className="mini-calendar-grid">
                {text.miniWeekDays.map((day, index) => (
                  <span key={`${day}-${index}`} className="mini-weekday">
                    {day}
                  </span>
                ))}
                {miniCalendarDays.map((day, index) => (
                  <button
                    key={`${day ?? 'blank'}-${index}`}
                    type="button"
                    data-melius-ui-id={day ? `mini-calendar-day-${day}` : undefined}
                    data-active={day === activeMonth.activeDate ? 'true' : 'false'}
                    className="mini-day"
                    aria-hidden={!day}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel dataId="calendar-list" roleName="list">
              <h2 className="panel-title">{text.myCalendars}</h2>
              <div className="calendar-list">
                {text.calendars.map((calendar, index) => (
                  <div
                    key={calendar}
                    data-melius-ui-id={`calendar-source-${index + 1}`}
                    className="calendar-source"
                  >
                    <span data-tone={calendarTones[index]} />
                    <p>{calendar}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          <IconButton
            dataId="quick-add-event-button"
            label={text.quickAdd}
            className="quick-add-button"
            onClick={() => openSheet('create')}
          >
            <Plus size={24} />
          </IconButton>
        </aside>

        <section data-melius-ui-id="calendar-workspace" data-melius-ui-role="workspace" className="calendar-workspace">
          <div data-melius-ui-id="calendar-toolbar" data-melius-ui-role="toolbar" className="calendar-toolbar">
            <div className="toolbar-left">
              <TextButton dataId="today-button" variant="primary" onClick={returnToToday}>
                {text.today}
              </TextButton>
              <div className="toolbar-nav">
                <IconButton dataId="previous-week-button" label="Previous" onClick={() => moveMonth(-1)}>
                  <ChevronLeft size={18} />
                </IconButton>
                <IconButton dataId="next-week-button" label="Next" onClick={() => moveMonth(1)}>
                  <ChevronRight size={18} />
                </IconButton>
              </div>
              <div className="date-heading">
                <span>{monthLabel}</span>
                <h1 data-melius-ui-id="current-date-label">{currentDateLabel}</h1>
              </div>
            </div>

            <div data-melius-ui-id="view-mode-control" data-melius-ui-role="segmented-control" className="view-segments">
              {(['day', 'week', 'month'] as ViewMode[]).map((view) => (
                <SegmentButton
                  key={view}
                  dataId={`view-${view}-button`}
                  selected={currentView === view}
                  onClick={() => setCurrentView(view)}
                >
                  {text.views[view]}
                </SegmentButton>
              ))}
            </div>
          </div>

          <GlassPanel dataId="week-calendar-panel" roleName="calendar" className="week-calendar-panel">
            <div className="week-grid week-head">
              <div className="week-corner" />
              {text.weekDays.map((day, index) => (
                <div
                  key={day}
                  data-melius-ui-id={`week-header-${index + 1}`}
                  data-active={index + 1 === activeDay ? 'true' : 'false'}
                  className="week-day-head"
                >
                  <span>{day}</span>
                  <strong>{weekDates[index]}</strong>
                </div>
              ))}
            </div>

            <div className="week-grid week-body">
              <div className="time-column">
                {timeSlots.map((time) => (
                  <div key={time} className="time-slot-label">
                    {formatHour(time, locale)}
                  </div>
                ))}
              </div>

              {Array.from({ length: 7 }, (_, dayIndex) => (
                <div
                  key={dayIndex}
                  data-melius-ui-id={`calendar-day-column-${dayIndex + 1}`}
                  data-melius-ui-role="calendar-column"
                  data-drop-target={dropTarget?.day === dayIndex + 1 ? 'true' : 'false'}
                  className="day-column"
                  onDragOver={(event) => {
                    if (!draggingEventId) return;
                    event.preventDefault();
                    setDropTarget({
                      day: dayIndex + 1,
                      hour: getDropHour(event.currentTarget, event.clientY),
                    });
                  }}
                  onDragLeave={(event) => {
                    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                    setDropTarget(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDropOnDay(dayIndex + 1, event.currentTarget, event.clientY);
                  }}
                >
                  {timeSlots.map((time) => (
                    <div key={time} className="time-cell" />
                  ))}
                  {dropTarget?.day === dayIndex + 1 ? (
                    <div
                      data-melius-ui-id={`drop-marker-day-${dayIndex + 1}`}
                      className="drop-marker"
                      style={{ top: `${(dropTarget.hour - 8) * 78}px` }}
                    />
                  ) : null}
                  {scheduleEvents
                    .filter((event) => event.day === dayIndex + 1)
                    .map((event) => {
                      const eventStyle = calculateEventStyle(event.startTime, event.endTime);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          data-melius-ui-id={`event-card-${event.id}`}
                          data-melius-ui-role="calendar-event"
                          data-tone={event.tone}
                          data-dragging={draggingEventId === event.id ? 'true' : 'false'}
                          data-resizing={resizingEventId === event.id ? 'true' : 'false'}
                          className="event-card"
                          style={eventStyle}
                          draggable={resizingEventId !== event.id}
                          aria-grabbed={draggingEventId === event.id}
                          onDragStart={(dragEvent) => {
                            dragEvent.dataTransfer.effectAllowed = 'move';
                            dragEvent.dataTransfer.setData('text/plain', event.id);
                            setDraggingEventId(event.id);
                          }}
                          onDragEnd={() => {
                            setDraggingEventId(null);
                            setDropTarget(null);
                          }}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <strong>{event.title[locale]}</strong>
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                          <span
                            data-melius-ui-id={`event-resize-handle-${event.id}`}
                            className="event-resize-handle"
                            onPointerDown={(pointerEvent) => handleResizeStart(pointerEvent, event)}
                            onClick={(clickEvent) => clickEvent.stopPropagation()}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <aside data-melius-ui-id="agenda-panel" data-melius-ui-role="inspector" className="agenda-panel">
          <div className="agenda-heading">
            <div>
              <p>{agendaDateLabel}</p>
              <h2>{text.agenda.title}</h2>
            </div>
            <span>{todaysEvents.length}</span>
          </div>

          <div data-melius-ui-id="agenda-metrics" className="agenda-metrics">
            <div>
              <span>{text.agenda.events}</span>
              <strong>{todaysEvents.length}</strong>
            </div>
            <div>
              <span>{text.agenda.week}</span>
              <strong>{scheduleEvents.length}</strong>
            </div>
            <div>
              <span>{text.agenda.focus}</span>
              <strong>2.5h</strong>
            </div>
          </div>

          <div data-melius-ui-id="agenda-focus-note" className="focus-note">
            <span>{text.agenda.focus}</span>
            <p>{text.agenda.focusNote}</p>
          </div>

          <div className="agenda-list-wrap">
            <h3>{text.agenda.next}</h3>
            <div data-melius-ui-id="agenda-event-list" data-melius-ui-role="list" className="agenda-list">
              {todaysEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  data-melius-ui-id={`agenda-event-${event.id}`}
                  data-melius-ui-role="calendar-event"
                  data-tone={event.tone}
                  className="agenda-event"
                  onClick={() => setSelectedEvent(event)}
                >
                  <span className="agenda-time">
                    {event.startTime} - {event.endTime}
                  </span>
                  <strong>{event.title[locale]}</strong>
                  <small>{event.location[locale]}</small>
                </button>
              ))}
            </div>
          </div>

          {showAssistant ? (
            <GlassPanel dataId="assistant-popup" roleName="assistant" className="assistant-popup">
              <div className="assistant-head">
                <div>
                  <Sparkles size={17} />
                  <span>{text.agenda.assistant}</span>
                </div>
                <IconButton dataId="assistant-close-button" label="Close assistant" onClick={() => setShowAssistant(false)}>
                  <X size={16} />
                </IconButton>
              </div>
              <div className="assistant-copy">
                <p>{typedText}</p>
              </div>
              <div className="assistant-actions">
                <TextButton dataId="assistant-accept-button" onClick={() => setIsPlaying(true)}>
                  {text.assistant.yes}
                </TextButton>
                <TextButton dataId="assistant-dismiss-button" onClick={() => setShowAssistant(false)}>
                  {text.assistant.no}
                </TextButton>
              </div>
              {isPlaying ? (
                <TextButton dataId="assistant-pause-button" onClick={() => setIsPlaying(false)} variant="ghost">
                  <Pause size={16} />
                  {text.assistant.pause}
                </TextButton>
              ) : null}
            </GlassPanel>
          ) : null}
        </aside>
      </main>

      {activeSheet ? (
        <div data-melius-ui-id="action-sheet-overlay" data-melius-ui-role="dialog" className="sheet-overlay">
          <section
            data-melius-ui-id={`action-sheet-${activeSheet}`}
            data-melius-ui-role="dialog-content"
            data-size={activeSheet === 'create' ? 'wide' : 'default'}
            className="action-sheet"
          >
            <div className="sheet-head">
              <div>
                <p>{activeSheet === 'today' ? agendaDateLabel : text.sheets[activeSheet].subtitle}</p>
                <h2>{text.sheets[activeSheet].title}</h2>
              </div>
              <IconButton dataId={`${activeSheet}-sheet-close-button`} label={text.sheets.common.close} onClick={closeSheet}>
                <X size={18} />
              </IconButton>
            </div>

            <div className="sheet-body">
              {activeSheet === 'menu' ? (
                <>
                  <div data-melius-ui-id="workspace-menu-list" data-melius-ui-role="navigation" className="sheet-nav-list">
                    {text.sheets.menu.items.map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        data-melius-ui-id={`workspace-menu-item-${index + 1}`}
                        className="sheet-nav-item"
                        onClick={() => {
                          if (index === 0) closeSheet();
                          if (index === 1 || index === 3) openSheet('today');
                          if (index === 2) openSheet('settings');
                        }}
                      >
                        <span>{item}</span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>

                  <div className="sheet-section">
                    <h3>{text.sheets.menu.section}</h3>
                    <div className="action-list">
                      {text.sheets.menu.actions.map((action, index) => (
                        <button
                          key={action}
                          type="button"
                          data-melius-ui-id={`workspace-quick-action-${index + 1}`}
                          className="action-row"
                          onClick={() => openSheet(index === 0 ? 'profile' : 'settings')}
                        >
                          <FileText size={16} />
                          <span>{action}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {activeSheet === 'create' ? (
                <>
                  <div data-melius-ui-id="event-create-form" data-melius-ui-role="form" className="event-form-grid">
                    <label className="form-field form-field-wide">
                      <span>{text.sheets.create.eventTitle}</span>
                      <input defaultValue={text.sheets.create.eventTitleValue} />
                    </label>
                    <label className="form-field">
                      <span>{text.sheets.create.calendar}</span>
                      <select defaultValue={text.calendars[1]}>
                        {text.calendars.map((calendar) => (
                          <option key={calendar}>{calendar}</option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span>{text.sheets.create.date}</span>
                      <input defaultValue={locale === 'ja' ? `${activeMonth.year}年${currentDateLabel}` : `${currentDateLabel}, ${activeMonth.year}`} />
                    </label>
                    <label className="form-field">
                      <span>{text.sheets.create.time}</span>
                      <input defaultValue="15:30 - 16:00" />
                    </label>
                    <label className="form-field">
                      <span>{text.sheets.create.room}</span>
                      <input defaultValue={locale === 'ja' ? '会議室 B' : 'Conference Room B'} />
                    </label>
                    <label className="form-field form-field-wide">
                      <span>{text.sheets.create.guests}</span>
                      <input defaultValue={locale === 'ja' ? 'Finance Team, Product Team' : 'Finance Team, Product Team'} />
                    </label>
                    <label className="form-field form-field-wide">
                      <span>{text.sheets.create.notes}</span>
                      <textarea defaultValue={text.sheets.create.notesValue} />
                    </label>
                  </div>

                  <div className="sheet-section">
                    <h3>{text.sheets.create.templates}</h3>
                    <div className="template-row">
                      {text.sheets.create.templateItems.map((template, index) => (
                        <button
                          key={template}
                          type="button"
                          data-melius-ui-id={`event-template-${index + 1}`}
                          className="template-pill"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sheet-footer">
                    <TextButton dataId="create-event-cancel-button" onClick={closeSheet}>
                      {text.sheets.common.cancel}
                    </TextButton>
                    <TextButton dataId="create-event-save-button" variant="primary" onClick={closeSheet}>
                      {text.sheets.common.save}
                    </TextButton>
                  </div>
                </>
              ) : null}

              {activeSheet === 'settings' ? (
                <>
                  <div className="settings-stack">
                    <div className="setting-card">
                      <div>
                        <SlidersHorizontal size={17} />
                        <span>{text.sheets.settings.appearance}</span>
                      </div>
                      <div className="setting-actions">
                        <button type="button" onClick={toggleTheme}>
                          {resolvedTheme === 'dark' ? text.theme.light : text.theme.dark}
                        </button>
                        <button type="button" onClick={toggleLocale}>
                          {text.localeToggle}
                        </button>
                      </div>
                    </div>

                    <div className="setting-card setting-card-vertical">
                      <div>
                        <SlidersHorizontal size={17} />
                        <span>{text.sheets.settings.density}</span>
                      </div>
                      <div className="setting-segments">
                        {text.sheets.settings.densityItems.map((item, index) => (
                          <button key={item} type="button" data-active={index === 0 ? 'true' : 'false'}>
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="setting-card setting-card-vertical">
                      <div>
                        <Bell size={17} />
                        <span>{text.sheets.settings.notifications}</span>
                      </div>
                      <div className="check-list">
                        {text.sheets.settings.notificationItems.map((item) => (
                          <button key={item} type="button" className="check-row">
                            <Check size={15} />
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="setting-grid">
                      <div>
                        <span>{text.sheets.settings.timezone}</span>
                        <strong>Asia/Tokyo</strong>
                      </div>
                      <div>
                        <span>{text.sheets.settings.workHours}</span>
                        <strong>09:00 - 18:00</strong>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {activeSheet === 'today' ? (
                <>
                  <div data-melius-ui-id="today-operations-metrics" className="today-metrics">
                    <div>
                      <span>{text.sheets.today.workload}</span>
                      <strong>3.0h</strong>
                    </div>
                    <div>
                      <span>{text.sheets.today.available}</span>
                      <strong>2.5h</strong>
                    </div>
                    <div>
                      <span>{text.sheets.today.conflict}</span>
                      <strong>1</strong>
                    </div>
                  </div>
                  <div className="focus-note">
                    <span>{text.sheets.today.conflict}</span>
                    <p>{text.sheets.today.conflictValue}</p>
                  </div>
                  <div className="sheet-section">
                    <h3>{text.sheets.today.timeline}</h3>
                    <div className="today-timeline">
                      {todaysEvents.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          data-melius-ui-id={`today-timeline-${event.id}`}
                          data-tone={event.tone}
                          className="timeline-row"
                          onClick={() => {
                            setSelectedEvent(event);
                            closeSheet();
                          }}
                        >
                          <span>{event.startTime}</span>
                          <strong>{event.title[locale]}</strong>
                          <small>{event.endTime}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {activeSheet === 'profile' ? (
                <>
                  <div data-melius-ui-id="profile-summary" className="profile-summary">
                    <div className="profile-avatar">U</div>
                    <div>
                      <h3>United Calendar</h3>
                      <p>{text.sheets.profile.role}</p>
                    </div>
                  </div>
                  <div className="setting-grid">
                    <div>
                      <span>{text.sheets.profile.plan}</span>
                      <strong>Business</strong>
                    </div>
                    <div>
                      <span>{text.sheets.profile.sync}</span>
                      <strong>Live</strong>
                    </div>
                  </div>
                  <div className="action-list">
                    <button type="button" className="action-row" onClick={() => openSheet('settings')}>
                      <Settings size={16} />
                      <span>{text.sheets.profile.status}</span>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {selectedEvent ? (
        <div data-melius-ui-id="event-detail-overlay" data-melius-ui-role="dialog" className="modal-overlay">
          <div
            data-melius-ui-id="event-detail-modal"
            data-melius-ui-role="dialog-content"
            data-tone={selectedEvent.tone}
            className="event-modal"
          >
            <h2>{selectedEvent.title[locale]}</h2>
            <dl>
              <div>
                <dt>
                  <Clock size={18} />
                  {text.detail.time}
                </dt>
                <dd>
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </dd>
              </div>
              <div>
                <dt>
                  <MapPin size={18} />
                  {text.detail.location}
                </dt>
                <dd>{selectedEvent.location[locale]}</dd>
              </div>
              <div>
                <dt>
                  <CalendarDays size={18} />
                  {text.detail.date}
                </dt>
                <dd>
                  {text.weekDays[selectedEvent.day - 1]}, {weekDates[selectedEvent.day - 1]} {monthLabel}
                </dd>
              </div>
              <div>
                <dt>
                  <Users size={18} />
                  {text.detail.attendees}
                </dt>
                <dd>{selectedEvent.attendees[locale].join(', ')}</dd>
              </div>
              <div>
                <dt>{text.detail.organizer}</dt>
                <dd>{selectedEvent.organizer[locale]}</dd>
              </div>
              <div>
                <dt>{text.detail.description}</dt>
                <dd>{selectedEvent.description[locale]}</dd>
              </div>
            </dl>
            <TextButton dataId="event-detail-close-button" onClick={() => setSelectedEvent(null)}>
              {text.detail.close}
            </TextButton>
          </div>
        </div>
      ) : null}
    </AppSurface>
  );
}
