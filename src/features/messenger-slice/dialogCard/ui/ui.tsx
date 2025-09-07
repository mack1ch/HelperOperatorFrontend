"use client";

import { UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { Avatar, Popconfirm, Button, Tooltip, App } from "antd";
import styles from "./ui.module.scss";
import { IIssue } from "@/shared/interface/issue";
import clsx from "clsx";
import { useState } from "react";
import { instance } from "@/shared/api";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

const mockAvatars = [
  "https://api.dicebear.com/7.x/identicon/svg?seed=phoenix",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=unicorn",
  "https://api.dicebear.com/7.x/bottts/svg?seed=robot",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=smile",
  "https://api.dicebear.com/7.x/micah/svg?seed=wizard",
];

function getAvatarUrl(authorId: string): string {
  const hash = Array.from(authorId).reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );
  return mockAvatars[hash % mockAvatars.length];
}

type Props = {
  issue: IIssue;
  onClick: (issueId: string, authorId: string) => void;
  selected?: boolean;
  onDeleted?: (issueId: string, authorId: string) => void;
};

export const DialogCard = ({ issue, onClick, selected, onDeleted }: Props) => {
  const avatarUrl = getAvatarUrl(issue.authorId);
  const [isDeleting, setIsDeleting] = useState(false);
  const { message } = App.useApp();
  const router = useRouter();

  const handleCardActivate = () => onClick(issue.issueId, issue.authorId);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await instance.delete("/delete_assistant_request", {
        params: { authorId: issue.authorId, issueId: issue.issueId },
      });

      message.success("Диалог удалён");
      onDeleted?.(issue.issueId, issue.authorId);

      // ✅ мягкое обновление данных страницы (Next App Router)
      router.push("/");

      // ❗ Если нужен полный перезапуск страницы — раскомментируй:
    } catch (err: unknown) {
      const msg =
        (isAxiosError(err) &&
          (err.response?.data as { message?: string } | undefined)?.message) ||
        (err instanceof Error ? err.message : undefined) ||
        "Не удалось удалить диалог";
      message.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={handleCardActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardActivate();
        }
      }}
      className={clsx(
        styles.dialogCard,
        selected && styles.dialogCard__selected
      )}
    >
      <div className={styles.row}>
        <div className={styles.left}>
          <Avatar
            size="large"
            shape="circle"
            src={avatarUrl}
            icon={<UserOutlined />}
          />
          <div className={styles.dialogCard_textWrap}>
            <h6 className={styles.dialogCard_textWrap_heading}>
              {issue.authorId}
            </h6>
            <p className={styles.dialogCard_textWrap_description}>
              Жду оператора
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <Popconfirm
            title="Удалить диалог?"
            description="Действие необратимо. Точно удалить?"
            okText="Удалить"
            cancelText="Отмена"
            onConfirm={handleDelete}
            onCancel={(e) => e?.stopPropagation?.()}
          >
            <Tooltip title="Удалить">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                loading={isDeleting}
                onClick={(e) => e.stopPropagation()}
                className={styles.deleteBtn}
                aria-label="Удалить диалог"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    </article>
  );
};
