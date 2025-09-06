"use client";

import styles from "./ui.module.scss";
import { MessagesRender } from "@/features/messenger-slice/messagesRender";
import { useChatHistory } from "../hooks/useChatHistory";
import { useMessenger } from "../hooks/useMessenger";
import { Input, Spin, Result } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import PlaneTilt from "../../../../../public/icons/messenger/paperPlaneTilt.svg";
import Image from "next/image";
import { useEffect, useMemo } from "react";

type Props = {
  authorId?: string;
  issueId?: string;
};

export const Messenger = ({ authorId, issueId }: Props) => {
  const isChatSelected = Boolean(authorId && issueId);

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

  useEffect(() => {
    if (historyIssue) setIssueFromHistory(historyIssue);
  }, [historyIssue, setIssueFromHistory]);

  const issuesToRender = useMemo(
    () => (visibleIssues.length ? visibleIssues : issues),
    [visibleIssues, issues]
  );

  const isSubmittingDisabled = !isChatSelected || isLoading || isHistoryLoading;

  return (
    <div className={styles.messenger}>
      <div className={styles.messagesContainer}>
        {!isChatSelected ? (
          <Result status="403" title="Выберите чат" />
        ) : isHistoryLoading ? (
          <div className={styles.loader}>
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>
        ) : (
          <MessagesRender issues={issuesToRender} />
        )}
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (!isSubmittingDisabled) sendMessage();
        }}
      >
        <Input.Search
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          onSearch={(val) => !isSubmittingDisabled && sendMessage(val)}
          disabled={!isChatSelected}
          loading={isLoading || (isChatSelected && isHistoryLoading)}
          placeholder={
            isChatSelected ? "Задайте свой вопрос" : "Сначала выберите чат"
          }
          size="large"
          variant="borderless"
          enterButton={
            isSubmittingDisabled ? (
              <button disabled className={styles.submitButton} aria-disabled>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </button>
            ) : (
              <button className={styles.submitButton} aria-label="Отправить">
                <Image src={PlaneTilt} width={24} height={24} alt="Submit" />
              </button>
            )
          }
        />
      </form>
    </div>
  );
};
