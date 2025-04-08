"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Define interfaces based on the actual database schema
interface Chapter {
  id: number;
  title: string;
  order: number;
  isOpen?: boolean;
  completionPercentage?: number;
  videos: Video[];
}

interface Video {
  id: number;
  title: string;
  youtube_video_id: string;
  about: string | null;
  thumbnail: string | null;
  order_in_chapter?: number;
  completed?: boolean;
}

interface Assessment {
  id: number;
  title: string;
  course_id: number;
  description?: string | null;
  passing_percentage?: number;
  questions?: AssessmentQuestion[];
}

interface AssessmentQuestion {
  id: number;
  assessment_id: number;
  question_text: string;
  question_type: string;
  options?: QuestionOption[];
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  video_id?: number;
}

interface QuestionOption {
  id: number;
  option_text: string;
  is_correct: boolean;
}

interface UserAnswer {
  question_id: number;
  selected_option_id: number;
}

// Circular progress component for courses/sections
const ProgressCircle = ({
  percentage,
  isActive,
}: {
  percentage: number;
  isActive: boolean;
}) => {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      {/* Background circle */}
      <svg className="w-6 h-6 absolute top-0 left-0">
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="#333"
          strokeWidth="2"
          fill="transparent"
        />
      </svg>

      {/* Progress circle */}
      <svg className="w-6 h-6 absolute top-0 left-0 -rotate-90">
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke={
            isActive ? "#6b5de4" : percentage === 100 ? "#10b981" : "#64748b"
          }
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#6b5de4] rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

const Certificate = () => {
  const { id: courseId } = useParams();
  const router = useRouter();
  const supabase = createClient();

  // State variables
  // Add this to your state variables
  // Add these state variables to your component
  const [videoAnswers, setVideoAnswers] = useState({});
  const [videoCorrectAnswers, setVideoCorrectAnswers] = useState({});
  const [videoTotalQuestions, setVideoTotalQuestions] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("Loading...");
  const [courseDescription, setCourseDescription] = useState("");
  const [activeSection, setActiveSection] = useState("quizzes"); // quizzes, assessment, certificate
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionOptions, setQuestionOptions] = useState<{
    [key: number]: QuestionOption[];
  }>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  // const [quizExpanded, setQuizExpanded] = useState(true);
  const [quizResults, setQuizResults] = useState({
    shown: false,
    score: 0,
    total: 0,
  });
  const [userProgress, setUserProgress] = useState<Set<number>>(new Set());
  const [quizzesCollapsed, setQuizzesCollapsed] = useState(false);
  const [assessmentsCollapsed, setAssessmentsCollapsed] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null
  );

  // Fetch course data
  // Fetch course data
  // Fetch course data
  useEffect(() => {
    // Replace your sequential queries with this optimized version
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Fetch course details with a single query
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title, description")
          .eq("id", courseId)
          .single();

        if (courseError) {
          console.error("Error fetching course:", courseError);
          return;
        }

        if (courseData) {
          setCourseTitle(courseData.title);
          setCourseDescription(courseData.description || "");
        }

        // Fetch videos and assessments in parallel
        const [videosResponse, assessmentsResponse, userResponse] =
          await Promise.all([
            supabase
              .from("videos")
              .select("*")
              .eq("course_id", courseId)
              .order("id"),
            supabase
              .from("assessments")
              .select("*")
              .eq("course_id", courseId)
              .order("id"),
            supabase.auth.getUser(),
          ]);

        // Process videos
        if (videosResponse.error) {
          console.error("Error fetching videos:", videosResponse.error);
        } else if (videosResponse.data && videosResponse.data.length > 0) {
          setVideos(videosResponse.data);

          // Set initial current video
          setCurrentVideo(videosResponse.data[0]);
        }

        // Process assessments
        if (assessmentsResponse.error) {
          console.error(
            "Error fetching assessments:",
            assessmentsResponse.error
          );
        } else if (
          assessmentsResponse.data &&
          assessmentsResponse.data.length > 0
        ) {
          setAssessments(assessmentsResponse.data);
          setCurrentAssessment(assessmentsResponse.data[0]);
        }

        // If user is logged in, fetch progress data
        const user = userResponse.data.user;
        if (user && videosResponse.data) {
          const videoIds = videosResponse.data.map((v) => v.id);

          const { data: completedVideosData, error: completedVideosError } =
            await supabase
              .from("video_watched")
              .select("video_id, quiz_taken")
              .eq("user_id", user.id)
              .in("video_id", videoIds);

          if (completedVideosError) {
            console.error(
              "Error fetching completed videos:",
              completedVideosError
            );
          } else if (completedVideosData) {
            // Create a Set of completed video IDs
            const completedVideoIds = new Set(
              completedVideosData
                .filter((item) => item.quiz_taken)
                .map((item) => item.video_id)
            );

            // Update user progress state
            setUserProgress(completedVideoIds);
          }
        }

        // Finally, fetch questions for the initial video
        if (videosResponse.data && videosResponse.data.length > 0) {
          await fetchQuestionsForVideo(videosResponse.data[0].id, user);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setLoading(false);
      }
    };

    // Separate function to fetch user progress
    const fetchUserProgress = async (courseVideoIds) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch videos with quiz_taken true
          const { data: completedVideosData, error: completedVideosError } =
            await supabase
              .from("video_watched")
              .select("video_id")
              .eq("user_id", user.id)
              .eq("quiz_taken", true);

          if (completedVideosError) {
            console.error(
              "Error fetching completed videos:",
              completedVideosError
            );
            return;
          }

          if (completedVideosData) {
            // Filter completed videos to only include ones from this course
            const filteredCompletedVideos = completedVideosData.filter((item) =>
              courseVideoIds.includes(item.video_id)
            );

            // Create a Set of completed video IDs
            const completedVideoIds = new Set(
              filteredCompletedVideos.map((item) => item.video_id)
            );

            // Update user progress state
            setUserProgress(completedVideoIds);
          }
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Optimized question fetching
  const fetchQuestionsForVideo = async (videoId, user = null) => {
    try {
      // Fetch questions for this video where after_videoend is true
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("video_id", videoId)
        .eq("after_videoend", true);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return;
      }

      setQuestions(questionsData || []);

      if (questionsData && questionsData.length > 0) {
        // Get all question IDs
        const questionIds = questionsData.map((q) => q.id);

        // Fetch all options for these questions in a single query
        const { data: allOptionsData, error: optionsError } = await supabase
          .from("question_options")
          .select("*")
          .in("question_id", questionIds);

        if (optionsError) {
          console.error("Error fetching options:", optionsError);
          return;
        }

        // Group options by question_id
        const optionsByQuestion = {};
        allOptionsData.forEach((option) => {
          if (!optionsByQuestion[option.question_id]) {
            optionsByQuestion[option.question_id] = [];
          }
          optionsByQuestion[option.question_id].push(option);
        });

        setQuestionOptions(optionsByQuestion);

        // If user is logged in, fetch previous answers
        if (user) {
          const { data: userAnswersData, error: userAnswersError } =
            await supabase
              .from("user_answers")
              .select("question_id, selected_option_id")
              .eq("user_id", user.id)
              .in("question_id", questionIds)
              .order("created_at", { ascending: false });

          if (userAnswersError) {
            console.error("Error fetching user answers:", userAnswersError);
            return;
          }

          // Create a map of the most recent answers for each question
          const previousAnswersMap = {};
          userAnswersData.forEach((answer) => {
            // Only set the answer if it hasn't been set yet (keeping the most recent)
            if (!previousAnswersMap[answer.question_id]) {
              previousAnswersMap[answer.question_id] =
                answer.selected_option_id;
            }
          });

          // Pre-fill answers if we have previous ones
          if (Object.keys(previousAnswersMap).length > 0) {
            setSelectedAnswers(previousAnswersMap);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchQuestionsForVideo:", error);
    }
  };

  // Function to fetch assessment questions
  const fetchAssessmentQuestions = async (assessmentId: number) => {
    try {
      // First, check if the assessment exists
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (assessmentError) {
        console.error("Error fetching assessment:", assessmentError);
        return;
      }

      // Try to fetch questions from questions table instead
      // Assuming questions might be linked to assessments through an assessment_id field
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("assessment_id", assessmentId);

      // If that fails too, just set empty questions
      if (questionsError) {
        console.error("Could not fetch assessment questions:", questionsError);
        setCurrentAssessment({
          ...assessment,
          questions: [],
        });
        return;
      }

      // Update the current assessment with its questions
      if (questionsData && questionsData.length > 0) {
        setCurrentAssessment({
          ...assessment,
          questions: questionsData,
        });

        // Fetch options for each question
        for (const question of questionsData) {
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
            // Update the question with its options
            setCurrentAssessment((prev) => {
              if (!prev || !prev.questions) return prev;
              return {
                ...prev,
                questions: prev.questions.map((q) =>
                  q.id === question.id ? { ...q, options: optionsData } : q
                ),
              };
            });
          }
        }
      } else {
        // No questions found, set empty array
        setCurrentAssessment({
          ...assessment,
          questions: [],
        });
      }
    } catch (error) {
      console.error("Error in fetchAssessmentQuestions:", error);
    }
  };

  // Handle video selection
  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    fetchQuestionsForVideo(video.id);
  };

  // Handle assessment selection
  const handleAssessmentSelect = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setActiveSection("assessment"); // Ensure assessment section is active
    fetchAssessmentQuestions(assessment.id);

    // Navigate to the assessment detail page
    // router.push(`/assignment/${assessment.id}`);
  };

  // Toggle quizzes section collapse
  const toggleQuizzesCollapse = () => {
    setQuizzesCollapsed((prev) => !prev);
    setActiveSection("quizzes");
  };

  // Toggle assessments section collapse
  const toggleAssessmentsCollapse = () => {
    setAssessmentsCollapsed((prev) => !prev);
    setActiveSection("assessment");

    // Check if there are assessments before trying to access
    if (assessments.length > 0 && !currentAssessment) {
      handleAssessmentSelect(assessments[0]);
    }
  };

  // In the assessments rendering section, add more null checks
  {
    !assessmentsCollapsed && (
      <div className="space-y-1 ml-4 border-l border-gray-800 pl-2 mt-1">
        {assessments && assessments.length > 0 ? (
          assessments.map((assessment) => {
            const isCurrentAssessment =
              currentAssessment && currentAssessment.id === assessment.id;

            return (
              <div
                key={assessment.id}
                className={`flex items-center gap-3 py-2 px-4 rounded cursor-pointer transition-colors ${
                  isCurrentAssessment
                    ? "bg-[#242424] text-[#6b5de4]"
                    : "hover:bg-[#242424] text-gray-300"
                }`}
                onClick={() => handleAssessmentSelect(assessment)}
              >
                {/* ... rest of assessment rendering ... */}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-2 text-sm text-gray-400">
            No assessments available
          </div>
        )}
      </div>
    );
  }

  // Handle answer selection in quiz
  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Check if quiz is complete
  const isQuizComplete = () => {
    return (
      questions.length > 0 &&
      questions.every((q) => selectedAnswers[q.id] !== undefined)
    );
  };

  // Submit quiz answers
  // Submit quiz answers
  const handleQuizSubmit = async () => {
    try {
      let correctCount = 0;
      const totalQuestions = questions.length;

      // Calculate score
      questions.forEach((question) => {
        const selectedOptionId = selectedAnswers[question.id];
        if (selectedOptionId === undefined) return;

        const correctOption = questionOptions[question.id]?.find(
          (o) => o.is_correct
        );
        if (correctOption && correctOption.id === selectedOptionId) {
          correctCount++;
        }
      });

      setQuizResults({
        shown: true,
        score: correctCount,
        total: totalQuestions,
      });

      // Save user answers to database if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && currentVideo) {
        // Prepare answers for insertion
        const answersToInsert = [];
        for (const questionId in selectedAnswers) {
          const optionId = selectedAnswers[questionId];
          answersToInsert.push({
            user_id: user.id,
            question_id: parseInt(questionId),
            selected_option_id: optionId,
            created_at: new Date().toISOString(),
          });
        }

        if (answersToInsert.length > 0) {
          const { error } = await supabase
            .from("user_answers")
            .insert(answersToInsert);

          if (error) {
            console.error("Error saving quiz answers:", error);
          }
        }

        // Mark quiz as taken by updating video_watched table
        await supabase.from("video_watched").upsert(
          {
            user_id: user.id,
            video_id: currentVideo.id,
            quiz_taken: true,
            progress_percentage: 100,
            watched_at: new Date().toISOString(),
          },
          { onConflict: "user_id,video_id" }
        );

        // Update userProgress state with the completed quiz
        setUserProgress((prev) => new Set([...prev, currentVideo.id]));
        console.log(userProgress);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  // Render sidebar menu items with progress circles
  const renderMenuItem = (
    title: string,
    key: string,
    percentage: number = 0,
    options = { hasChildren: false, isCollapsed: false, onToggle: () => {} }
  ) => {
    const isActive = activeSection === key;

    return (
      <div
        className={`flex items-center gap-3 py-3 px-4 cursor-pointer transition-colors ${
          isActive ? "bg-[#242424]" : "hover:bg-[#242424]"
        }`}
        onClick={
          options.hasChildren ? options.onToggle : () => setActiveSection(key)
        }
      >
        <ProgressCircle percentage={percentage} isActive={isActive} />
        <span
          className={`font-medium flex-1 ${
            isActive ? "text-[#6b5de4]" : "text-white"
          }`}
        >
          {title}
        </span>

        {options.hasChildren && (
          <div className="text-gray-400">
            <svg
              className={`w-5 h-5 transition-transform ${
                options.isCollapsed ? "-rotate-90" : "rotate-0"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="w-8 h-8 border-2 border-[#6b5de4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate completion percentages (placeholder logic)
  const quizzesCompletion =
    (Array.from(userProgress).length / videos.length) * 100;

  const assessmentCompletion = 0; // To be implemented based on actual data
  const certificateCompletion = 0; // To be implemented based on actual data

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header with Course Title */}
      <div className="bg-gradient-to-r from-[#4e43c0] to-[#6b5de4] py-14">
        <h1 className="text-3xl font-bold text-center text-white">
          {courseTitle}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row ">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-[#1a1a1a] min-h-[calc(100vh-112px)] p-4 overflow-y-auto">
          {/* Main sections */}
          <div className="mb-6 border-b border-gray-800 pb-4">
            {renderMenuItem("Quizzes", "quizzes", quizzesCompletion, {
              hasChildren: true,
              isCollapsed: quizzesCollapsed,
              onToggle: toggleQuizzesCollapse,
            })}

            {/* Quizzes content - visible when not collapsed */}
            {!quizzesCollapsed && (
              <div className="space-y-1 ml-4 border-l border-gray-800 pl-2 mt-1">
                {videos.map((video, index) => {
                  const isCurrentVideo =
                    currentVideo && currentVideo.id === video.id;
                  const isCompleted = userProgress.has(video.id);

                  return (
                    <div
                      key={video.id}
                      className={`flex items-center gap-3 py-2 px-4 rounded hover:bg-[#242424] cursor-pointer transition-colors
        ${isCurrentVideo ? "bg-[#242424]" : ""}`}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center 
        ${
          isCompleted
            ? "bg-green-500/20 text-green-400"
            : isCurrentVideo
            ? "bg-[#6b5de4]/20 text-[#6b5de4]"
            : "bg-[#333] text-[#ccc]"
        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isCurrentVideo ? (
                          <Play className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-xs">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isCompleted
                            ? "text-green-400"
                            : isCurrentVideo
                            ? "text-[#6b5de4] font-medium"
                            : "text-gray-300"
                        }`}
                      >
                        {video.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {renderMenuItem("Assessment", "assessment", assessmentCompletion, {
              hasChildren: true,
              isCollapsed: assessmentsCollapsed,
              onToggle: toggleAssessmentsCollapse,
            })}

            {/* Assessment content - visible when not collapsed */}
            {!assessmentsCollapsed && (
              <div className="space-y-1 ml-4 border-l border-gray-800 pl-2 mt-1">
                {assessments.length > 0 ? (
                  assessments.map((assessment) => {
                    const isCurrentAssessment =
                      currentAssessment &&
                      currentAssessment.id === assessment.id;

                    return (
                      <div
                        key={assessment.id}
                        className={`flex items-center gap-3 py-2 px-4 rounded cursor-pointer transition-colors ${
                          isCurrentAssessment
                            ? "bg-[#242424] text-[#6b5de4]"
                            : "hover:bg-[#242424] text-gray-300"
                        }`}
                        onClick={() => handleAssessmentSelect(assessment)}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center 
                          ${
                            isCurrentAssessment
                              ? "bg-[#6b5de4]/20 text-[#6b5de4]"
                              : "bg-[#333] text-[#ccc]"
                          }`}
                        >
                          <span className="text-xs">
                            {(assessments.indexOf(assessment) + 1)
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        </div>
                        <span className="text-sm">{assessment.title}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">
                    No assessments available
                  </div>
                )}
              </div>
            )}

            {renderMenuItem(
              "Certificate",
              "certificate",
              certificateCompletion
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {activeSection === "quizzes" && currentVideo ? (
            <>
              <h2 className="text-3xl font-bold mb-8">{currentVideo.title}</h2>

              {/* Watch buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Button className="bg-[#6b5de4] hover:bg-[#5a4dd0] text-white flex items-center gap-2 py-6 px-5 rounded-md">
                  <Play className="w-5 h-5" />
                  <span>Watch this lesson</span>
                </Button>

                {/* Find next video button */}
                {(() => {
                  const currentIdx = videos.findIndex(
                    (v) => v.id === currentVideo.id
                  );

                  if (currentIdx < videos.length - 1) {
                    const nextVideo = videos[currentIdx + 1];
                    return (
                      <Button
                        className="bg-[#6b5de4] hover:bg-[#5a4dd0] text-white flex items-center gap-2 py-6 px-5 rounded-md"
                        onClick={() => handleVideoSelect(nextVideo)}
                      >
                        <Play className="w-5 h-5" />
                        <span>Watch the next lesson</span>
                      </Button>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Quiz Section */}
              {questions.length > 0 && (
                <div className="mt-8 rounded-lg border border-gray-800 bg-[#1a1a1a] overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#242424]"
                    // onClick={() => setQuizExpanded(!quizExpanded)}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Quiz: Test Your Knowledge
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {questions.length} question
                        {questions.length !== 1 ? "s" : ""} to complete
                      </p>
                    </div>
                    {/* <div>
                      {quizExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div> */}
                  </div>

                  {/* {quizExpanded && ( */}
                  <div className="p-4 border-t border-gray-800">
                    {quizResults.shown ? (
                      <div className="py-4">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold mb-2">
                            Your Score: {quizResults.score}/{quizResults.total}
                          </div>
                          <p className="text-gray-400">
                            {quizResults.score === quizResults.total
                              ? "Perfect! You've mastered this lesson."
                              : quizResults.score >= quizResults.total / 2
                              ? "Good job! You're getting there."
                              : "Keep learning and try again."}
                          </p>
                        </div>
                        <div className="flex justify-center gap-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedAnswers({});
                              setQuizResults({
                                shown: false,
                                score: 0,
                                total: 0,
                              });
                            }}
                            className="border-gray-700"
                          >
                            Try Again
                          </Button>

                          {quizResults.score >= quizResults.total / 2 && (
                            <Button
                              onClick={() => {
                                // Reset quiz state
                                // setQuizExpanded(true);
                                setQuizResults({
                                  shown: false,
                                  score: 0,
                                  total: 0,
                                });

                                // Find and go to next video
                                const currentIdx = videos.findIndex(
                                  (v) => v.id === currentVideo.id
                                );

                                if (currentIdx < videos.length - 1) {
                                  handleVideoSelect(videos[currentIdx + 1]);
                                }
                              }}
                              className="bg-[#6b5de4] hover:bg-[#5a4dd0]"
                            >
                              Next Lesson
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {questions.map((question, index) => (
                          <div key={question.id} className="mb-4">
                            <h4 className="font-medium mb-2 text-white">
                              {index + 1}. {question.question_text}
                            </h4>
                            <div className="space-y-2">
                              {questionOptions[question.id]?.map((option) => (
                                <div
                                  key={option.id}
                                  onClick={() =>
                                    handleAnswerSelect(question.id, option.id)
                                  }
                                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                                    selectedAnswers[question.id] === option.id
                                      ? "border-[#6b5de4] bg-[#6b5de4]/10"
                                      : "border-gray-700 hover:border-gray-600"
                                  }`}
                                >
                                  {option.option_text}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={handleQuizSubmit}
                          disabled={!isQuizComplete()}
                          className="w-full bg-[#6b5de4] hover:bg-[#5a4dd0] disabled:bg-gray-700 disabled:opacity-50"
                        >
                          Submit Answers
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* )} */}
                </div>
              )}
            </>
          ) : activeSection === "quizzes" ? (
            <div className="flex flex-col items-center justify-center h-96">
              <h2 className="text-xl text-gray-400">
                Select a lesson to begin
              </h2>
            </div>
          ) : activeSection === "assessment" ? (
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-8">
                {currentAssessment
                  ? currentAssessment.title
                  : "Final Assessment"}
              </h2>

              <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
                <Button
                  onClick={() => {
                    if (assessments.length > 0) {
                      const assessmentId = currentAssessment
                        ? currentAssessment.id
                        : assessments[0].id;
                      router.push(`/assignment/${assessmentId}`);
                    }
                  }}
                  disabled={assessments.length === 0}
                  className="bg-[#6b5de4] hover:bg-[#5a4dd0] disabled:bg-gray-700 disabled:opacity-50 w-full"
                >
                  {assessments.length > 0
                    ? "Go to Assessment"
                    : "No Assessments Available"}
                </Button>
              </div>
            </div>
          ) : activeSection === "certificate" ? (
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-8">Course Certificate</h2>
              <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
                <p className="text-gray-300 mb-4">
                  Complete the final assessment to earn your certificate.
                </p>
                <div className="aspect-[4/3] max-w-2xl mx-auto bg-[#242424] rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <h3 className="text-2xl font-bold mb-4">
                      Certificate of Completion
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Complete all requirements to unlock your certificate
                    </p>
                    <div className="w-16 h-16 mx-auto border-2 border-[#6b5de4] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Certificate;
