import { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
// Type definition of markdown option
interface MarkedOptions {
  gfm: boolean;
  breaks: boolean;
  headerIds: boolean;
  mangle: false;
  highlight?: (code: string, lang: string) => string;
}

/**
 * Markdown component for proper formatting of chat messages
 */
const MarkdownRenderer = ({ text }: { text: string }) => {
  const [html, setHtml] = useState("");

  const markedOptions: MarkedOptions = {
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false,
    highlight: (code: string, lang: string): string => code,
  };

  marked.setOptions(markedOptions);

  useEffect(() => {
    const parseMarkdown = async () => {
      let cleanText = text.trim();
      let parsed = await marked.parse(cleanText);
      setHtml(parsed.trim());
    };
    parseMarkdown();
  }, [text]);

  const sanitizedData = () => ({
    __html: DOMPurify.sanitize(html),
  });

  return <div dangerouslySetInnerHTML={sanitizedData()}></div>;
};

export { MarkdownRenderer };
