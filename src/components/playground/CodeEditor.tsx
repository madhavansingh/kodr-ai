import { useState, useRef, useEffect } from "react";
import { Play, Copy, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const extension = language === "cpp" ? "cpp" : language === "python" ? "py" : language === "java" ? "java" : "js";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetCode = () => {
    const originalCode = sampleCode[language as keyof typeof sampleCode];
    setCode(originalCode);
    onCodeChange?.(originalCode);
  };

  const runCode = () => {
    // Placeholder for code execution
    console.log("Running code:", code);
  };

  const renderCodeWithLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((line, index) => (
      <div
        key={index}
        className={cn(
          "code-line",
          highlightedLine === index + 1 && "highlighted animate-code-highlight"
        )}
      >
        <span className="line-number">{index + 1}</span>
        <span className="flex-1 whitespace-pre">{line || " "}</span>
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
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetCode}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 code-editor overflow-auto">
          <div className="font-code text-sm leading-relaxed">
            {renderCodeWithLineNumbers()}
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-primary resize-none outline-none font-code text-sm leading-relaxed p-4 pl-16"
          spellCheck={false}
          style={{ 
            lineHeight: '1.75rem',
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}