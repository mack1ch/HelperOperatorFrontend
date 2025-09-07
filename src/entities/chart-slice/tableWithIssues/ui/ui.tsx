"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Empty,
  Modal,
  Form,
  Input,
  Table,
  Tag,
  Space,
  Tooltip,
  Card,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import styles from "./ui.module.scss";
import type { IIssueSummary, IQuestionItem } from "@/shared/interface/charts";
import { useIssuesQuestions } from "../hooks/useIssuesQuestions";
import { instance } from "@/shared/api"; // <-- проверь путь

type Props = { pageSize?: number };

type AnswerModalState =
  | { open: false }
  | { open: true; issue: IIssueSummary; question: IQuestionItem };

// детерминированное форматирование дат
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

// расширяем локально тип вопроса, если бэкенд присылает messageId отдельно
type QuestionWithMessage = IQuestionItem & { messageId?: string };

export const IssuesQuestionsTable = ({ pageSize = 10 }: Props) => {
  const router = useRouter();
  const { items, isLoading, error, mutate } = useIssuesQuestions();
  const [messageApi] = message.useMessage();

  const [answerModal, setAnswerModal] = useState<AnswerModalState>({
    open: false,
  });
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  /** Переход в чат */
  const goToChat = useCallback(
    (issue: IIssueSummary) => {
      const url = `/?issueId=${encodeURIComponent(
        issue.issueId
      )}&authorId=${encodeURIComponent(issue.authorId)}`;
      router.push(url);
    },
    [router]
  );

  /** Открыть/закрыть модалку ответа */
  const openAnswerModal = useCallback(
    (issue: IIssueSummary, question: IQuestionItem) => {
      setAnswerModal({ open: true, issue, question });
      form.resetFields();
    },
    [form]
  );
  const closeAnswerModal = useCallback(
    () => setAnswerModal({ open: false }),
    []
  );

  /** Отправка корректного ответа для неправильного вопроса */
  const onSubmitAnswer = useCallback(async () => {
    try {
      if (!answerModal.open) {
        messageApi.error("Модалка закрыта");
        return;
      }

      const values = await form.validateFields();
      const correctAnswer = String(values.answer).trim();
      if (!correctAnswer) {
        messageApi.warning("Введите ответ");
        return;
      }

      const issue = answerModal.issue;
      const q = answerModal.question as QuestionWithMessage;

      // Бэкенд ожидает messageId — используем явный q.messageId или fallback на q.id
      const messageId = q.messageId ?? q.id;

      const payload = {
        messageId,
        issueId: issue.issueId,
        authorId: issue.authorId,
        correctAnswer,
      };

      setSaving(true);
      await instance.post("/save_correct_answer", payload);

      // Оптимистично пометим вопрос как верный локально
      await mutate(
        (prev) => {
          if (!prev) return prev; // ничего не знаем — ничего не меняем

          const updatedItems = prev.items.map((it) =>
            it.issueId === issue.issueId
              ? {
                  ...it,
                  questions: it.questions.map((qq) =>
                    qq.id === q.id ? { ...qq, isCorrect: true } : qq
                  ),
                }
              : it
          );

          return { ...prev, items: updatedItems }; // ВОЗВРАЩАЕМ ОБЪЕКТ, не массив
        },
        { revalidate: true, populateCache: true, rollbackOnError: true }
      );

      messageApi.success("Ответ сохранён");
      closeAnswerModal();
    } catch (e: unknown) {
      if (e && typeof e === "object" && "response" in e) {
        const err = e as { response?: { data?: { message?: string } } };
        messageApi.error(
          err.response?.data?.message || "Не удалось сохранить ответ"
        );
      } else {
        messageApi.error("Не удалось сохранить ответ");
      }
    } finally {
      setSaving(false);
    }
  }, [answerModal, form, mutate, closeAnswerModal]);

  /** Верхняя таблица обращений */
  const issueColumns: ColumnsType<IIssueSummary> = useMemo(
    () => [
      {
        title: "Обращение",
        dataIndex: "issueId",
        key: "issueId",
        fixed: "left",
        width: 180,
        render: (issueId: string, record: IIssueSummary) => (
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
        width: 260,
        render: (_: unknown, record: IIssueSummary) => {
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
        width: 200,
        render: (_: unknown, record: IIssueSummary) => (
          <Space>
            <Button type="link" onClick={() => goToChat(record)}>
              Перейти в чат
            </Button>
            {record.chatUrl ? (
              <Link href={record.chatUrl}>
                <Button type="link">Открыть исходный чат</Button>
              </Link>
            ) : (
              <Tooltip title="Ссылка на внешний чат не задана">
                <Button type="link" disabled>
                  Открыть исходный чат
                </Button>
              </Tooltip>
            )}
          </Space>
        ),
      },
    ],
    [goToChat]
  );

  /** Вложенная таблица вопросов */
  const makeQuestionColumns = useCallback(
    (issue: IIssueSummary): ColumnsType<IQuestionItem> => [
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
        width: 240,
        render: (_: unknown, q: IQuestionItem) =>
          q.attachments?.length ? (
            <Space direction="vertical" size={2}>
              {q.attachments.map((a) => (
                <Link
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.attachmentLink}
                >
                  {a.title ?? a.url}
                </Link>
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
        width: 280,
        render: (_: unknown, q: IQuestionItem) => (
          <Space wrap>
            <Button
              type="default"
              disabled={q.isCorrect}
              onClick={() => openAnswerModal(issue, q)}
            >
              Дать ответ на неправильный вопрос
            </Button>
            <Button type="link" onClick={() => goToChat(issue)}>
              Перейти в чат
            </Button>
          </Space>
        ),
      },
    ],
    [goToChat, openAnswerModal]
  );

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
        confirmLoading={saving}
      >
        {answerModal.open && (
          <Form
            form={form}
            layout="vertical"
            name="manualAnswer"
            preserve={false}
          >
            <Form.Item label="Обращение">
              <strong>{answerModal.issue.issueId}</strong>
            </Form.Item>

            <Form.Item label="Вопрос">
              <div className={styles.qPreview}>{answerModal.question.text}</div>
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
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default dynamic(() => Promise.resolve(IssuesQuestionsTable), {
  ssr: false,
});
