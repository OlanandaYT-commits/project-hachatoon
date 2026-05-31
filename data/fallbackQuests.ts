import type { GeneratedQuest } from "@/lib/db";

export const FALLBACK_QUESTS: Record<"en" | "ru", GeneratedQuest[]> = {
  en: [
    {
      title: "Chase a sunrise before summer steals it",
      description: "Wake up before dawn and watch the sun come up from the highest spot near you. You won't get this exact morning back.",
      cadence: "daily",
      difficulty: "easy",
      place_name: "city viewpoint",
    },
    {
      title: "Map an unknown neighborhood",
      description: "Pick a part of town you've never explored and wander it on foot for an hour with zero destination. Get gloriously lost.",
      cadence: "weekly",
      difficulty: "medium",
      place_name: "historic old town",
    },
    {
      title: "Pull off one tiny expedition",
      description: "Organize a day trip to that place you always meant to visit. Pick a date NOW and commit before the summer runs out.",
      cadence: "monthly",
      difficulty: "hard",
      place_name: "nearest nature park",
    },
  ],
  ru: [
    {
      title: "Поймай рассвет, пока лето его не забрало",
      description: "Встань до зари и встреть солнце с самой высокой точки рядом с тобой. Именно это утро уже не повторится.",
      cadence: "daily",
      difficulty: "easy",
      place_name: "смотровая площадка",
    },
    {
      title: "Исследуй незнакомый район",
      description: "Выбери часть города, где ты никогда не был, и броди там час пешком без цели. Заблудись с удовольствием.",
      cadence: "weekly",
      difficulty: "medium",
      place_name: "исторический центр",
    },
    {
      title: "Устрой маленькую экспедицию",
      description: "Организуй поездку на день в место, куда всё собирался. Назначь дату ПРЯМО сейчас, пока лето не кончилось.",
      cadence: "monthly",
      difficulty: "hard",
      place_name: "ближайший парк",
    },
  ],
};
