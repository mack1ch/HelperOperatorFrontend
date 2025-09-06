// hooks/useOperatorIssues.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { message as antdMessage } from "antd";
import { io, Socket } from "socket.io-client";
import { IIssue } from "@/shared/interface/issue";
import { normalizeIssue, sortByUpdatedAsc } from "../model";

// «лайт»-формат от сокета: сейчас приходят только эти поля
type IssueLight = Pick<IIssue, "issueId" | "authorId">;

// нормализуем легкий тикет в валидный IIssue для UI
const fromLight = (i: IssueLight): IIssue =>
  normalizeIssue({
    issueId: i.issueId,
    authorId: i.authorId,
    isClosed: false,
    messages: [], // пока пусто — позже сервер начнет присылать
    createdAt: undefined,
    updatedAt: undefined,
  } as IIssue);

export function useOperatorIssues() {
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rltorg.ru/";
    const s: Socket = io(API_URL, { transports: ["websocket"] });

    // сервер присылает один тикет за событие — аккумулируем уникальные
    s.on("getIssue", (raw: IssueLight | IIssue) => {
      // лог для отладки формата
      // console.log("[SOCKET] getIssue:", raw);

      const incoming: IIssue =
        "messages" in raw ? normalizeIssue(raw) : fromLight(raw);

      setIssues((prev) => {
        // дедуплицируем через Map по issueId
        const map = new Map<string, IIssue>(prev.map((x) => [x.issueId, x]));
        map.set(incoming.issueId, incoming);
        const next = Array.from(map.values()).sort(sortByUpdatedAsc);
        return next;
      });
      setIsLoading(false);
    });
    s.on("connect", () => {
      // очищаем список на новое подключение, чтобы не было «хвостов»
      setIssues([]);
      s.emit("joinRoomSupport", {});
      // console.log("[SOCKET] joinRoomSupport emitted, id:", s.id);
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, []);

  const hasIssues = issues.length > 0;
  // если нужен быстрый доступ к последнему — он в конце (sortByUpdatedAsc)
  const lastIssue = useMemo(
    () => (issues.length ? issues[issues.length - 1] : null),
    [issues]
  );

  return { issues, isLoading, hasIssues, lastIssue };
}
