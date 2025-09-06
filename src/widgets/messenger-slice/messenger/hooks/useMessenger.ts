// features/messenger/hooks/useMessenger.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message as antdMessage } from "antd";
import type { Socket } from "socket.io-client";
import { uid } from "uid";

import { IIssue } from "@/shared/interface/issue";
import { IMessage } from "@/shared/interface/message";

import {
  appendOrMergeMessage,
  closeOldIssues,
  createSocket,
  normalizeIssue,
} from "../model";
import { toDateStrict } from "@/shared/lib/parce/date";
import { changeIssueClosingByID } from "../api";

type Params = { authorId?: string; issueId?: string };

export function useMessenger({ authorId, issueId }: Params) {
  // ---- state ----
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageValue, setMessageValue] = useState("");

  // ---- refs ----
  const socketRef = useRef<Socket | null>(null);
  const sentMessageIdsRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef<boolean>(false);

  // ---- derived ----
  const lastIssue = useMemo(
    () => (issues.length ? issues[issues.length - 1] : null),
    [issues]
  );
  const isLastClosed = !!lastIssue?.isClosed;

  const visibleIssues = useMemo(() => {
    if (!issueId) return issues;
    return issues.filter((i) => i.issueId === issueId);
  }, [issues, issueId]);

  // ---- helpers ----
  const sameIssueSnapshot = (a: IIssue, b: IIssue) => {
    const aUp = a.updatedAt ? +new Date(a.updatedAt) : 0;
    const bUp = b.updatedAt ? +new Date(b.updatedAt) : 0;
    if (aUp !== bUp) return false;

    const aLen = a.messages?.length ?? 0;
    const bLen = b.messages?.length ?? 0;
    if (aLen !== bLen) return false;

    if (aLen && bLen) {
      const la = a.messages[aLen - 1];
      const lb = b.messages[bLen - 1];
      const laId = la?.id;
      const lbId = lb?.id;
      const laTs = +new Date(la?.createdAt as any);
      const lbTs = +new Date(lb?.createdAt as any);
      if (laId !== lbId || laTs !== lbTs) return false;
    }
    return true;
  };

  // Кладём историю активного чата (из useChatHistory) в локальный стейт
  const setIssueFromHistory = useCallback((hist?: IIssue) => {
    if (!hist) return;
    const normalizedHist = normalizeIssue(hist);

    setIssues((prev) => {
      const idx = prev.findIndex((i) => i.issueId === normalizedHist.issueId);
      if (idx === -1) return [...prev, normalizedHist];

      const current = prev[idx];
      if (sameIssueSnapshot(current, normalizedHist)) return prev;

      const next = [...prev];
      next[idx] = normalizedHist;
      return next;
    });
  }, []);

  // ---- socket lifecycle ----
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!authorId) return;

    const s = createSocket();
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("joinRoom", [authorId]);
    });

    // Полные апдейты тикета
    s.on("getIssue", (raw: IIssue) => {
      if (issueId && raw.issueId !== issueId) return;

      const normalized = normalizeIssue(raw);
      setIssues((prev) => {
        const idx = prev.findIndex((i) => i.issueId === normalized.issueId);
        if (idx === -1) return [...prev, normalized];
        const next = [...prev];
        next[idx] = normalized;
        return next;
      });
    });

    // Порции сообщений / эхо
    s.on("messageTextPart", (value: IMessage) => {
      if (issueId && value.issueId !== issueId) return;

      const incomingId = (value as any).id ?? (value as any).messageId;

      // Эхо нашего сообщения: снимаем лоадер и игнорим
      if (
        value.role === "operator" &&
        incomingId &&
        sentMessageIdsRef.current.has(incomingId)
      ) {
        sentMessageIdsRef.current.delete(incomingId);
        if (mountedRef.current) setIsLoading(false);
        return;
      }

      // Обычный поток (AI / операторские ответы) — мержим + снимаем лоадер
      if (mountedRef.current) setIsLoading(false);

      setIssues((prev) => {
        if (!prev.length) return prev;
        const idx = issueId
          ? prev.findIndex((i) => i.issueId === issueId)
          : prev.length - 1;
        if (idx < 0) return prev;

        const next = [...prev];
        next[idx] = appendOrMergeMessage(next[idx], {
          ...value,
          createdAt: toDateStrict(value.createdAt),
        });
        return next;
      });
    });

    s.on("connect_error", () => {
      antdMessage.error("Не удалось подключиться к чату.");
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [authorId, issueId]);

  // ---- авто-закрытие последнего тикета ----
  useEffect(() => {
    if (!issues.length) return;

    (async () => {
      try {
        const shouldClose = closeOldIssues(issues);
        if (!shouldClose) return;

        const last = issues[issues.length - 1];
        const res = await changeIssueClosingByID(last.issueId, shouldClose);
        if (!(res as any)?.issueId) return;

        setIssues((prev) => {
          const next = [...prev];
          next[next.length - 1] = normalizeIssue(res as IIssue);
          return next;
        });
      } catch {
        // silent
      }
    })();
  }, [issues]);

  // ---- send message ----
  const sendMessage = useCallback(
    (textRaw?: string) => {
      const text = (textRaw ?? messageValue).trim();
      if (!authorId || !text) return;

      const socket = socketRef.current;
      if (!socket) {
        antdMessage.error("Нет соединения с сервером чата.");
        return;
      }

      setIsLoading(true);

      const baseIssue =
        (issueId && issues.find((i) => i.issueId === issueId)) ||
        (isLastClosed || !lastIssue ? null : lastIssue);

      const newIssueId = baseIssue ? baseIssue.issueId : uid(10);
      const messageId = uid(10);

      // пометим отправку, чтобы отфильтровать эхо
      sentMessageIdsRef.current.add(messageId);

      const optimistic: IMessage = {
        id: messageId,
        text,
        authorId,
        issueId: newIssueId,
        createdAt: new Date(),
        role: "operator",
      };

      // оптимистичное добавление
      setIssues((prev) => {
        if (!baseIssue) {
          const newIssue: IIssue = {
            issueId: newIssueId,
            authorId,
            isClosed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: [optimistic],
          };
          return [...prev, newIssue];
        }
        const next = [...prev];
        const idx = next.findIndex((i) => i.issueId === newIssueId);
        const target = idx >= 0 ? next[idx] : next[next.length - 1];
        const updated: IIssue = {
          ...target,
          messages: [...(target.messages ?? []), optimistic],
          updatedAt: new Date(),
        };
        if (idx >= 0) next[idx] = updated;
        else next[next.length - 1] = updated;
        return next;
      });

      // emit с ACK (если сервер поддерживает)
      socket.emit(
        "sendMessage",
        {
          issueId: newIssueId,
          text,
          authorId,
          isQuestion: false,
          messageId,
          role: "operator",
        },
        // ACK-колбэк (необязателен на бэке). Если есть — снимаем лоадер сразу
        () => {
          if (mountedRef.current) setIsLoading(false);
        }
      );

      setMessageValue("");
    },
    [authorId, messageValue, lastIssue, isLastClosed, issueId, issues]
  );

  return {
    // state
    issues,
    visibleIssues,
    isLoading,
    messageValue,

    // setters
    setMessageValue,
    setIssueFromHistory,

    // actions
    sendMessage,
  };
}
