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
  rewardPoints: (points: number) => string;
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
  choosePhoto: string;
  photoSelected: string;
  verifyNow: string;
  verifyingNow: string;
  verifiedApproved: (points: number) => string;
  verifiedRejected: string;
  verificationFailed: string;
  mapTitle: string;
  useMyLocation: string;
  pointsHint: string;
  pointsSaved: string;
  pointsSaveFailed: string;
  pointsSaving: string;
  centerOnMe: string;
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
    rewardPoints: (p) => `Reward points: ${p}`,
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
    shareHeading: "My Summer NOW Log",
    shareConquered: "quests conquered 🔥",
    shareDownload: "Download share card",
    shareRendering: "Rendering...",
    choosePhoto: "Choose proof photo",
    photoSelected: "Photo selected",
    verifyNow: "Verify quest",
    verifyingNow: "Verifying...",
    verifiedApproved: (points) => `Verified • +${points} points`,
    verifiedRejected: "Rejected by AI. Try a clearer proof photo.",
    verificationFailed: "Verification failed. Try again.",
    mapTitle: "Quest map points",
    useMyLocation: "Add my location",
    pointsHint: "Tap on map to add multiple nearby points.",
    pointsSaved: "Points saved",
    pointsSaveFailed: "Could not save points",
    pointsSaving: "Saving points...",
    centerOnMe: "Center on me",
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
    rewardPoints: (p) => `Награда: ${p} баллов`,
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
    shareHeading: "Мой журнал Summer NOW",
    shareConquered: "квестов покорено 🔥",
    shareDownload: "Скачать карточку",
    shareRendering: "Рендер...",
    choosePhoto: "Выбрать фото-доказательство",
    photoSelected: "Фото выбрано",
    verifyNow: "Проверить квест",
    verifyingNow: "Проверяем...",
    verifiedApproved: (points) => `Подтверждено • +${points} баллов`,
    verifiedRejected: "ИИ отклонил. Попробуй более понятное фото.",
    verificationFailed: "Не удалось проверить. Попробуй ещё раз.",
    mapTitle: "Точки квеста на карте",
    useMyLocation: "Добавить мою геолокацию",
    pointsHint: "Нажми на карту, чтобы добавить несколько близких точек.",
    pointsSaved: "Точки сохранены",
    pointsSaveFailed: "Не удалось сохранить точки",
    pointsSaving: "Сохраняем точки...",
    centerOnMe: "Ко мне",
    cadence: { daily: "Каждый день", weekly: "Каждую неделю", monthly: "Раз в месяц" },
    difficulty: { easy: "легко", medium: "средне", hard: "сложно" },
  },
};
