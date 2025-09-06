// "use client";
// src/features/charts/model/useChartStats.ts
"use client";

import useSWR from "swr";

import { IQuestionStatsResponse } from "@/shared/interface/charts";
import { fetcherForCharts } from "@/shared/api";

/**
 * Универсальный SWR-хук для статистики.
 * Можно расширить параметрами (authorId, issueId, фильтры и т.п.)
 */
export function useChartStats(params?: {
  authorId?: string;
  issueId?: string;
}) {
  const key = ["/api/chart-stats", params ?? {}] as const;
  const { data, error, isLoading, mutate } = useSWR<IQuestionStatsResponse>(
    key,
    ([url]) => fetcherForCharts<IQuestionStatsResponse>(url)
  );

  return {
    data: data?.items ?? [],
    meta: { generatedAt: data?.generatedAt },
    isLoading,
    error,
    mutate,
  };
}
