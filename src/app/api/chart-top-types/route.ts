// app/api/chart-top-types/route.ts
import { NextResponse } from "next/server";
import { ITopQuestionTypesResponse } from "@/shared/interface/charts";

export async function GET() {
  // Моки. В реале — агрегация по логам/БД.
  const raw = [
    { type: "faq", count: 182, correctPct: 91, avgAnswerLength: 148 },
    { type: "billing", count: 73, correctPct: 84, avgAnswerLength: 201 },
    { type: "tech_support", count: 119, correctPct: 78, avgAnswerLength: 289 },
    { type: "routing", count: 51, correctPct: 88, avgAnswerLength: 96 },
    { type: "classification", count: 39, correctPct: 93, avgAnswerLength: 71 },
    { type: "small_talk", count: 26, correctPct: 62, avgAnswerLength: 55 },
    { type: "delivery", count: 64, correctPct: 86, avgAnswerLength: 132 },
    { type: "refund", count: 58, correctPct: 79, avgAnswerLength: 187 },
    { type: "onboarding", count: 47, correctPct: 90, avgAnswerLength: 121 },
    { type: "limits", count: 33, correctPct: 83, avgAnswerLength: 110 },
    { type: "security", count: 29, correctPct: 88, avgAnswerLength: 160 },
  ];

  // Топ-10 по убыванию
  const items = raw.sort((a, b) => b.count - a.count).slice(0, 10);

  const data: ITopQuestionTypesResponse = {
    items,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
