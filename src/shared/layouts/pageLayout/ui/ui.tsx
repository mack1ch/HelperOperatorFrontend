import { CSSProperties, ReactNode } from "react";
import styles from "./ui.module.scss";

export const PageLayout = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => {
  return (
    <>
      <div style={style} className={styles.layout}>
        {children}
      </div>
    </>
  );
};
