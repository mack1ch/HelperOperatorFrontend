// app/api/manual-answer/route.ts
import { IPostManualAnswerPayload } from "@/shared/interface/charts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as IPostManualAnswerPayload;

  // Здесь в реале: валидация, сохранение в БД/хранилище и пр.
  // Сейчас просто возвращаем эхо и статус ок.
  return NextResponse.json(
    {
      ok: true,
      saved: {
        issueId: body.issueId,
        questionId: body.questionId,
        answer: body.answer,
        links: body.links ?? [],
        savedAt: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}
