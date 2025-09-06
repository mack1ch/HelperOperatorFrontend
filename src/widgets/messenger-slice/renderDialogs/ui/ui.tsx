"use client";

import styles from "./ui.module.scss";
import { Result, Skeleton } from "antd";
import { DialogCard } from "@/features/messenger-slice/dialogCard";
import { useOperatorIssues } from "../hooks/userOperatorIssues";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Props = { onSelectIssue?: (issueId: string, authorId: string) => void };

export const RenderDialogs = ({ onSelectIssue }: Props) => {
  const { issues, isLoading, hasIssues } = useOperatorIssues();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = useCallback(
    (issueId: string, authorId: string) => {
      setSelectedIssueId(issueId);
      onSelectIssue?.(issueId, authorId);

      // пушим query в адресную строку
      router.push(`/?issueId=${issueId}&authorId=${authorId}`);
    },
    [onSelectIssue, router]
  );

  return (
    <section className={styles.renderDialogs}>
      {isLoading ? (
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton.Button
              key={i}
              active
              style={{ width: "100%", height: 64 }}
            />
          ))}
        </div>
      ) : hasIssues ? (
        <div className={styles.dialogsList}>
          {issues.map((issue) => (
            <DialogCard
              key={issue.issueId}
              issue={issue}
              selected={issue.issueId === selectedIssueId}
              onClick={handleClick}
            />
          ))}
        </div>
      ) : (
        <span className={styles.errorChatNotFound}>
          <Result status="403" title="Чатов нет" />
        </span>
      )}
    </section>
  );
};
