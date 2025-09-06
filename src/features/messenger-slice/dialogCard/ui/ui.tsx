import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import styles from "./ui.module.scss";
import { IIssue } from "@/shared/interface/issue";
import clsx from "clsx";

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
};

export const DialogCard = ({ issue, onClick, selected }: Props) => {
  const avatarUrl = getAvatarUrl(issue.authorId);
  console.log(selected);
  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onClick(issue.issueId, issue.authorId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(issue.issueId, issue.authorId);
        }
      }}
      className={clsx(
        styles.dialogCard,
        selected && styles.dialogCard__selected
      )}
    >
      <div className={styles.row}>
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
          <p className={styles.dialogCard_textWrap_description}>привет</p>
        </div>
      </div>
      {/* <span className={styles.badge}>{issue.messages.length}</span> */}
    </article>
  );
};
