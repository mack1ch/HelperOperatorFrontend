// widgets/messenger-slice/renderDialogs.tsx
"use client";

import styles from "./ui.module.scss";
import { Result, Skeleton } from "antd";
import { DialogCard } from "@/features/messenger-slice/dialogCard";
import { useOperatorIssues } from "../hooks/userOperatorIssues";

type Props = { onSelectIssue?: (issueId: string, authorId: string) => void };

export const RenderDialogs = ({ onSelectIssue }: Props) => {
  const { issues, isLoading, hasIssues } = useOperatorIssues();
  console.log(issues);
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
              onClick={() => onSelectIssue?.(issue.issueId, issue.authorId)}
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
