import { useState, useEffect, useCallback } from "react";
import { Brain, Lightbulb, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface AIExplanationProps {
  code: string;
  language: string;
  highlightedLine?: number;
  onLineHighlight?: (lineNumber: number) => void;
}

interface Explanation {
  lineNumber: number;
  code: string;
  explanation: string;
  type: "syntax" | "logic" | "concept" | "warning" | "tip";
  difficulty: "beginner" | "intermediate" | "advanced";
}

// Mock AI explanations for demo
const generateMockExplanations = (code: string, language: string): Explanation[] => {
  const lines = code.split('\n');
  const explanations: Explanation[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine.includes('function') || trimmedLine.includes('def ') || trimmedLine.includes('public static')) {
      explanations.push({
        lineNumber,
        code: trimmedLine,
        explanation: "This declares a function that takes parameters and returns a value. Functions are reusable blocks of code that perform specific tasks.",
        type: "concept",
        difficulty: "beginner"
      });
    } else if (trimmedLine.includes('//') || trimmedLine.includes('#') || trimmedLine.includes('"""')) {
      explanations.push({
        lineNumber,
        code: trimmedLine,
        explanation: "This is a comment. Comments are ignored by the computer but help humans understand what the code does.",
        type: "syntax",
        difficulty: "beginner"
      });
    } else if (trimmedLine.includes('if') || trimmedLine.includes('throw') || trimmedLine.includes('raise')) {
      explanations.push({
        lineNumber,
        code: trimmedLine,
        explanation: "This is error handling - checking if something might go wrong and dealing with it appropriately. This prevents the program from crashing.",
        type: "logic",
        difficulty: "intermediate"
      });
    } else if (trimmedLine.includes('=') && !trimmedLine.includes('==') && !trimmedLine.includes('!=')) {
      explanations.push({
        lineNumber,
        code: trimmedLine,
        explanation: "This assigns a value to a variable. Variables are like containers that store data for later use.",
        type: "concept",
        difficulty: "beginner"
      });
    } else if (trimmedLine.includes('return')) {
      explanations.push({
        lineNumber,
        code: trimmedLine,
        explanation: "This returns a value from the function back to whoever called it. Think of it as the function's answer.",
        type: "concept",
        difficulty: "beginner"
      });
    } else if (trimmedLine.includes('console.log') || trimmedLine.includes('print') || trimmedLine.includes('cout')) {
      explanations.push({
        lineNumber,
        code: trimmedLine,
        explanation: "This displays output to the console/terminal. It's useful for debugging and showing results.",
        type: "syntax",
        difficulty: "beginner"
      });
    }
  });

  return explanations;
};

const typeIcons = {
  syntax: CheckCircle,
  logic: Brain,
  concept: Lightbulb,
  warning: AlertCircle,
  tip: Lightbulb,
};

const typeColors = {
  syntax: "bg-green-500/10 text-green-400 border-green-500/20",
  logic: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  concept: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  warning: "bg-red-500/10 text-red-400 border-red-500/20",
  tip: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-400",
  advanced: "bg-red-500/10 text-red-400",
};

export function AIExplanation({ code, language, highlightedLine, onLineHighlight }: AIExplanationProps) {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (code.trim()) {
      setIsAnalyzing(true);
      // Simulate AI processing delay
      const timer = setTimeout(() => {
        const newExplanations = generateMockExplanations(code, language);
        setExplanations(newExplanations);
        setIsAnalyzing(false);
        // Auto-expand first few items
        setExpandedItems(new Set([0, 1, 2]));
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [code, language]);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const downloadExplanation = useCallback(() => {
    if (explanations.length === 0) {
      toast.error("No explanations to download!");
      return;
    }
    
    const explanationText = [
      `Code Explanation - ${language.toUpperCase()}`,
      '='.repeat(50),
      '',
      ...explanations.map(exp => 
        `Line ${exp.lineNumber}: ${exp.explanation}\nCode: ${exp.code}\nType: ${exp.type} | Difficulty: ${exp.difficulty}\n`
      ),
      '',
      `Generated on: ${new Date().toLocaleString()}`,
      'Powered by Kodr AI'
    ].join('\n');
    
    const blob = new Blob([explanationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kodr-explanation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Explanation downloaded!");
  }, [explanations, language]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border bg-card/50">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">AI Analysis</h3>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center animate-pulse-glow mx-auto">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">Analyzing your code...</p>
              <p className="text-sm text-muted-foreground">AI is examining each line for explanations</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Explanations</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {explanations.length} insights
            </Badge>
            {explanations.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadExplanation}
                title="Download explanation"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Explanations List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {explanations.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No code to analyze</p>
            <p className="text-sm text-muted-foreground">Write some code to get AI explanations</p>
          </div>
        ) : (
          explanations.map((explanation, index) => {
            const Icon = typeIcons[explanation.type];
            const isExpanded = expandedItems.has(index);
            const isHighlighted = highlightedLine === explanation.lineNumber;

            return (
              <Card 
                key={index} 
                className={cn(
                  "transition-all duration-200 hover:shadow-lg cursor-pointer",
                  isHighlighted && "ring-2 ring-primary bg-primary/5"
                )}
                onClick={() => onLineHighlight?.(explanation.lineNumber)}
              >
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(index)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg border",
                            typeColors[explanation.type]
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">
                              Line {explanation.lineNumber}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", difficultyColors[explanation.difficulty])}
                              >
                                {explanation.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {explanation.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <code className="text-sm font-code text-primary">
                            {explanation.code}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {explanation.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}