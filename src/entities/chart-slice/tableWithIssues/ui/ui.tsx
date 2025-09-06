"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Button,
  Empty,
  Modal,
  Form,
  Input,
  message as antdMessage,
  Table,
  Tag,
  Space,
  Tooltip,
  Card,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import styles from "./ui.module.scss";
import { IIssueSummary, IQuestionItem } from "@/shared/interface/charts";
import { useIssuesQuestions } from "../hooks/useIssuesQuestions";

type Props = { pageSize?: number };

type AnswerModalState = {
  open: boolean;
  issue?: IIssueSummary;
  question?: IQuestionItem;
};

// детерминированное форматирование дат (замените timeZone на вашу, если нужно)
const dtf = new Intl.DateTimeFormat("ru-RU", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});
const formatISO = (iso?: string) => (iso ? dtf.format(new Date(iso)) : "—");

export const IssuesQuestionsTable = ({ pageSize = 10 }: Props) => {
  const { items, isLoading, error, mutate } = useIssuesQuestions();
  const [answerModal, setAnswerModal] = useState<AnswerModalState>({
    open: false,
  });
  const [form] = Form.useForm();

  const issueColumns: ColumnsType<IIssueSummary> = useMemo(
    () => [
      {
        title: "Обращение",
        dataIndex: "issueId",
        key: "issueId",
        fixed: "left",
        width: 180,
        render: (issueId: string, record) => (
          <Space direction="vertical" size={0}>
            <strong>{issueId}</strong>
            <span className={styles.subtle}>Автор: {record.authorId}</span>
          </Space>
        ),
        sorter: (a, b) => a.issueId.localeCompare(b.issueId),
      },
      {
        title: "Создано",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 200,
        render: (iso?: string) => formatISO(iso),
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      },
      {
        title: "Сообщений",
        dataIndex: "messagesCount",
        key: "messagesCount",
        align: "right",
        width: 140,
        sorter: (a, b) => a.messagesCount - b.messagesCount,
      },
      {
        title: "Вопросы",
        key: "qStats",
        width: 240,
        render: (_, record) => {
          const total = record.questions.length;
          const wrong = record.questions.filter((q) => !q.isCorrect).length;
          const correct = total - wrong;
          return (
            <Space wrap>
              <Tag color="success">Верных: {correct}</Tag>
              <Tag color="error">Неверных: {wrong}</Tag>
              <Tag>Всего: {total}</Tag>
            </Space>
          );
        },
      },
      {
        title: "Действия",
        key: "actions",
        fixed: "right",
        width: 180,
        render: (_, record) =>
          record.chatUrl ? (
            <Link href={record.chatUrl}>
              <Button type="link">Перейти в чат</Button>
            </Link>
          ) : (
            <Tooltip title="Ссылка на чат не задана">
              <Button type="link" disabled>
                Перейти в чат
              </Button>
            </Tooltip>
          ),
      },
    ],
    []
  );

  const openAnswerModal = (issue: IIssueSummary, question: IQuestionItem) => {
    setAnswerModal({ open: true, issue, question });
    form.resetFields();
  };
  const closeAnswerModal = () => setAnswerModal({ open: false });

  async function onSubmitAnswer() {
    try {
      // ❗ Сначала гарантируем, что в модалке есть issue и question
      if (!answerModal.issue || !answerModal.question) {
        antdMessage.error("Не выбрано обращение или вопрос");
        return;
      }

      const values = await form.validateFields();

      const payload = {
        issueId: answerModal.issue.issueId, // без ?.! — уже сузили выше
        questionId: answerModal.question.id, // без ?.! — уже сузили выше
        answer: String(values.answer),
        links:
          (values.links as Array<{ url: string; title?: string }>)?.filter(
            (l) => Boolean(l?.url)
          ) ?? [],
      };

      await fetch("/api/manual-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      antdMessage.success("Ответ сохранён");
      closeAnswerModal();
      mutate();
    } catch (e: unknown) {
      // @ts-expect-error antd validation shape
      if (e?.errorFields) return;
      antdMessage.error("Не удалось сохранить ответ");
    }
  }

  // фабрика колонок для вложенной таблицы (замыкаем issue)
  const makeQuestionColumns = (
    issue: IIssueSummary
  ): ColumnsType<IQuestionItem> => [
    {
      title: "Вопрос",
      dataIndex: "text",
      key: "text",
      width: 420,
      render: (text: string) => <span className={styles.qText}>{text}</span>,
    },
    {
      title: "Ответ ИИ (превью)",
      dataIndex: "aiAnswer",
      key: "aiAnswer",
      width: 420,
      render: (answer?: string) => (
        <span className={styles.ellipsis}>{answer ?? "—"}</span>
      ),
    },
    {
      title: "Статус",
      dataIndex: "isCorrect",
      key: "isCorrect",
      width: 140,
      filters: [
        { text: "Верный", value: true },
        { text: "Неверный", value: false },
      ],
      onFilter: (value, record) => record.isCorrect === (value as boolean),
      render: (isCorrect: boolean) =>
        isCorrect ? (
          <Tag color="success">верный</Tag>
        ) : (
          <Tag color="error">неверный</Tag>
        ),
    },
    {
      title: "Вложения",
      key: "attachments",
      width: 220,
      render: (_, q) =>
        q.attachments?.length ? (
          <Space direction="vertical" size={2}>
            {q.attachments.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className={styles.attachmentLink}
              >
                {a.title ?? a.url}
              </a>
            ))}
          </Space>
        ) : (
          "—"
        ),
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      width: 260,
      render: (_, q) => (
        <Space wrap>
          <Button
            type="default"
            disabled={q.isCorrect}
            onClick={() => openAnswerModal(issue, q)}
          >
            Дать ответ на неправильный вопрос
          </Button>
          {issue.chatUrl ? (
            <Link href={issue.chatUrl}>
              <Button type="link">Перейти в чат</Button>
            </Link>
          ) : (
            <Tooltip title="Ссылка на чат не задана">
              <Button type="link" disabled>
                Перейти в чат
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} variant="outlined">
        <Table<IIssueSummary>
          className={styles.table}
          rowKey={(r) => r.issueId}
          columns={issueColumns}
          dataSource={items}
          loading={isLoading}
          pagination={{ pageSize, showSizeChanger: false }}
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (issue) => {
              const qColumns = makeQuestionColumns(issue);
              return (
                <Table<IQuestionItem>
                  size="small"
                  rowKey={(r) => r.id}
                  columns={qColumns}
                  dataSource={issue.questions}
                  pagination={false}
                  className={styles.innerTable}
                  scroll={{ x: 1000 }}
                />
              );
            },
            rowExpandable: (rec) => (rec.questions?.length ?? 0) > 0,
          }}
          locale={{
            emptyText: error ? (
              <Empty description="Ошибка загрузки данных" />
            ) : (
              <Empty description="Нет данных" />
            ),
          }}
          size="middle"
        />
      </Card>

      <Modal
        open={answerModal.open}
        onCancel={closeAnswerModal}
        onOk={onSubmitAnswer}
        title="Дать ответ на неправильный вопрос"
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Обращение">
            <strong>{answerModal.issue?.issueId}</strong>
          </Form.Item>

          <Form.Item label="Вопрос">
            <div className={styles.qPreview}>{answerModal.question?.text}</div>
          </Form.Item>

          <Form.Item
            name="answer"
            label="Ваш ответ"
            rules={[{ required: true, message: "Введите ответ" }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 4 }}
              placeholder="Опишите корректный ответ для клиента"
            />
          </Form.Item>

          <Form.List name="links">
            {(fields, { add, remove }) => (
              <>
                <div className={styles.listHeader}>
                  <span>Ссылки (опционально)</span>
                  <Button onClick={() => add()} type="link">
                    + добавить
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" className={styles.linkRow}>
                    <Form.Item
                      {...restField}
                      name={[name, "title"]}
                      rules={[{ max: 80 }]}
                    >
                      <Input placeholder="Подпись" style={{ width: 220 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "url"]}
                      rules={[
                        { type: "url", message: "Введите корректный URL" },
                      ]}
                    >
                      <Input placeholder="https://..." style={{ width: 340 }} />
                    </Form.Item>
                    <Button onClick={() => remove(name)} type="link" danger>
                      Удалить
                    </Button>
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

// 🔒 ВАЖНО: отключаем SSR для виджета, чтобы исключить любые случайные id/aria от AntD на сервере
export default dynamic(() => Promise.resolve(IssuesQuestionsTable), {
  ssr: false,
});
