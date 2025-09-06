// app/api/issues-questions/route.ts
import { IIssuesQuestionsResponse } from "@/shared/interface/charts";
import { NextResponse } from "next/server";

export async function GET() {
  const data: IIssuesQuestionsResponse = {
    generatedAt: new Date().toISOString(),
    items: [
      {
        issueId: "ISS-1001",
        authorId: "USR-001",
        createdAt: "2025-09-01T10:12:00.000Z",
        updatedAt: "2025-09-01T11:05:00.000Z",
        messagesCount: 17,
        chatUrl: `/chat/ISS-1001`,
        questions: [
          {
            id: "Q-1",
            text: "Как вернуть деньги за ошибочный платеж?",
            aiAnswer:
              "Оформите запрос на возврат в личном кабинете → Платежи → Возвраты.",
            isCorrect: true,
            createdAt: "2025-09-01T10:14:00.000Z",
            attachments: [
              {
                id: "A-1",
                type: "link",
                url: "https://docs.example.com/refund",
                title: "Инструкция по возвратам",
              },
            ],
          },
          {
            id: "Q-2",
            text: "Почему платеж по карте отклоняется?",
            aiAnswer: "Проверьте баланс и правильность данных карты.",
            isCorrect: false,
            createdAt: "2025-09-01T10:17:00.000Z",
          },
        ],
      },
      {
        issueId: "ISS-1002",
        authorId: "USR-007",
        createdAt: "2025-09-02T08:42:00.000Z",
        messagesCount: 9,
        chatUrl: `/chat/ISS-1002`,
        questions: [
          {
            id: "Q-3",
            text: "Где скачать акт выполненных работ?",
            aiAnswer: "В разделе Документы → Акты.",
            isCorrect: false,
            createdAt: "2025-09-02T08:43:00.000Z",
          },
        ],
      },
    ],
  };

  return NextResponse.json(data);
}
