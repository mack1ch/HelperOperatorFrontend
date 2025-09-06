// hooks/useChatHistory.ts
"use client";

import useSWR from "swr";
import { IIssue } from "@/shared/interface/issue";
import { normalizeIssue } from "../model";
import { useMemo } from "react";

export function useChatHistory(authorId?: string, issueId?: string) {
  const key =
    authorId && issueId ? ["/chat_history", { authorId, issueId }] : null;
  const { data, isLoading, error, mutate } = useSWR<IIssue>(key);

  // ✅ нормализуем и мемоизируем — одна и та же ссылка, пока data не изменилась
  const issue = useMemo(
    () => (data ? normalizeIssue(data) : undefined),
    [data]
  );

  return { issue, isLoading, error, mutate };
}
