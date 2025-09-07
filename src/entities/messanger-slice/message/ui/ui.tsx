// "use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
// подключаем нужные языки
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import md from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";
import githubStyle from "react-syntax-highlighter/dist/esm/styles/hljs/github";

import { IMessage } from "@/shared/interface/message";
import { formatTimeToHHMMFormat } from "@/shared/lib/parce/time";
import styles from "./ui.module.scss";

// регистрируем языки
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", md);

type CodeProps = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

type MessageProps = { message?: IMessage };

export const Message: React.FC<MessageProps> = ({ message }) => {
  const [isHover, setIsHover] = useState(false);

  const isUser = message?.role === "user";
  const text = message?.text ?? "";

  const createdAtLabel = useMemo(
    () => formatTimeToHHMMFormat(message?.createdAt || new Date()),
    [message?.createdAt]
  );

  const mdComponents: Components = {
    p: ({ children }) => <p className={styles.mdP}>{children}</p>,
    strong: ({ children }) => (
      <strong className={styles.mdStrong}>{children}</strong>
    ),
    em: ({ children }) => <em className={styles.mdEm}>{children}</em>,
    ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
    ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
    li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className={styles.mdBlockquote}>{children}</blockquote>
    ),
    a: ({ children, href }) => (
      <a
        className={styles.mdLink}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className={styles.messageWrap}>
      <div
        id={message?.id}
        className={styles.message}
        style={{
          flexDirection: isUser ? "row-reverse" : undefined,
          marginLeft: isUser ? "auto" : "0",
          marginRight: isUser ? "0" : "auto",
        }}
      >
        <span
          className={styles.date}
          style={{ opacity: isHover ? 1 : 0 }}
          aria-hidden={!isHover}
        >
          {createdAtLabel}
        </span>

        <div
          className={styles.messageText}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          style={{
            backgroundColor: isUser ? "#fff" : undefined,
            color: isUser ? "#222" : undefined,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            components={mdComponents}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;
