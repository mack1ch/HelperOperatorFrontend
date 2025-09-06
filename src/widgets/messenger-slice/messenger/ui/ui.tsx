"use client";

import styles from "./ui.module.scss";
import { MessagesRender } from "@/features/messenger-slice/messagesRender";
import { useChatHistory } from "../hooks/useChatHistory";
import { useMessenger } from "../hooks/useMessenger";
import { Input, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import PlaneTilt from "../../../../../public/icons/messenger/paperPlaneTilt.svg";
import Image from "next/image";
import { useEffect, useMemo } from "react";

type Props = {
  authorId?: string;
  issueId?: string;
};

export const Messenger = ({ authorId, issueId }: Props) => {
  const { issue: historyIssue, isLoading: isHistoryLoading } = useChatHistory(
    authorId,
    issueId
  );

  const {
    visibleIssues,
    issues,
    isLoading,
    messageValue,
    setMessageValue,
    setIssueFromHistory,
    sendMessage,
  } = useMessenger({ authorId, issueId });

  // ✅ Кладём историю в стейт ТОЛЬКО в эффекте
  useEffect(() => {
    if (historyIssue) {
      setIssueFromHistory(historyIssue);
    }
  }, [historyIssue, setIssueFromHistory]);

  // ✅ Мемоизируем массив для рендера сообщений
  const issuesToRender = useMemo(
    () => (visibleIssues.length ? visibleIssues : issues),
    [visibleIssues, issues]
  );

  return (
    <div className={styles.messenger}>
      <div className={styles.messagesContainer}>
        <MessagesRender issues={issuesToRender} />
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <Input.Search
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          onSearch={(val) => sendMessage(val)}
          loading={isLoading || (!!issueId && isHistoryLoading)}
          placeholder="Задайте свой вопрос"
          size="large"
          variant="borderless"
          enterButton={
            isLoading ? (
              <button disabled className={styles.submitButton}>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </button>
            ) : (
              <button className={styles.submitButton}>
                <Image src={PlaneTilt} width={24} height={24} alt="Submit" />
              </button>
            )
          }
        />
      </form>
    </div>
  );
};
