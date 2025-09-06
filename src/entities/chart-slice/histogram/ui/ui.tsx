// "use client";
// src/widgets/histogram/ui/Histogram.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Card, Skeleton, Empty, Tooltip as AntTooltip } from "antd";
import type { EChartsOption } from "echarts";
import type { TopLevelFormatterParams } from "echarts/types/dist/shared";
import styles from "./ui.module.scss";
import type { IQuestionStatRow } from "@/shared/interface/charts";
import { useTopQuestionTypes } from "../hooks/useTopQuestionTypes";

// Динамический импорт, чтобы не падать на SSR
const ReactECharts = dynamic(
  () => import("echarts-for-react").then((m) => m.default),
  { ssr: false }
);

export type HistogramProps = {
  authorId?: string;
  issueId?: string;
  title?: string;
  topN?: number;
  minMentions?: number;
  dataOverride?: IQuestionStatRow[];
  /** Высота графика */
  height?: number | string;
};

/** Аккуратно извлекаем payload из разных версий типов echarts */
function extractPayload(
  p: TopLevelFormatterParams
): IQuestionStatRow | undefined {
  // В echarts params.data может быть примитивом или объектом. Нас интересует объект с полем payload.
  const maybe = p as unknown as { data?: unknown };
  if (!maybe?.data || typeof maybe.data !== "object") return undefined;
  const dataObj = maybe.data as { payload?: IQuestionStatRow };
  return dataObj.payload;
}

export const Histogram = ({
  authorId,
  issueId,
  title = "ТОП самых распространённых типов вопросов",
  topN = 10,
  minMentions = 0,
  dataOverride,
  height = 360,
}: HistogramProps) => {
  const { items, isLoading, error } = useTopQuestionTypes({
    authorId,
    issueId,
    topN,
    minMentions,
  });

  // Источник данных: override или сервер
  const data = useMemo<IQuestionStatRow[]>(
    () =>
      (dataOverride ?? items).map((d) => ({
        ...d,
        mentionsCount: Number.isFinite(d.mentionsCount) ? d.mentionsCount : 0,
      })),
    [dataOverride, items]
  );

  const hasData = data.length > 0;

  const option: EChartsOption = useMemo(() => {
    // Категории и точки
    const categories = data.map((d) => d.type);
    const points = data.map((d) => ({ value: d.mentionsCount, payload: d }));

    // Красивый потолок по оси Y с запасом
    const rawMax = Math.max(0, ...data.map((d) => d.mentionsCount));
    const yMax =
      rawMax === 0
        ? 1
        : (() => {
            const padded = rawMax * 1.15; // +15% запаса
            const order = 10 ** Math.floor(Math.log10(padded));
            return Math.ceil(padded / order) * order;
          })();

    return {
      // Легенду полностью выключаем
      legend: { show: false },

      // Компактные отступы
      grid: { left: 16, right: 16, top: 10, bottom: 10, containLabel: false },

      // Ось X (категории) — скрываем всё, чтобы не было «строк внизу»
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        axisPointer: { show: false },
      },

      // Ось Y — форматирование чисел и «потолок»
      yAxis: {
        type: "value",
        min: 0,
        max: yMax,
        axisLabel: {
          formatter: (v: number) => Number(v).toLocaleString("ru-RU"),
        },
        splitLine: { show: true },
      },

      // Кастомный тултип с полным названием и числами
      tooltip: {
        trigger: "item",
        confine: true,
        appendToBody: true,
        borderRadius: 8,
        className: "echarts-tooltip--histogram",
        formatter: (params: TopLevelFormatterParams) => {
          const payload = extractPayload(params);
          const type = String(payload?.type ?? "—");
          const mentions = payload?.mentionsCount ?? 0;
          const correct =
            typeof payload?.correctPct === "number"
              ? `${payload.correctPct}%`
              : "—";
          const avgLen =
            typeof payload?.avgAnswerLength === "number"
              ? String(payload.avgAnswerLength)
              : "—";

          return `
            <div style="padding:8px 10px; max-width:420px;">
              <div style="font-weight:700; margin-bottom:6px; white-space:normal; word-break:break-word;">
                ${type}
              </div>
              <div style="display:flex; justify-content:space-between; gap:12px;">
                <span>Количество</span><span><b>${mentions}</b></span>
              </div>
              <div style="display:flex; justify-content:space-between; gap:12px;">
                <span>Точность</span><span><b>${correct}</b></span>
              </div>
              <div style="display:flex; justify-content:space-between; gap:12px;">
                <span>Сред. длина</span><span><b>${avgLen}</b></span>
              </div>
            </div>
          `;
        },
      },

      // Серия-столбцы
      series: [
        {
          type: "bar",
          data: points,
          barMaxWidth: 64,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          // Метка над столбцом
          label: {
            show: true,
            position: "top",
            formatter: (p: unknown) => {
              const pt = p as { data?: { payload?: IQuestionStatRow } };
              const val = pt?.data?.payload?.mentionsCount ?? 0;
              return String(val);
            },
            fontWeight: 600,
          },
          emphasis: { focus: "series" },
        },
      ],
    };
  }, [data]);

  return (
    <Card className={styles.card} variant="outlined" title={title}>
      {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}
      {!isLoading && !hasData && (
        <div className={styles.emptyWrap}>
          <Empty
            description={error ? "Не удалось загрузить данные" : "Нет данных"}
          />
        </div>
      )}
      {!isLoading && hasData && (
        <div className={styles.chartWrap}>
          <AntTooltip title="Гистограмма строится по количеству упоминаний (mentionsCount)">
            <div className={styles.chartInner}>
              <ReactECharts
                option={option}
                style={{ width: "100%", height }}
                notMerge
                lazyUpdate
              />
            </div>
          </AntTooltip>
        </div>
      )}
    </Card>
  );
};
