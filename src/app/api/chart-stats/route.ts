// app/api/chart-stats/route.ts
import { NextResponse } from "next/server";
import { IQuestionStatsResponse } from "@/shared/interface/charts";

export async function GET() {
  // Моки — тут можно позже подключить реальную БД/сервис
  const data: IQuestionStatsResponse = {
    items: [
      { type: "faq", mentionsCount: 182, avgAnswerLength: 148, correctPct: 91 },
      {
        type: "billing",
        mentionsCount: 73,
        avgAnswerLength: 201,
        correctPct: 84,
      },
      {
        type: "tech_support",
        mentionsCount: 119,
        avgAnswerLength: 289,
        correctPct: 78,
      },
      {
        type: "routing",
        mentionsCount: 51,
        avgAnswerLength: 96,
        correctPct: 88,
      },
      {
        type: "classification",
        mentionsCount: 39,
        avgAnswerLength: 71,
        correctPct: 93,
      },
      {
        type: "small_talk",
        mentionsCount: 26,
        avgAnswerLength: 55,
        correctPct: 62,
      },
    ],
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
