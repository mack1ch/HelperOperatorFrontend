// "use client";
// src/widgets/chart-table/ui/ChartTable.tsx
"use client";

import { useMemo } from "react";
import { Table, Tag, Tooltip, Progress } from "antd";
import type { ColumnsType } from "antd/es/table";
import styles from "./ui.module.scss";
import { IQuestionStatRow } from "@/shared/interface/charts";
import { useChartStats } from "../hooks/useChartStats";

export type ChartTableProps = {
  /** Если прокинуть, таблица отрисует ровно эти данные (без запроса) */
  dataSourceOverride?: IQuestionStatRow[];
  /** Для будущих фильтров, сквозной прокид автора/диалога и т.п. */
  authorId?: string;
  issueId?: string;
  /** Управление пагинацией/размером страницы по умолчанию */
  pageSize?: number;
};

export const ChartTable = ({
  dataSourceOverride,
  authorId,
  issueId,
  pageSize = 10,
}: ChartTableProps) => {
  const {
    items: data,
    isLoading,
    error,
  } = useChartStats({ authorId, issueId });

  const rows = dataSourceOverride ?? data;

  const columns: ColumnsType<IQuestionStatRow> = useMemo(
    () => [
      {
        title: "Тип вопроса",
        dataIndex: "type",
        key: "type",
        sorter: (a, b) => String(a.type).localeCompare(String(b.type)),
        render: (value: IQuestionStatRow["type"]) => (
          <Tag className={styles.typeTag}>{value}</Tag>
        ),
        width: 240,
        fixed: "left",
      },
      {
        title: "Кол-во упоминаний",
        dataIndex: "mentionsCount",
        key: "mentionsCount",
        sorter: (a, b) => a.mentionsCount - b.mentionsCount,
        align: "right",
        width: 180,
      },
      {
        title: "Средняя длина ответа",
        dataIndex: "avgAnswerLength",
        key: "avgAnswerLength",
        sorter: (a, b) => a.avgAnswerLength - b.avgAnswerLength,
        align: "right",
        width: 220,
        render: (v: number) => (
          <Tooltip title="Средняя длина ответа в символах">
            <span className={styles.mono}>{v.toLocaleString("ru-RU")}</span>
          </Tooltip>
        ),
      },
      {
        title: "Процент правильных",
        dataIndex: "correctPct",
        key: "correctPct",
        sorter: (a, b) => a.correctPct - b.correctPct,
        align: "right",
        width: 220,
        render: (pct: number) => (
          <div className={styles.pctCell}>
            <Progress percent={pct} size="small" />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className={styles.wrap}>
      <Table<IQuestionStatRow>
        className={styles.table}
        rowKey={(r) => `${r.type}`}
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        pagination={{ pageSize, showSizeChanger: false }}
        scroll={{ x: 900 }}
        locale={{
          emptyText: error ? "Ошибка загрузки данных" : "Нет данных",
        }}
        size="middle"
      />
    </div>
  );
};
