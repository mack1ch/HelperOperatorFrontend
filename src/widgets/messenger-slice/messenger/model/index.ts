import { IIssue } from "@/shared/interface/issue";
import { IMessage } from "@/shared/interface/message";
import { io, Socket } from "socket.io-client";

const ONE_HOUR = 60 * 60 * 1000; // in milliseconds

export const closeOldIssues = (issues: IIssue[]): boolean => {
  const now = new Date().getTime();
  let answer = false;
  issues.forEach((issue) => {
    if (
      !issue.isClosed &&
      now - new Date(issue.createdAt || new Date()).getTime() > ONE_HOUR
    ) {
      answer = true;
    } else answer = false;
  });
  return answer;
};

export const toDate = (
  createdAt: Date | string | string[] | undefined
): Date => {
  if (createdAt instanceof Date) return createdAt;
  if (Array.isArray(createdAt) && createdAt.length > 0) {
    const d = new Date(createdAt[0]);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  if (typeof createdAt === "string") {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
};

export const appendOrMergeMessage = (
  issue: IIssue,
  incoming: IMessage
): IIssue => {
  const next: IIssue = { ...issue, messages: [...(issue.messages ?? [])] };
  const idx = next.messages!.findIndex(
    (m) => m.id === incoming.id && m.issueId === incoming.issueId
  );

  if (idx >= 0) {
    const existing = next.messages![idx];
    next.messages![idx] = {
      ...existing,
      text: `${existing.text}${incoming.text}`, // сшиваем поток частями
      documents: incoming.documents?.length
        ? incoming.documents
        : existing.documents,
      createdAt: toDate(incoming.createdAt) || existing.createdAt,
    };
  } else {
    next.messages!.push({
      ...incoming,
      createdAt: toDate(incoming.createdAt),
    });
  }

  return next;
};

export const makeUserMessage = (params: {
  text: string;
  authorId: string;
  issueId: string;
  messageId: string;
}): IMessage => ({
  id: params.messageId,
  text: params.text,
  issueId: params.issueId,
  authorId: params.authorId,
  role: "operator" as const,
  createdAt: new Date(),
  documents: [],
});

export function toDateSafe(v?: Date | string | number | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(+d) ? undefined : d;
}

export function normalizeIssue(i: IIssue): IIssue {
  return {
    ...i,
    createdAt: toDateSafe(i.createdAt) ?? new Date(),
    updatedAt: toDateSafe(i.updatedAt) ?? toDateSafe(i.createdAt) ?? new Date(),
    messages: (i.messages ?? []).map((m) => ({
      ...m,
      createdAt: toDateSafe(m.createdAt) ?? new Date(),
    })),
  };
}

export function createSocket(): Socket {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rltorg.ru/";
  return io(API_URL, { transports: ["websocket"] });
}
