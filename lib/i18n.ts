export type Lang = "en" | "ru";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

type Dict = {
  tagline: string;
  whereLabel: string;
  wherePlaceholder: string;
  interestsLabel: string;
  interestsPlaceholder: string;
  generate: string;
  generating: string;
  genError: string;
  saveError: string;
  loading: string;
  progress: (done: number, total: number) => string;
  newQuests: string;
  shareStreak: string;
  fallbackBanner: string;
  offlineNote: string;
  countdownTitle: string;
  weekendsLeft: (n: number) => string;
  weekendsLeftSub: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
  summerOver: string;
  shareHeading: string;
  shareConquered: string;
  shareDownload: string;
  shareRendering: string;
  cadence: Record<"daily" | "weekly" | "monthly", string>;
  difficulty: Record<"easy" | "medium" | "hard", string>;
};

export const T: Record<Lang, Dict> = {
  en: {
    tagline: "Summer isn't infinite. Make every weekend count.",
    whereLabel: "Where are you?",
    wherePlaceholder: "e.g. Lisbon, Portugal",
    interestsLabel: "What are you into?",
    interestsPlaceholder: "e.g. surfing, photography, street food",
    generate: "Generate my summer quests",
    generating: "Summoning your quests...",
    genError: "Could not generate quests. Try again.",
    saveError: "Could not save completion.",
    loading: "Loading...",
    progress: (d, t) => `${d}/${t} quests done this summer${d > 0 ? " 🔥" : ""}`,
    newQuests: "New quests",
    shareStreak: "Share streak",
    fallbackBanner: "Offline mode — showing built-in quests",
    offlineNote: "",
    countdownTitle: "Summer is running out",
    weekendsLeft: (n) => `${n}`,
    weekendsLeftSub: "summer weekends left",
    days: "days",
    hours: "hrs",
    mins: "min",
    secs: "sec",
    summerOver: "Summer is over. Start planning the next one.",
    shareHeading: "My Summer Quest Log",
    shareConquered: "quests conquered 🔥",
    shareDownload: "Download share card",
    shareRendering: "Rendering...",
    cadence: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
    difficulty: { easy: "easy", medium: "medium", hard: "hard" },
  },
  ru: {
    tagline: "Лето не бесконечно. Не потрать ни одни выходные впустую.",
    whereLabel: "Где ты находишься?",
    wherePlaceholder: "напр. Алматы, Казахстан",
    interestsLabel: "Чем увлекаешься?",
    interestsPlaceholder: "напр. серфинг, фотография, уличная еда",
    generate: "Сгенерировать летние квесты",
    generating: "Призываю твои квесты...",
    genError: "Не получилось сгенерировать квесты. Попробуй ещё раз.",
    saveError: "Не удалось сохранить выполнение.",
    loading: "Загрузка...",
    progress: (d, t) => `${d}/${t} квестов выполнено этим летом${d > 0 ? " 🔥" : ""}`,
    newQuests: "Новые квесты",
    shareStreak: "Поделиться",
    fallbackBanner: "Оффлайн-режим — встроенные квесты",
    offlineNote: "",
    countdownTitle: "Лето заканчивается",
    weekendsLeft: (n) => `${n}`,
    weekendsLeftSub: "летних выходных осталось",
    days: "дней",
    hours: "ч",
    mins: "мин",
    secs: "сек",
    summerOver: "Лето закончилось. Пора планировать следующее.",
    shareHeading: "Мой летний журнал квестов",
    shareConquered: "квестов покорено 🔥",
    shareDownload: "Скачать карточку",
    shareRendering: "Рендер...",
    cadence: { daily: "Каждый день", weekly: "Каждую неделю", monthly: "Раз в месяц" },
    difficulty: { easy: "легко", medium: "средне", hard: "сложно" },
  },
};
