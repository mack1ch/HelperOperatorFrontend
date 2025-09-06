// "use client";
// src/features/support/model/useIssuesQuestions.ts
"use client";

import { fetcherForCharts } from "@/shared/api";
import { IIssuesQuestionsResponse } from "@/shared/interface/charts";
import useSWR from "swr";

type Params = { authorId?: string; issueId?: string };

export function useIssuesQuestions(params?: Params) {
  // Можно расширить query-параметрами; для моков ключ прост
  const key = ["/api/issues-questions", params ?? {}] as const;

  const { data, error, isLoading, mutate } = useSWR<IIssuesQuestionsResponse>(
    key,
    ([url]) => fetcherForCharts<IIssuesQuestionsResponse>(url)
  );

  return {
    items: data?.items ?? [],
    meta: { generatedAt: data?.generatedAt },
    isLoading,
    error,
    mutate,
  };
}
