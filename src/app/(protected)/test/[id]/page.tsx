"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTest } from "@/contexts/TestContext";
import Timer from "@/components/Timer";
import TestNavigation from "@/components/TestNavigation";
import WarningModal from "@/components/WarningModal";
import SubmitModal from "@/components/SubmitModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  X,
  Menu,
  Save,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Interface for question options
interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

// Interface for questions
interface Question {
  id: string;
  text: string;
  type: string;
  options?: QuestionOption[];
  assessment_id: number;
  video_id?: string;
  difficulty?: string;
}

// Interface for assignment/assessment
interface Assignment {
  id: number;
  title: string;
  description: string;
  timeLimit: number | null;
  questions: Question[];
  thumbnail?: string;
}

const TestPage = () => {
  const { id } = useParams<{ id: string }>();
  const attemptCreatedRef = useRef(false);
  const router = useRouter();
  const supabase = createClient();
  const { testState, setAnswer, submitTest, clearTest } = useTest();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [localAnswer, setLocalAnswer] = useState<string | string[]>("");
  const [reviewMarks, setReviewMarks] = useState<Record<string, boolean>>({}); // Track questions marked for review
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile

  // Add state to track current attempt and saving state
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get the current question
  const currentQuestion = assignment?.questions[currentQuestionIndex];

  // Create attempt record when test starts
  const createAttemptRecord = async () => {
    if (!user?.id || !assignment) return;

    try {
      setIsSaving(true);

      // Check for existing attempts to determine attempt number
      const { data: existingAttempts, error: attemptError } = await supabase
        .from("assessment_attempts")
        .select("attempt_number")
        .eq("user_id", user.id)
        .eq("assessment_id", Number(id))
        .order("attempt_number", { ascending: false })
        .limit(1);

      if (attemptError) {
        console.error("Error checking existing attempts:", attemptError);
        return;
      }

      const attemptNumber =
        existingAttempts && existingAttempts.length > 0
          ? existingAttempts[0].attempt_number + 1
          : 1;

      // Create the attempt record with "in_progress" status
      const startTime = new Date().toISOString();

      const { data: attemptData, error: insertAttemptError } = await supabase
        .from("assessment_attempts")
        .insert({
          user_id: user.id,
          assessment_id: Number(id),
          attempt_number: attemptNumber,
          started_at: startTime,
          status: "in_progress", // Mark as in progress until submitted
        })
        .select()
        .single();

      if (insertAttemptError) {
        console.error("Error creating attempt record:", insertAttemptError);
        toast.error("Failed to start test", {
          description: "Please try refreshing the page.",
        });
        return;
      }

      // Store the attempt ID for later use
      setAttemptId(attemptData.id);
      console.log("Created attempt with ID:", attemptData.id);

      // After creating the attempt, load any existing answers
      await loadExistingAnswers(attemptData.id);
    } catch (error) {
      console.error("Error creating attempt:", error);
      toast.error("Failed to start test", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load existing answers for this attempt (in case of browser refresh)
  const loadExistingAnswers = async (currentAttemptId: number) => {
    try {
      const { data: existingAnswers, error } = await supabase
        .from("user_answers")
        .select("*")
        .eq("attempt_id", currentAttemptId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading existing answers:", error);
        return;
      }

      if (existingAnswers && existingAnswers.length > 0) {
        // Create a temporary object to hold answers
        const answersToRestore: Record<string, string | string[]> = {};

        // Process each answer and add to our local state
        existingAnswers.forEach((answer) => {
          if (answer.selected_option_id) {
            // For multiple choice
            answersToRestore[answer.question_id] = answer.selected_option_id;
          } else if (answer.essay_text) {
            // For essay questions
            answersToRestore[answer.question_id] = answer.essay_text;
          }
        });

        // Restore all answers at once by updating testState
        Object.entries(answersToRestore).forEach(([questionId, answer]) => {
          setAnswer(questionId, answer);
        });

        // Also restore review marks if they exist
        // (This would require a separate table or field in your DB)
      }
    } catch (error) {
      console.error("Error loading existing answers:", error);
    }
  };

  // Save or update an answer in the database
  const saveAnswerToDatabase = async (
    questionId: string,
    answer: string | string[]
  ) => {
    console.log("attempt:", attemptId);
    console.log("questionid:", questionId);
    console.log("answer:", answer);
    if (!attemptId || !user?.id || !questionId) return;

    try {
      setIsSaving(true);

      // Determine if this is a multiple-choice or essay question
      const isMultipleChoice = typeof answer === "string";

      // Check if this answer already exists
      const { data: existingAnswer, error: checkError } = await supabase
        .from("user_answers")
        .select("*")
        .eq("question_id", questionId)
        .eq("attempt_id", attemptId)
        .eq("user_id", user.id);

      if (checkError) {
        console.error("Error checking existing answer:", checkError);
        return;
      }

      if (existingAnswer && existingAnswer.length > 0) {
        // Update existing answer
        const { error: updateError } = await supabase
          .from("user_answers")
          .update({
            selected_option_id: isMultipleChoice ? answer : null,
            essay_text: !isMultipleChoice ? answer : null,
          })
          .eq("id", existingAnswer[0].id);

        if (updateError) {
          console.error("Error updating answer:", updateError);
          toast.error("Failed to save answer", {
            description: "Your answer may not be saved.",
          });
        }
      } else {
        // Insert new answer
        const { error: insertError } = await supabase
          .from("user_answers")
          .insert({
            question_id: questionId,
            user_id: user.id,
            attempt_id: attemptId,
            selected_option_id: isMultipleChoice ? answer : null,
            essay_text: !isMultipleChoice ? answer : null,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error inserting answer:", insertError);
          toast.error("Failed to save answer", {
            description: "Your answer may not be saved.",
          });
        }
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving answer to both context and database
  const handleSetAnswer = (questionId: string, answer: string | string[]) => {
    // First, update local state through the context
    setAnswer(questionId, answer);

    // Then save to database
    saveAnswerToDatabase(questionId, answer);
  };

  // Handle sidebar based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Auto-hide sidebar on small screens, show on larger screens
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create attempt when test starts
  useEffect(() => {
    if (
      user &&
      assignment &&
      testState.isActive &&
      !attemptId &&
      !attemptCreatedRef.current
    ) {
      attemptCreatedRef.current = true; // Mark attempt creation as initiated
      createAttemptRecord();
    }
  }, [user, assignment, testState.isActive, attemptId]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Error in fetchUser:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch assignment and questions data
  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);

        // 1. Fetch the assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", Number(id))
          .single();

        if (assessmentError) {
          throw new Error(
            `Error fetching assessment: ${assessmentError.message}`
          );
        }

        if (!assessmentData) {
          toast.error("Assignment not found");
          router.push("/assignment");
          return;
        }

        // 2. Fetch questions related to this assessment
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("assessment_id", Number(id));

        if (questionsError) {
          throw new Error(
            `Error fetching questions: ${questionsError.message}`
          );
        }

        if (!questionsData || questionsData.length === 0) {
          toast.error("No questions found for this test", {
            description: "This test doesn't have any questions yet.",
          });
          router.push(`/assignment/${id}`);
          return;
        }

        // Process questions to get options for multiple-choice questions
        const processedQuestions = await Promise.all(
          questionsData.map(async (question) => {
            let options = [];

            // If question type is multiple-choice, fetch options
            if (question.question_type === "multiple-choice") {
              const { data: optionsData, error: optionsError } = await supabase
                .from("question_options")
                .select("*")
                .eq("question_id", question.id);

              if (optionsError) {
                console.error(
                  `Error fetching options for question ${question.id}:`,
                  optionsError
                );
              } else if (optionsData && optionsData.length > 0) {
                // Map database field names to expected format
                options = optionsData.map((option) => ({
                  id: option.id,
                  text: option.option_text || option.text, // Try both field names
                  is_correct: option.is_correct,
                }));
              } else {
                console.warn(`No options found for question ${question.id}`);
              }
            }

            return {
              id: question.id,
              text: question.question_text || question.text, // Try both field names
              type: question.question_type || question.type, // Try both field names
              options: options,
              assessment_id: question.assessment_id,
              video_id: question.video_id,
              difficulty: question.difficulty,
            };
          })
        );

        // 3. Set the assignment state with all the data
        setAssignment({
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description,
          timeLimit: assessmentData.time_limit,
          thumbnail: assessmentData.thumbnail,
          questions: processedQuestions,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load test data", {
          description: "Please try again or contact support.",
        });
        router.push("/assignment");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssignmentData();
    }
  }, [id, supabase, router]);

  // Setup navigation watcher
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testState.isActive) {
        e.preventDefault();
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
  }, [testState.isActive, id, router]);

  // Load assignment and initialize test
  useEffect(() => {
    if (loading) return;

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
    loading,
    router,
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

  // Cleanup any pending save operations on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Loading test...</span>
      </div>
    );
  }

  if (!assignment || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-card rounded-lg shadow-sm border">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Test Unavailable</h2>
          <p className="mb-6 text-muted-foreground">
            This test is unavailable or has no questions.
          </p>
          <Button asChild>
            <Link href="/assignment">Return to Assignments</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Handler for marking questions for review
  const toggleMarkForReview = () => {
    if (!currentQuestion) return;

    setReviewMarks((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));

    // Save current answer if available
    if (localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
    }

    toast.success(
      reviewMarks[currentQuestion.id]
        ? "Removed review mark"
        : "Marked for review"
    );
  };

  const handlePrevious = () => {
    if (submitting) return;

    if (currentQuestionIndex > 0) {
      // Save current answer before navigating
      if (currentQuestion && localAnswer) {
        handleSetAnswer(currentQuestion.id, localAnswer);
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (submitting) return;

    if (currentQuestionIndex < assignment.questions.length - 1) {
      // Save current answer before navigating
      if (currentQuestion && localAnswer) {
        handleSetAnswer(currentQuestion.id, localAnswer);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSave = () => {
    if (submitting) return;

    if (currentQuestion && localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
      toast.success("Answer saved", {
        description: "Your answer has been saved.",
      });
    }
  };

  const handleAnswerChange = (value: string | string[]) => {
    setLocalAnswer(value);

    // For multiple choice, save immediately
    if (currentQuestion && typeof value === "string") {
      handleSetAnswer(currentQuestion.id, value);
    } else if (currentQuestion) {
      // For essay/text responses, use debouncing to avoid saving on every keystroke
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleSetAnswer(currentQuestion.id, value);
      }, 1000); // Save after 1 second of inactivity
    }
  };

  const handleOpenSubmitModal = () => {
    if (submitting || submitModalOpen) return;

    // Save current answer before showing submit modal
    if (currentQuestion && localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
    }
    setSubmitModalOpen(true);
  };

  const handleSubmitTest = async () => {
    // Prevent multiple submissions
    if (submitting) return;

    try {
      // Save the current answer if any
      if (currentQuestion && localAnswer) {
        handleSetAnswer(currentQuestion.id, localAnswer);
      }

      setSubmitting(true);

      // Use actual user details from Supabase
      const userDetails = {
        userId: user?.id || "anonymous",
        userName: user?.user_metadata?.full_name || "Anonymous User",
        email: user?.email || "no-email",
      };

      // Calculate finish time
      const finishTime = new Date().toISOString();

      // Calculate score for multiple-choice questions
      let correctAnswers = 0;
      let totalMultipleChoice = 0;

      Object.entries(testState.answers).forEach(([questionId, answer]) => {
        // Find question in assignment
        const question = assignment.questions.find((q) => q.id === questionId);

        if (
          question &&
          question.type === "multiple-choice" &&
          typeof answer === "string"
        ) {
          totalMultipleChoice++;

          // Find if the selected option is correct
          const selectedOption = question.options?.find(
            (opt) => opt.id === answer
          );
          if (selectedOption && selectedOption.is_correct) {
            correctAnswers++;
          }
        }
      });

      // Calculate score as percentage if there are multiple choice questions
      const score =
        totalMultipleChoice > 0
          ? Math.round((correctAnswers / totalMultipleChoice) * 100)
          : null;

      // Update the existing attempt record instead of creating a new one
      if (!attemptId) {
        throw new Error("No active attempt found");
      }

      const { error: updateAttemptError } = await supabase
        .from("assessment_attempts")
        .update({
          finished_at: finishTime,
          score: score,
          status: "completed",
        })
        .eq("id", attemptId);

      if (updateAttemptError) {
        console.error("Error updating attempt record:", updateAttemptError);
        throw new Error("Failed to update test attempt");
      }

      // 4. Create payload for API
      const payload = {
        testId: id,
        attemptId: attemptId,
        userDetails: userDetails,
        answers: testState.answers,
        timeSpent:
          (assignment.timeLimit || 0) * 60 * 1000 -
          (testState.remainingTime || 0),
        submittedAt: finishTime,
        score: score,
      };

      // Send POST request to your API endpoint
      const response = await fetch(
        "https://srv-roxra.app.n8n.cloud/webhook/0ef3ba2e-0826-4d50-9e0d-9448674ac035",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit test to external API");
      }

      // Once successfully submitted, update local state
      submitTest();
      toast.success("Test submitted successfully!");
      setSubmitModalOpen(false);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      // Add a small delay before resetting the submitting state
      setTimeout(() => {
        setSubmitting(false);
      }, 500);
    }
  };

  const handleLeaveTest = () => {
    if (submitting) return;

    clearTest();
    router.push("/");
  };

  const handleFinishReview = () => {
    if (submitting) return;

    router.push("/");
  };

  // Navigate to a specific question
  const navigateToQuestion = (index: number) => {
    if (submitting || index === currentQuestionIndex) return;

    // Save current answer before navigating
    if (currentQuestion && localAnswer) {
      handleSetAnswer(currentQuestion.id, localAnswer);
    }
    setCurrentQuestionIndex(index);

    // Auto-close sidebar on mobile after selecting a question
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Get status of a question (for sidebar)
  const getQuestionStatus = (questionId: string) => {
    const isReviewed = reviewMarks[questionId] || false;
    const isAnswered = !!testState.answers[questionId];

    if (isReviewed && isAnswered) return "answered-review";
    if (isReviewed) return "review";
    if (isAnswered) return "answered";
    return "not-answered";
  };

  // Format time for display
  const formatTime = (ms?: number) => {
    if (!ms) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Count answered questions
  const answeredQuestions = Object.keys(testState.answers).length;
  const markedForReviewCount =
    Object.values(reviewMarks).filter(Boolean).length;
  const unansweredCount = assignment.questions.length - answeredQuestions;

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
                      ((assignment.timeLimit || 0) * 60 * 1000 -
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
            <Button variant="outline" asChild disabled={submitting}>
              <Link href="/assignment">Return to Assignments</Link>
            </Button>
            <Button
              onClick={handleFinishReview}
              disabled={submitting}
              className="cursor-pointer"
            >
              Finish Review
            </Button>
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
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className=""
                  />
                  <Label
                    htmlFor={option.id}
                    className="w-full text-base font-normal cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))
            ) : (
              <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground text-center">
                  No options available for this question.
                </p>
              </div>
            )}
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
              disabled={submitting}
            />
          </div>
        );
      default:
        return (
          <div className="mt-6 p-4 border rounded-lg bg-secondary/30">
            <p className="text-muted-foreground text-center">
              Unsupported question type: {currentQuestion.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Main content */}
      <div className="p-3 sm:p-6 transition-all duration-300">
        <div className="max-w-3xl mx-auto">
          {/* Header section */}
          <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {assignment.title}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of{" "}
                  {assignment.questions.length}
                </p>
                <div className="hidden sm:flex items-center gap-2 bg-card p-2 rounded-lg font-mono text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  {formatTime(testState.remainingTime)}
                </div>
                <div className="sm:hidden flex items-center gap-1 bg-card px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3 text-primary" />
                  {formatTime(testState.remainingTime)}
                </div>

                {/* Show auto-save indicator */}
                {isSaving && (
                  <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded text-xs animate-pulse">
                    <Save className="h-3 w-3" />
                    <span>Saving...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar toggle button */}
            {!sidebarOpen && (
              <Button
                onClick={() => setSidebarOpen(true)}
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg flex items-center justify-center"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Question card */}
          <div className="bg-card rounded-xl shadow-sm border border-border/50 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-foreground mb-6">
                {currentQuestion.text}
              </h2>
              {renderQuestionInput()}
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <TestNavigation
                  currentQuestion={currentQuestionIndex}
                  totalQuestions={assignment.questions.length}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSave={handleSave}
                  onSubmit={handleOpenSubmitModal}
                  hasAnswer={!!testState.answers[currentQuestion.id]}
                />

                <Button
                  variant={
                    reviewMarks[currentQuestion.id] ? "default" : "outline"
                  }
                  size="sm"
                  onClick={toggleMarkForReview}
                  className="mt-2 sm:mt-0 w-full sm:w-auto"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {reviewMarks[currentQuestion.id]
                    ? "Unmark Review"
                    : "Mark for Review"}
                </Button>
              </div>
            </div>
          </div>

          {/* Submit section */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {answeredQuestions} of {assignment.questions.length} questions
              answered
            </div>
            <Button
              onClick={handleOpenSubmitModal}
              variant="default"
              disabled={submitting}
              className={submitting ? "cursor-not-allowed" : "cursor-pointer"}
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Right sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-[320px] md:w-[280px] lg:w-[320px] bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 p-4 border-b border-border flex justify-between items-center bg-card/95 backdrop-blur-sm">
            <h2 className="font-bold text-base">Test Navigation</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-muted/30">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Answered</div>
              <div className="font-bold">{answeredQuestions}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Unanswered</div>
              <div className="font-bold">{unansweredCount}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">For Review</div>
              <div className="font-bold">{markedForReviewCount}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-medium mb-2">Legend:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-600"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-border"></div>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-rose-500 dark:bg-rose-600"></div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-600"></div>
                <span>For Review</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-violet-500 dark:bg-violet-600"></div>
                <span>Answered+Review</span>
              </div>
            </div>
          </div>

          {/* Question Navigation Buttons */}
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-medium mb-2">Questions:</h3>
            <div className="grid grid-cols-6 sm:grid-cols-5 gap-2">
              {assignment.questions.map((question, index) => {
                const status = getQuestionStatus(question.id);
                let buttonClass = "";

                if (status === "answered")
                  buttonClass =
                    "bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-transparent";
                else if (status === "review")
                  buttonClass =
                    "bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white border-transparent";
                else if (status === "answered-review")
                  buttonClass =
                    "bg-violet-500 dark:bg-violet-600 hover:bg-violet-600 dark:hover:bg-violet-700 text-white border-transparent";
                else if (
                  index < currentQuestionIndex &&
                  !testState.answers[question.id]
                )
                  buttonClass =
                    "bg-rose-500 dark:bg-rose-600 hover:bg-rose-600 dark:hover:bg-rose-700 text-white border-transparent";

                // Add ring for current question
                if (currentQuestionIndex === index) {
                  buttonClass +=
                    " ring-2 ring-primary dark:ring-primary ring-offset-1 ring-offset-background";
                }

                return (
                  <Button
                    key={question.id}
                    className={`h-10 w-10 p-0 font-normal ${buttonClass}`}
                    onClick={() => navigateToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="sticky bottom-0 p-3 border-t border-border grid grid-cols-1 gap-2 bg-card/95 backdrop-blur-sm">
            <Button
              variant="default"
              onClick={handleOpenSubmitModal}
              disabled={submitting}
              className="w-full"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
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
