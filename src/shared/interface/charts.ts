// src/shared/interface/charts.ts

export type QuestionType =
  | "classification"
  | "routing"
  | "faq"
  | "billing"
  | "tech_support"
  | "small_talk"
  | string;

/** Ответ API для ТОП-типов */
export interface ITopQuestionTypesResponse {
  items: IQuestionStatRow[];
  generatedAt?: string;
}

/** Ранее описанные типы для таблицы (если ещё не добавлял) */
export interface IQuestionStatRow {
  type: QuestionType;
  mentionsCount: number;
  avgAnswerLength: number;
  correctPct: number;
}
export interface IQuestionStatsResponse {
  items: IQuestionStatRow[];
  generatedAt?: string;
}
// src/shared/interface/support.ts

export type AttachmentType = "pdf" | "link";

export interface IAttachment {
  id: string;
  type: "pdf" | "link" | "doc" | "image" | string;
  url: string;
  title?: string;
}

export interface IQuestionItem {
  id: string;
  text: string;
  aiAnswer?: string;
  userAnswer?: string;
  isCorrect: boolean; // метка корректности ответа ИИ
  attachments?: IAttachment[];
  createdAt: string; // ISO
}

export interface IIssueSummary {
  issueId: string;
  authorId: string;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  messagesCount: number;
  questions: IQuestionItem[];
  chatUrl?: string; // ссылка на экран чата (если есть роут)
}

export interface IIssuesQuestionsResponse {
  items: IIssueSummary[];
  generatedAt?: string;
}

export interface IPostManualAnswerPayload {
  issueId: string;
  questionId: string;
  answer: string;
  // Файлы: либо загрузка pdf (в реале — multipart/form-data), либо ссылки:
  links?: Array<{ url: string; title?: string }>;
  // В учебных целях не реализуем upload на диск — имитируем успешный ответ
}
