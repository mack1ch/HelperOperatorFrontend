"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Card, Skeleton, Empty, Tooltip } from "antd";
import styles from "./ui.module.scss";
import type { ITopQuestionTypeRow } from "@/shared/interface/charts";
import { useTopQuestionTypes } from "../hooks/useTopQuestionTypes";

// Важно: динамический импорт, чтобы не упасть на SSR
const Column = dynamic(
  () => import("@ant-design/plots").then((m) => m.Column),
  {
    ssr: false,
  }
);

export type HistogramProps = {
  /** Если данные переданы, компонент рендерит их без запроса */
  dataOverride?: ITopQuestionTypeRow[];
  authorId?: string;
  issueId?: string;
  /** Подпись карточки */
  title?: string;
  /** Макс. отображаемых категорий (дефолт — 10) */
  topN?: number;
};

export const Histogram = ({
  dataOverride,
  authorId,
  issueId,
  title = "ТОП-10 самых распространённых типов вопросов",
  topN = 10,
}: HistogramProps) => {
  const { items, isLoading, error } = useTopQuestionTypes({
    authorId,
    issueId,
  });

  const data = useMemo(() => {
    const src = dataOverride ?? items;
    // гарантируем TopN + сортировку
    return [...src].sort((a, b) => b.count - a.count).slice(0, topN);
  }, [items, dataOverride, topN]);

  const hasData = data.length > 0;

  const config = useMemo(
    () => ({
      data,
      xField: "type",
      yField: "count",
      columnWidthRatio: 0.6,
      autoFit: true,
      tooltip: {
        fields: ["type", "count", "correctPct", "avgAnswerLength"],
        formatter: (v: Partial<ITopQuestionTypeRow>) => {
          const lines = [
            { name: "Тип", value: String(v.type) },
            { name: "Количество", value: String(v.count) },
          ];
          if (typeof v.correctPct === "number") {
            lines.push({ name: "Точность", value: `${v.correctPct}%` });
          }
          if (typeof v.avgAnswerLength === "number") {
            lines.push({
              name: "Сред. длина",
              value: String(v.avgAnswerLength),
            });
          }
          return {
            name: "",
            value: lines.map((l) => `${l.name}: ${l.value}`).join("\n"),
          };
        },
      },
    }),
    [data]
  );

  return (
    <Card className={styles.card} title={title} variant="outlined">
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
          <Tooltip title="Гистограмма отражает самые частые типы вопросов за период агрегации">
            <div className={styles.chartInner}>
              <Column {...config} />
            </div>
          </Tooltip>
        </div>
      )}
    </Card>
  );
};
