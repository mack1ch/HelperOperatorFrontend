import React, { ReactNode } from "react";

export const formatText = (texts: string[]): ReactNode[] => {
  const parts: ReactNode[] = [];
  texts.forEach((text, textIndex) => {
    let temp: string = "";
    let i: number = 0;

    while (i < text.length) {
      if (text[i] === "*" && text[i + 1] === "*") {
        // Bold text
        if (temp) parts.push(temp);
        temp = "";
        i += 2; // Skip the opening **
        while (i < text.length && !(text[i] === "*" && text[i + 1] === "*")) {
          temp += text[i];
          i++;
        }
        parts.push(
          <span
            key={`${textIndex}-${parts.length}`}
            style={{ fontWeight: 600 }}
          >
            {temp}
          </span>
        );
        temp = "";
        i += 2; // Skip the closing **
      } else if (text[i] === "`") {
        // Italic text
        if (temp) parts.push(temp);
        temp = "";
        i++; // Skip the opening `
        while (i < text.length && text[i] !== "`") {
          temp += text[i];
          i++;
        }
        parts.push(
          <span
            key={`${textIndex}-${parts.length}`}
            style={{ fontStyle: "italic" }}
          >
            {temp}
          </span>
        );
        temp = "";
        i++; // Skip the closing `
      } else {
        temp += text[i];
        i++;
      }
    }

    if (temp) parts.push(temp);

    // Add a line break after each line except the last one
    if (textIndex < texts.length - 1) {
      parts.push(<br key={`br-${textIndex}`} />);
    }
  });

  return parts;
};
