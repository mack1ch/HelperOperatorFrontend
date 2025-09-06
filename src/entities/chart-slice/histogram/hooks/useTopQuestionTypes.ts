// "use client";
// src/features/charts/model/useTopQuestionTypes.ts
"use client";

import useSWR from "swr";
import {
  ITopQuestionTypesResponse,
  ITopQuestionTypeRow,
} from "@/shared/interface/charts";
import { fetcherForCharts } from "@/shared/api";

type Params = { authorId?: string; issueId?: string };

export function useTopQuestionTypes(params?: Params) {
  // при необходимости можно прокинуть query-параметры
  const key = ["/api/chart-top-types", params ?? {}] as const;

  const { data, error, isLoading, mutate } = useSWR<ITopQuestionTypesResponse>(
    key,
    ([url]) => fetcherForCharts<ITopQuestionTypesResponse>(url)
  );

  const items: ITopQuestionTypeRow[] = data?.items ?? [];

  return {
    items,
    isLoading,
    error,
    mutate,
    meta: { generatedAt: data?.generatedAt },
  };
}
