"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  AlertCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface TestNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onSubmit: () => void;
  hasAnswer: boolean;
}

const TestNavigation: React.FC<TestNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSave,
  onSubmit,
  hasAnswer,
}) => {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleSave = () => {
    onSave();
    toast.success("Answer saved", {
      description: `Question ${currentQuestion + 1} saved successfully.`,
    });
  };

  return (
    <div className="w-full py-4 flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="group"
      >
        <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Previous
      </Button>

      <div className="flex items-center space-x-2">
        {!hasAnswer && (
          <div className="flex items-center text-amber-500 mr-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Not answered</span>
          </div>
        )}

        <Button variant="ghost" onClick={handleSave} size="sm">
          <Save className="mr-1 h-4 w-4" />
          Save
        </Button>

        {isLastQuestion && (
          <Button
            onClick={onSubmit}
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="mr-1 h-4 w-4" />
            Submit Test
          </Button>
        )}
      </div>

      <Button
        variant={isLastQuestion ? "outline" : "default"}
        onClick={onNext}
        disabled={isLastQuestion}
        className="group"
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};

export default TestNavigation;
