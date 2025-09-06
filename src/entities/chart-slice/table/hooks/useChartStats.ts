// "use client";
// src/features/charts/model/useChartStats.ts

import { useMemo } from "react";
import useSWR from "swr";
import type {
  IQuestionStatsResponse,
  IQuestionStatRow,
} from "@/shared/interface/charts";
import { fetcherForCharts } from "@/shared/api";

/**
 * Универсальный SWR-хук для статистики (источник: GET /clusters_statistic).
 * Поддерживает опциональные параметры (authorId, issueId) — добавятся как query.
 */
export function useChartStats(params?: {
  authorId?: string;
  issueId?: string;
}) {
  // Стабильная сборка URL + query
  const key = useMemo(() => {
    const base = "/clusters_statistic";
    if (!params || (!params.authorId && !params.issueId)) return base;

    const qs = new URLSearchParams();
    if (params.authorId) qs.set("authorId", params.authorId);
    if (params.issueId) qs.set("issueId", params.issueId);

    // сортировка параметров для детерминированного ключа (на случай будущих добавлений)
    const sorted = new URLSearchParams(
      Array.from(qs.entries()).sort(([a], [b]) => a.localeCompare(b))
    );
    return `${base}?${sorted.toString()}`;
  }, [params?.authorId, params?.issueId]);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<IQuestionStatsResponse>(
      key,
      (url: string) => fetcherForCharts<IQuestionStatsResponse>(url),
      {
        keepPreviousData: true,
        dedupingInterval: 15_000,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
      }
    );

  // Нормализация и защита от «кривых» типов
  const items: IQuestionStatRow[] = useMemo(() => {
    const src = data?.items ?? [];
    if (!Array.isArray(src)) return [];
    return src.map((it) => ({
      type: String(it.type ?? ""),
      mentionsCount: Number(it.mentionsCount ?? 0),
      avgAnswerLength: Number(it.avgAnswerLength ?? 0),
      correctPct: Number(it.correctPct ?? 0),
    }));
  }, [data?.items]);

  return {
    items,
    error,
    isLoading,
    isValidating,
    meta: {
      generatedAt: data?.generatedAt, // строго типизировано как string | undefined
    },
    refresh: () => mutate(),
    mutate, // оставляю на случай оптимистичных апдейтов
  };
}
