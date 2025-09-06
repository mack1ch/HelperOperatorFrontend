import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import styles from "./ui.module.scss";
import { IIssue } from "@/shared/interface/issue";

const mockAvatars = [
  "https://api.dicebear.com/7.x/identicon/svg?seed=phoenix",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=unicorn",
  "https://api.dicebear.com/7.x/bottts/svg?seed=robot",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=smile",
  "https://api.dicebear.com/7.x/micah/svg?seed=wizard",
];

// Функция для «стабильного рандома» по authorId
function getAvatarUrl(authorId: string): string {
  const hash = Array.from(authorId).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  return mockAvatars[hash % mockAvatars.length];
}

export const DialogCard = ({
  issue,
  onClick,
}: {
  issue: IIssue;
  onClick: (issueId: string, authorId: string) => void;
}) => {
  const avatarUrl = getAvatarUrl(issue.authorId);

  return (
    <>
      <article
        onClick={() => onClick(issue.issueId, issue.authorId)}
        className={styles.dialogCard}
      >
        <div className={styles.row}>
          <Avatar
            size="large"
            shape="circle"
            src={avatarUrl}
            icon={<UserOutlined />} // fallback если не загрузится
          />
          <div className={styles.dialogCard_textWrap}>
            <h6 className={styles.dialogCard_textWrap_heading}>
              {issue.authorId}
            </h6>
            <p className={styles.dialogCard_textWrap_description}>привет</p>
          </div>
        </div>
        <span className={styles.badge}>{issue.messages.length}</span>
      </article>
    </>
  );
};
