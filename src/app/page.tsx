// app/(route)/page.tsx
"use client";

import { useState, useCallback } from "react";
import { Messenger } from "@/widgets/messenger-slice/messenger";
import { RenderDialogs } from "@/widgets/messenger-slice/renderDialogs";
import styles from "./page.module.scss";

export default function Home() {
  const [activeIssueId, setActiveIssueId] = useState<string | undefined>();
  const [activeAuthorId, setActiveAuthorId] = useState<string | undefined>();

  const handleSelectIssue = useCallback((issueId: string, authorId: string) => {
    setActiveIssueId(issueId);
    setActiveAuthorId(authorId);
  }, []);

  return (
    <div className={styles.mainPageWrap}>
      <div className={styles.renderDialogs}>
        {/* RenderDialogs теперь вызывает onSelectIssue(issueId, authorId) */}
        <RenderDialogs onSelectIssue={handleSelectIssue} />
      </div>

      <div className={styles.messenger}>
        {/* Messenger получает и authorId, и issueId для загрузки истории через /chat_history */}
        <Messenger issueId={activeIssueId} authorId={activeAuthorId} />
      </div>
    </div>
  );
}
