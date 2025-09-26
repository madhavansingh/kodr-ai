import { useState } from "react";
import { CodeEditor } from "@/components/playground/CodeEditor";
import { AIExplanation } from "@/components/playground/AIExplanation";

export default function Playground() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [highlightedLine, setHighlightedLine] = useState<number | undefined>();

  return (
    <div className="flex h-screen">
      {/* Code Editor Panel */}
      <div className="flex-1 flex flex-col border-r border-border">
        <CodeEditor
          onCodeChange={setCode}
          onLanguageChange={setLanguage}
          highlightedLine={highlightedLine}
        />
      </div>

      {/* AI Explanation Panel */}
      <div className="w-96 flex flex-col bg-card">
        <AIExplanation
          code={code}
          language={language}
          highlightedLine={highlightedLine}
          onLineHighlight={setHighlightedLine}
        />
      </div>
    </div>
  );
}