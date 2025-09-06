"use client";

import styles from "./ui.module.scss";
import { useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { IDocument } from "@/shared/interface/message";
import { Tooltip } from "antd";

export const PDFViewerComponent = ({
  documents,
}: {
  documents?: IDocument[];
}) => {
  const [isPDFOpen, setPDFOpen] = useState<boolean>(
    !Boolean(Array.isArray(documents) && documents.length > 0)
  );
  const [selectedDocumentID, setSelectedDocumentID] = useState<number>(0);
  const handleDocumentIDChange = (docID: number) => {
    if (docID === selectedDocumentID) return;
    else {
      setSelectedDocumentID(docID);
    }
  };

  return (
    <>
      {Array.isArray(documents) && documents.length > 0 && (
        <>
          <button
            style={{ borderRadius: isPDFOpen ? undefined : "8px" }}
            onClick={() => setPDFOpen(!isPDFOpen)}
            className={styles.btn}
          >
            {isPDFOpen ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            Показать материалы
          </button>
          <div
            style={{ display: isPDFOpen ? "block" : "none" }}
            className={styles.renderPages}
          >
            <div className={styles.header}>
              {documents?.map((item, index) => (
                <Tooltip title={item.title} key={index}>
                  <button
                    onClick={() => handleDocumentIDChange(index)}
                    style={{
                      width: `calc(100% / ${documents.length} - 8px)`,
                      background:
                        index === selectedDocumentID ? "#333" : "#fff",
                      color: index === selectedDocumentID ? "#fff" : "#222",
                    }}
                    className={styles.chip}
                  >
                    Документ № {index + 1}, страница {item.page! + 1}
                  </button>
                </Tooltip>
              ))}
            </div>
            <div className={styles.main}>
              {documents.map((item, index) => {
                if (selectedDocumentID === index) {
                  const renderItem = documents[selectedDocumentID];

                  return (
                    <>
                      <object
                        style={{
                          width: "100%",
                          height: "940px",
                          overflowY: "auto",
                          borderRadius: "12px",
                        }}
                        height="700"
                        data={
                          renderItem.fileLink +
                          `#page=${
                            renderItem?.page! + 1
                          } + '#toolbar=0&navpanes=0`
                        }
                        type="application/pdf"
                      >
                        <iframe
                          style={{
                            width: "100%",
                            height: "940px",
                            overflowY: "auto",
                            borderRadius: "12px",
                          }}
                          height="700"
                          src={
                            renderItem.fileLink +
                            `#page=${
                              renderItem?.page! + 1
                            } + '#toolbar=0&navpanes=0'`
                          }
                        >
                          <p>Ваш браузер не поддерживает PDF</p>
                        </iframe>
                      </object>
                    </>
                  );
                }
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
