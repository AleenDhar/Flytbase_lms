"use client";

import React, { useState, useEffect } from "react";

import { useTest } from "@/contexts/TestContext";
import { assignments } from "@/data/assignments";
import Timer from "@/components/Timer";
import TestNavigation from "@/components/TestNavigation";
import WarningModal from "@/components/WarningModal";
import SubmitModal from "@/components/SubmitModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const TestPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { testState, setAnswer, submitTest, clearTest } = useTest();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [assignment, setAssignment] = useState(
    assignments.find((a) => a.id === id)
  );
  const [localAnswer, setLocalAnswer] = useState<string | string[]>("");

  // Get the current question
  const currentQuestion = assignment?.questions[currentQuestionIndex];

  // Setup navigation watcher
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testState.isActive) {
        e.preventDefault();
        // e.returnValue = "";
        return "";
      }
    };

    const handleNavigation = (e: PopStateEvent) => {
      if (testState.isActive) {
        e.preventDefault();
        setWarningOpen(true);
        router.push(`/test/${id}`);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [testState.isActive, id]);

  // Load assignment and initialize test
  useEffect(() => {
    if (!assignment) {
      toast.error("Assignment not found", {
        description: "The test you're looking for doesn't exist.",
      });
      router.push("/");
      return;
    }

    if (!testState.isActive && !testState.completed) {
      // If the test isn't active and not completed, redirect back to assignment page
      router.push(`/assignment/${id}`);
    }

    // Handle test completion via time up
    if (testState.timeUp) {
      toast.error("Time's up!", {
        description: "Your test has been submitted automatically.",
      });
    }
  }, [
    assignment,
    testState.isActive,
    testState.completed,
    testState.timeUp,
    id,
  ]);

  // Load answers from testState when changing questions
  useEffect(() => {
    if (
      currentQuestion &&
      testState.answers[currentQuestion.id] !== undefined
    ) {
      setLocalAnswer(testState.answers[currentQuestion.id]);
    } else {
      setLocalAnswer("");
    }
  }, [currentQuestion, testState.answers]);

  if (!assignment || !currentQuestion) {
    return null;
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer before navigating
      if (currentQuestion && localAnswer) {
        setAnswer(currentQuestion.id, localAnswer);
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < assignment.questions.length - 1) {
      // Save current answer before navigating
      if (currentQuestion && localAnswer) {
        setAnswer(currentQuestion.id, localAnswer);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSave = () => {
    if (currentQuestion && localAnswer) {
      setAnswer(currentQuestion.id, localAnswer);
    }
  };

  const handleAnswerChange = (value: string | string[]) => {
    setLocalAnswer(value);
  };

  const handleOpenSubmitModal = () => {
    // Save current answer before showing submit modal
    if (currentQuestion && localAnswer) {
      setAnswer(currentQuestion.id, localAnswer);
    }
    setSubmitModalOpen(true);
  };

  const handleSubmitTest = () => {
    submitTest();
    toast.success("Test submitted successfully!");
    setSubmitModalOpen(false);
  };

  const handleLeaveTest = () => {
    clearTest();
    router.push("/");
  };

  const handleFinishReview = () => {
    router.push("/");
  };

  // Count answered questions
  const answeredQuestions = Object.keys(testState.answers).length;

  // Render test completion state
  if (testState.completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass-panel rounded-xl p-8 shadow-lg animate-scale-in">
          <div className="flex flex-col items-center text-center mb-8">
            {testState.timeUp ? (
              <>
                <Clock className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-3xl font-bold mb-2">Time's Up!</h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Your test has been automatically submitted as the time limit
                  was reached.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                <h1 className="text-3xl font-bold mb-2">Test Completed!</h1>
                <p className="text-lg text-muted-foreground mb-4">
                  You've successfully submitted your test for {assignment.title}
                  .
                </p>
              </>
            )}
          </div>

          <div className="bg-secondary/50 rounded-lg p-6 mb-8 border border-border/50">
            <h2 className="font-medium text-lg mb-4">Test Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Answered Questions</p>
                  <p className="text-2xl font-bold">
                    {answeredQuestions} / {assignment.questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Time Taken</p>
                  <p className="text-2xl font-bold">
                    {Math.floor(
                      (assignment.timeLimit * 60 * 1000 -
                        (testState.remainingTime || 0)) /
                        60000
                    )}{" "}
                    min
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/assignment">Return to Assignments</Link>
            </Button>
            <Button onClick={handleFinishReview}>Finish Review</Button>
          </div>
        </div>
      </div>
    );
  }

  // Render question with appropriate input type
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={localAnswer as string}
            onValueChange={handleAnswerChange}
            className="space-y-4 mt-6"
          >
            {currentQuestion.options?.map((option) => (
              <div
                key={option.id}
                className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-colors"
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="mt-1"
                />
                <Label
                  htmlFor={option.id}
                  className="w-full text-base font-normal cursor-pointer"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "essay":
      case "short-answer":
        return (
          <div className="mt-6">
            <Textarea
              placeholder="Type your answer here..."
              value={localAnswer as string}
              onChange={(e: any) => handleAnswerChange(e.target.value)}
              className="min-h-40 p-4 text-base"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-between">
            {assignment.title}
            <Timer />
          </h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {assignment.questions.length}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border/50 p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-foreground mb-6">
              {currentQuestion.text}
            </h2>
            {renderQuestionInput()}
          </div>

          <div className="pt-4 border-t border-border/50">
            <TestNavigation
              currentQuestion={currentQuestionIndex}
              totalQuestions={assignment.questions.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSave={handleSave}
              onSubmit={handleOpenSubmitModal}
              hasAnswer={!!testState.answers[currentQuestion.id]}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {answeredQuestions} of {assignment.questions.length} questions
            answered
          </div>
          <Button onClick={handleOpenSubmitModal} variant="default">
            Submit Test
          </Button>
        </div>
      </div>

      <WarningModal
        isOpen={warningOpen}
        onConfirm={handleLeaveTest}
        onCancel={() => setWarningOpen(false)}
      />

      <SubmitModal
        isOpen={submitModalOpen}
        onSubmit={handleSubmitTest}
        onCancel={() => setSubmitModalOpen(false)}
        answeredQuestions={answeredQuestions}
        totalQuestions={assignment.questions.length}
      />
    </div>
  );
};

export default TestPage;
