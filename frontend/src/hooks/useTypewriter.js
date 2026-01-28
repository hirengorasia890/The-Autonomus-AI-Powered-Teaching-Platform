import { useEffect, useState, useMemo } from "react";

/**
 * Tokenizes markdown text into atomic units that should be typed together.
 * This prevents flashing of partial markdown syntax like "**" or incomplete URLs.
 */
function tokenizeMarkdown(text) {
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    // Check for bold/strong: **text** or __text__
    if ((text.slice(i, i + 2) === "**" || text.slice(i, i + 2) === "__")) {
      const marker = text.slice(i, i + 2);
      const endPos = text.indexOf(marker, i + 2);
      if (endPos !== -1) {
        // Found complete bold token
        tokens.push(text.slice(i, endPos + 2));
        i = endPos + 2;
        continue;
      }
    }

    // Check for italic: *text* or _text_ (but not ** or __)
    if ((text[i] === "*" || text[i] === "_") && text[i + 1] !== text[i]) {
      const marker = text[i];
      const endPos = text.indexOf(marker, i + 1);
      if (endPos !== -1 && text[endPos - 1] !== " ") {
        tokens.push(text.slice(i, endPos + 1));
        i = endPos + 1;
        continue;
      }
    }

    // Check for inline code: `code`
    if (text[i] === "`" && text.slice(i, i + 3) !== "```") {
      const endPos = text.indexOf("`", i + 1);
      if (endPos !== -1) {
        tokens.push(text.slice(i, endPos + 1));
        i = endPos + 1;
        continue;
      }
    }

    // Check for markdown links: [text](url)
    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket);
        if (closeParen !== -1) {
          tokens.push(text.slice(i, closeParen + 1));
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Check for URLs starting with http:// or https://
    if (text.slice(i, i + 7) === "http://" || text.slice(i, i + 8) === "https://") {
      let endPos = i;
      while (endPos < text.length && !/[\s\)\]\>]/.test(text[endPos])) {
        endPos++;
      }
      tokens.push(text.slice(i, endPos));
      i = endPos;
      continue;
    }

    // Check for headers: # text (at start of line or after newline)
    if (text[i] === "#" && (i === 0 || text[i - 1] === "\n")) {
      // Find end of header line
      const endOfLine = text.indexOf("\n", i);
      if (endOfLine !== -1) {
        tokens.push(text.slice(i, endOfLine + 1));
        i = endOfLine + 1;
        continue;
      } else {
        // Header at end of text
        tokens.push(text.slice(i));
        i = text.length;
        continue;
      }
    }

    // Check for SOURCE tags: <SOURCE...>...</SOURCE>
    if (text.slice(i, i + 8) === "<SOURCE ") {
      const endTag = text.indexOf("</SOURCE>", i);
      if (endTag !== -1) {
        tokens.push(text.slice(i, endTag + 9));
        i = endTag + 9;
        continue;
      }
    }

    // Check for horizontal rule: --- or *** or ___ (3+ chars)
    if ((text[i] === "-" || text[i] === "*" || text[i] === "_") &&
      text[i + 1] === text[i] && text[i + 2] === text[i]) {
      let endPos = i + 3;
      while (endPos < text.length && text[endPos] === text[i]) {
        endPos++;
      }
      // Include trailing newline if present
      if (text[endPos] === "\n") endPos++;
      tokens.push(text.slice(i, endPos));
      i = endPos;
      continue;
    }

    // Regular character - add as single token
    tokens.push(text[i]);
    i++;
  }

  return tokens;
}

export function useTypewriter(text = "", speed = 20) {
  const [tokenIndex, setTokenIndex] = useState(0);

  // Tokenize the text - memoized to avoid re-tokenizing on every render
  const tokens = useMemo(() => tokenizeMarkdown(text), [text]);

  // Build displayed text from tokens
  const displayed = useMemo(() => {
    return tokens.slice(0, tokenIndex).join("");
  }, [tokens, tokenIndex]);

  useEffect(() => {
    if (!text) {
      setTokenIndex(0);
      return;
    }

    // Reset when text changes
    setTokenIndex(0);

    const interval = setInterval(() => {
      setTokenIndex((prev) => {
        if (prev >= tokens.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, tokens.length]);

  return displayed;
}
