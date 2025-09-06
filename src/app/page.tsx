// app/(route)/page.tsx
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Messenger } from "@/widgets/messenger-slice/messenger";
import { RenderDialogs } from "@/widgets/messenger-slice/renderDialogs";
import styles from "./page.module.scss";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // читаем из URL
  const issueId = searchParams.get("issueId") ?? undefined;
  const authorId = searchParams.get("authorId") ?? undefined;

  // мемоизированный конструктор query-строки
  const buildQuery = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");

      // обновляем/удаляем ключи
      Object.entries(next).forEach(([k, v]) => {
        if (v == null || v === "") params.delete(k);
        else params.set(k, v);
      });

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  // колбэк из RenderDialogs: пушим новые параметры в URL
  const handleSelectIssue = useCallback(
    (nextIssueId: string, nextAuthorId: string) => {
      const url = buildQuery({ issueId: nextIssueId, authorId: nextAuthorId });
      router.push(url); // если нужно без новой записи в истории — поменяй на router.replace(url)
    },
    [buildQuery, router]
  );

  // Пробрасываем значения в Messenger напрямую из query
  const messengerProps = useMemo(
    () => ({ issueId, authorId }),
    [issueId, authorId]
  );

  return (
    <div className={styles.mainPageWrap}>
      <div className={styles.renderDialogs}>
        <RenderDialogs onSelectIssue={handleSelectIssue} />
      </div>

      <div className={styles.messenger}>
        <Messenger {...messengerProps} />
      </div>
    </div>
  );
}
