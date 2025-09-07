// "use client";
// src/features/support/model/useIssuesQuestions.ts
"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type {
  AttachmentType,
  IIssuesQuestionsResponse,
  IIssueSummary,
} from "@/shared/interface/charts";
import { fetcherForCharts } from "@/shared/api";

type Params = { authorId?: string; issueId?: string };

/**
 * Источник данных: GET /get_question_summary
 * Поддерживает query-параметры authorId/issueId.
 */
export function useIssuesQuestions(params?: Params) {
  const key = useMemo(() => {
    const base = "/get_question_summary";
    const qs = new URLSearchParams();
    if (params?.authorId) qs.set("authorId", params.authorId);
    if (params?.issueId) qs.set("issueId", params.issueId);

    const query = Array.from(qs.entries())
      .sort(([a], [b]) => a.localeCompare(b)) // детерминированный ключ
      .reduce((acc, [k, v]) => (acc.append(k, v), acc), new URLSearchParams())
      .toString();

    return query ? `${base}?${query}` : base;
  }, [params?.authorId, params?.issueId]);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<IIssuesQuestionsResponse>(
      key,
      (url: string) => fetcherForCharts<IIssuesQuestionsResponse>(url),
      {
        keepPreviousData: true,
        dedupingInterval: 15_000,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
      }
    );

  // Нормализуем (на случай «кривых» типов)
  const items: IIssueSummary[] = useMemo(() => {
    const src = data?.items ?? [];
    if (!Array.isArray(src)) return [];
    return src.map((it) => ({
      issueId: String(it.issueId ?? ""),
      authorId: String(it.authorId ?? ""),
      createdAt: String(it.createdAt ?? ""),
      updatedAt: it.updatedAt ? String(it.updatedAt) : undefined,
      messagesCount: Number(it.messagesCount ?? 0),
      chatUrl: it.chatUrl ? String(it.chatUrl) : undefined,
      questions: Array.isArray(it.questions)
        ? it.questions.map((q) => ({
            id: String(q.id ?? ""),
            text: String(q.text ?? ""),
            isCorrect: Boolean(q.isCorrect),
            createdAt: String(q.createdAt ?? ""),
            aiAnswer: q.aiAnswer ? String(q.aiAnswer) : undefined,
            userAnswer: q.userAnswer ? String(q.userAnswer) : undefined,
            attachments: Array.isArray(q.attachments)
              ? q.attachments.map((a) => ({
                  id: String(a.id ?? crypto.randomUUID()),
                  type: String(a.type ?? "link") as AttachmentType, // ✅ строгое приведение
                  url: String(a.url ?? ""),
                  title: a.title ? String(a.title) : undefined,
                }))
              : undefined,
          }))
        : [],
    }));
  }, [data?.items]);

  return {
    items,
    meta: { generatedAt: data?.generatedAt },
    isLoading,
    isValidating,
    error,
    refresh: () => mutate(),
    mutate,
  };
}
