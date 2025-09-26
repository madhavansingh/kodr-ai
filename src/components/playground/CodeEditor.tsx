import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Copy, Download, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CodeEditorProps {
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  highlightedLine?: number;
}

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

const sampleCode = {
  javascript: `function calculateSum(a, b) {
  // Check if inputs are numbers
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both parameters must be numbers');
  }
  
  // Calculate the sum
  const result = a + b;
  
  // Return the result
  return result;
}

// Example usage
const num1 = 5;
const num2 = 10;
const sum = calculateSum(num1, num2);
console.log(\`The sum is: \${sum}\`);`,
  python: `def calculate_sum(a, b):
    """Calculate the sum of two numbers."""
    # Check if inputs are numbers
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Both parameters must be numbers")
    
    # Calculate the sum
    result = a + b
    
    # Return the result
    return result

# Example usage
num1 = 5
num2 = 10
sum_result = calculate_sum(num1, num2)
print(f"The sum is: {sum_result}")`,
  java: `public class Calculator {
    // Method to calculate sum of two numbers
    public static int calculateSum(int a, int b) {
        // Calculate the sum
        int result = a + b;
        
        // Return the result
        return result;
    }
    
    // Main method
    public static void main(String[] args) {
        // Example usage
        int num1 = 5;
        int num2 = 10;
        int sum = calculateSum(num1, num2);
        System.out.println("The sum is: " + sum);
    }
}`,
  cpp: `#include <iostream>
using namespace std;

// Function to calculate sum
int calculateSum(int a, int b) {
    // Calculate the sum
    int result = a + b;
    
    // Return the result
    return result;
}

int main() {
    // Example usage
    int num1 = 5;
    int num2 = 10;
    int sum = calculateSum(num1, num2);
    cout << "The sum is: " << sum << endl;
    
    return 0;
}`
};

export function CodeEditor({ onCodeChange, onLanguageChange, highlightedLine }: CodeEditorProps) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(sampleCode.javascript);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const newCode = sampleCode[language as keyof typeof sampleCode];
    setCode(newCode);
    onCodeChange?.(newCode);
  }, [language, onCodeChange]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  }, [code]);

  const downloadCode = useCallback(() => {
    const extension = language === "cpp" ? "cpp" : language === "python" ? "py" : language === "java" ? "java" : "js";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  }, [code, language]);

  const clearCode = useCallback(() => {
    setCode("");
    onCodeChange?.("");
    toast.success("Code cleared!");
  }, [onCodeChange]);

  const resetCode = useCallback(() => {
    const originalCode = sampleCode[language as keyof typeof sampleCode];
    setCode(originalCode);
    onCodeChange?.(originalCode);
    toast.success("Code reset to sample!");
  }, [language, onCodeChange]);

  const runCode = useCallback(() => {
    console.log("Running code:", code);
    toast.success("Code executed!");
  }, [code]);

  // Handle tab key for indentation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (e.shiftKey) {
        // Shift+Tab: Remove indentation
        const lines = code.split('\n');
        const startLine = code.substring(0, start).split('\n').length - 1;
        const endLine = code.substring(0, end).split('\n').length - 1;
        
        let newCode = '';
        let newStart = start;
        let newEnd = end;
        
        lines.forEach((line, index) => {
          if (index >= startLine && index <= endLine && line.startsWith('  ')) {
            const newLine = line.substring(2);
            newCode += newLine;
            if (index < startLine || (index === startLine && start > code.substring(0, code.split('\n').slice(0, index).join('\n').length + (index > 0 ? 1 : 0)).length + 2)) {
              newStart -= 2;
            }
            if (index < endLine || (index === endLine && end > code.substring(0, code.split('\n').slice(0, index).join('\n').length + (index > 0 ? 1 : 0)).length + 2)) {
              newEnd -= 2;
            }
          } else {
            newCode += line;
          }
          if (index < lines.length - 1) newCode += '\n';
        });
        
        setCode(newCode);
        onCodeChange?.(newCode);
        
        setTimeout(() => {
          textarea.setSelectionRange(Math.max(0, newStart), Math.max(0, newEnd));
        }, 0);
      } else {
        // Tab: Add indentation
        const newCode = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newCode);
        onCodeChange?.(newCode);
        
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
    }
  }, [code, onCodeChange]);

  // Handle click to position cursor
  const handleCodeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const codeContainer = e.currentTarget;
    const rect = codeContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate line and character position
    const lineHeight = 28; // 1.75rem in pixels
    const lineNumber = Math.floor(y / lineHeight);
    const lines = code.split('\n');
    
    if (lineNumber >= 0 && lineNumber < lines.length) {
      // Calculate character position within the line
      const line = lines[lineNumber];
      const charWidth = 8.4; // Approximate character width in monospace font
      const lineNumberWidth = 64; // Width of line number column (4rem)
      const charPosition = Math.max(0, Math.floor((x - lineNumberWidth) / charWidth));
      
      // Calculate cursor position in the entire text
      let position = 0;
      for (let i = 0; i < lineNumber; i++) {
        position += lines[i].length + 1; // +1 for newline
      }
      position += Math.min(charPosition, line.length);
      
      // Focus textarea and set cursor position
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(position, position);
      }
    }
  }, [code]);

  const renderCodeWithLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((line, index) => (
      <div
        key={index}
        className={cn(
          "flex items-start h-7 group transition-colors duration-200",
          highlightedLine === index + 1 && "bg-primary/10 border-l-2 border-primary animate-pulse"
        )}
      >
        <span className="w-16 flex-shrink-0 text-right pr-4 text-muted-foreground/60 select-none font-mono text-sm leading-7">
          {index + 1}
        </span>
        <span className="flex-1 whitespace-pre font-mono text-sm leading-7 min-h-[1.75rem]">
          {line || " "}
        </span>
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center space-x-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={runCode} size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Play className="w-4 h-4 mr-2" />
            Run Code
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={copyCode} title="Copy code">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode} title="Download code">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearCode} title="Clear code">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetCode} title="Reset to sample">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative bg-card border-t border-border">
        <div 
          className="absolute inset-0 overflow-auto cursor-text"
          onClick={handleCodeClick}
        >
          <div className="p-4 font-mono text-sm">
            {renderCodeWithLineNumbers()}
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-primary resize-none outline-none font-mono text-sm p-4 pl-20 leading-7"
          spellCheck={false}
          style={{ 
            lineHeight: '1.75rem',
            tabSize: 2,
            caretColor: 'hsl(var(--primary))',
          }}
          placeholder="Start typing or paste your code here..."
        />
      </div>
    </div>
  );
}