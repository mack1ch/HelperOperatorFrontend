// "use client";
// src/features/charts/model/useTopQuestionTypes.ts
"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type {
  IQuestionStatsResponse,
  IQuestionStatRow,
} from "@/shared/interface/charts";
import { fetcherForCharts } from "@/shared/api";

type Params = {
  authorId?: string;
  issueId?: string;
  /** Сколько позиций вернуть (по умолчанию 10) */
  topN?: number;
  /** Порог по минимальному количеству упоминаний */
  minMentions?: number;
};

export function useTopQuestionTypes(params?: Params) {
  const { authorId, issueId, topN = 10, minMentions = 0 } = params ?? {};

  // единый источник: /clusters_statistic
  const key = useMemo(() => {
    const base = "/clusters_statistic";
    const qs = new URLSearchParams();
    if (authorId) qs.set("authorId", authorId);
    if (issueId) qs.set("issueId", issueId);
    const sorted = new URLSearchParams(
      Array.from(qs.entries()).sort(([a], [b]) => a.localeCompare(b))
    );
    return sorted.toString() ? `${base}?${sorted.toString()}` : base;
  }, [authorId, issueId]);

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

  // нормализация
  const allItems: IQuestionStatRow[] = useMemo(() => {
    const src = data?.items ?? [];
    if (!Array.isArray(src)) return [];
    return src.map((it) => ({
      type: String(it.type ?? ""),
      mentionsCount: Number(it.mentionsCount ?? 0),
      avgAnswerLength: Number(it.avgAnswerLength ?? 0),
      correctPct: Number(it.correctPct ?? 0),
    }));
  }, [data?.items]);

  // сортировка и фильтрация по mentionsCount
  const items = useMemo(() => {
    return [...allItems]
      .filter((r) => r.mentionsCount >= minMentions)
      .sort((a, b) => b.mentionsCount - a.mentionsCount)
      .slice(0, topN);
  }, [allItems, minMentions, topN]);

  return {
    items, // топ по mentionsCount
    allItems, // если нужно где-то весь список
    isLoading,
    isValidating,
    error,
    meta: { generatedAt: data?.generatedAt },
    refresh: () => mutate(),
    mutate,
  };
}
