"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import YouTubeEmbed from "@/components/ui-custom/YouTubeEmbed";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Menu,
  ArrowRight,
  AlignLeft,
  List,
  LayoutList,
  Link as LinkIcon,
  X,
  Play,
} from "lucide-react";

interface Video {
  id: number;
  title: string;
  youtube_video_id: string;
  about: string | null;
  thumbnail: string;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
}

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
}

const CourseDetail = () => {
  const { course } = useParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<{ [key: number]: Option[] }>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number | null;
  }>({});
  const [completedVideos, setCompletedVideos] = useState<Set<number>>(
    new Set()
  );
  const [quizResults, setQuizResults] = useState<{
    shown: boolean;
    score: number;
    total: number;
  }>({ shown: false, score: 0, total: 0 });
  const [tableOfContentsVisible, setTableOfContentsVisible] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVideos = async () => {
      if (!course) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, youtube_video_id, about, thumbnail")
        .eq("course_id", course);

      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        setVideos(data);
        setCurrentVideoIndex(0);
        setCurrentVideo(data[0] || null);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [course]);

  // Update current video when video index changes
  useEffect(() => {
    if (videos.length > 0) {
      setCurrentVideo(videos[currentVideoIndex]);
      // Reset quiz related states when switching videos
      setSelectedAnswers({});
      setQuestions([]);
      setOptions({});
      setQuizResults({ shown: false, score: 0, total: 0 });
      // Reset description expanded state
      setDescriptionExpanded(false);

      // Fetch questions for the video immediately
      if (videos[currentVideoIndex]) {
        fetchQuestionsForVideo(videos[currentVideoIndex].id);
      }
    }
  }, [currentVideoIndex, videos]);

  // Close TOC when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tocRef.current &&
        !tocRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("[data-menu-toggle]")
      ) {
        setTableOfContentsVisible(false);
      }
    };

    // Close TOC when pressing Escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTableOfContentsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const fetchQuestionsForVideo = async (videoRowId: number) => {
    const supabase = createClient();

    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .select("id, question_text, question_type")
      .eq("video_id", videoRowId)
      .eq("after_videoend", true);

    if (questionError) {
      console.error("Error fetching questions:", questionError);
      return;
    }

    setQuestions(questionData);

    const optionsMap: { [key: number]: Option[] } = {};

    for (const question of questionData) {
      const { data: optionsData, error: optionsError } = await supabase
        .from("question_options")
        .select("id, option_text, is_correct")
        .eq("question_id", question.id);

      if (optionsError) {
        console.error(
          `Error fetching options for question ${question.id}:`,
          optionsError
        );
        continue;
      }

      optionsMap[question.id] = optionsData;
    }

    setOptions(optionsMap);
  };

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const isQuizComplete = () => {
    return (
      questions.length > 0 &&
      questions.every((q) => selectedAnswers[q.id] != null)
    );
  };

  const handleQuizSubmit = () => {
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((question) => {
      const selectedOptionId = selectedAnswers[question.id];
      if (!selectedOptionId) return;
      const correctOption = options[question.id]?.find((o) => o.is_correct);
      if (correctOption && correctOption.id === selectedOptionId) {
        correctCount++;
      }
    });

    setQuizResults({
      shown: true,
      score: correctCount,
      total: totalQuestions,
    });

    // Mark this video as completed
    if (currentVideo) {
      setCompletedVideos((prev) => new Set([...prev, currentVideo.id]));
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setTableOfContentsVisible(false);
  };

  const handleVideoEnd = () => {
    // Auto-expand the quiz when the video ends
    setQuizExpanded(true);
  };

  const handleQuizComplete = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
    // Reset the quiz results
    setQuizResults({ shown: false, score: 0, total: 0 });
    // Collapse the quiz section
    setQuizExpanded(false);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizResults({ shown: false, score: 0, total: 0 });
  };

  const getProgressPercentage = () => {
    if (videos.length === 0) return 0;
    return (completedVideos.size / videos.length) * 100;
  };

  const toggleTableOfContents = () => {
    setTableOfContentsVisible(!tableOfContentsVisible);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] ">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">
            Loading course content...
          </p>
        </div>
      </div>
    );
  }

  if (!videos.length || !currentVideo) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 ">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            No videos found for this course
          </h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for might not have any content yet.
          </p>
          <Button asChild>
            <Link href="/course">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Function to truncate description for preview
  const getTruncatedDescription = (text: string | null, maxLength = 100) => {
    if (!text) return "No description available";
    return text.length > maxLength && !descriptionExpanded
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Extract the chapter name from the first video title
  const getChapterName = () => {
    const firstVideoTitle = videos[0]?.title || "";
    const parts = firstVideoTitle.split(" - ");
    if (parts.length > 1) {
      return parts[0];
    }
    return "Chapter";
  };

  // Animation variants for the table of contents
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Animation variants for menu items
  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white mb-14">
      {/* Table of Contents Sidebar with animated toggle button */}
      <div className="fixed top-10   left-2 bottom-10 z-50 flex">
        {/* Table of Contents with Toggle Button */}
        <motion.div
          initial={{ x: -392 }}
          animate={{ x: tableOfContentsVisible ? 0 : -392 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="relative "
        >
          {/* Table of Contents Panel */}
          <div
            ref={tocRef}
            className="bg-[#121212] border-r border-gray-800 shadow-lg w-96 h-full overflow-hidden flex flex-col rounded-2xl  bg-red-600"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div>
                <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wide">
                  Chapter {String(course).padStart(2, "0")}
                </h2>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {getChapterName()}
                </h3>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="overflow-y-auto flex-1">
              {videos.map((video, index) => {
                const isCurrent = currentVideoIndex === index;
                const isCompleted = completedVideos.has(video.id);

                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoSelect(index)}
                    className={`
                relative cursor-pointer transition-colors
                ${isCurrent ? "bg-purple-900/30" : "hover:bg-gray-800/50"}
              `}
                  >
                    {/* Purple highlight bar for current video */}
                    {isCurrent && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-sm" />
                    )}

                    <div className="flex items-center justify-between p-3">
                      {/* Left: Icon + Title */}
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${
                        isCompleted
                          ? "bg-green-500/20 text-green-400"
                          : isCurrent
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-gray-800 text-gray-400"
                      }
                    `}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isCurrent ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-medium">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          )}
                        </div>

                        <p
                          className={`font-medium text-sm
                      ${
                        isCurrent
                          ? "text-purple-400"
                          : isCompleted
                          ? "text-green-400"
                          : "text-gray-300"
                      }
                    `}
                        >
                          {String(index + 1).padStart(2, "0")}.{" "}
                          {video.title.split(" - ").pop() || video.title}
                        </p>
                      </div>

                      {/* Right: Time + Badges */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {Math.floor(Math.random() * 20) + 20}:00
                        </span>
                        {isCurrent && (
                          <Badge className="bg-purple-600 text-white text-xs py-0 px-2">
                            Current
                          </Badge>
                        )}
                        {video.id % 3 === 0 && (
                          <Badge className="bg-blue-600 text-white text-xs py-0 px-2">
                            Free
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggle Button that moves with the Table of Contents */}
          <motion.button
            data-menu-toggle
            onClick={toggleTableOfContents}
            className="absolute top-8 right-[-26] transform translate-x-1/2
                bg-[#121212] rounded-r-xl border border-l-0 border-gray-800
                hover:bg-gray-800 transition-colors h-14 w-14
                flex items-center justify-center focus:outline-none"
          >
            {tableOfContentsVisible ? (
              <X className="h-5 w-5 text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-300" />
            )}
          </motion.button>
        </motion.div>
      </div>
      {/* Main Content */}
      <div className="w-full">
        {/* Header */}

        {/* Main Content Area */}
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Video Section */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full relative rounded-lg overflow-hidden">
              <div className="aspect-video w-full bg-black overflow-hidden">
                <YouTubeEmbed
                  videoId={currentVideo.youtube_video_id}
                  onVideoEnd={handleVideoEnd}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-between items-center">
              <div className="mb-2 md:mb-0 w-full md:w-auto">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {currentVideo.title}
                </h2>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                  onClick={() =>
                    currentVideoIndex > 0 &&
                    handleVideoSelect(currentVideoIndex - 1)
                  }
                  disabled={currentVideoIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() =>
                    currentVideoIndex < videos.length - 1 &&
                    handleVideoSelect(currentVideoIndex + 1)
                  }
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  <span>Next lesson</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {currentVideo.about && (
              <div className="mt-4 bg-gray-900/50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300">
                      {getTruncatedDescription(currentVideo.about)}
                    </p>
                  </div>
                </div>
                {currentVideo.about && currentVideo.about.length > 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-purple-400 hover:text-purple-300 hover:bg-gray-800/50"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  >
                    {descriptionExpanded ? (
                      <>
                        Show Less <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Quiz Section */}
          {questions.length > 0 && (
            <motion.div
              className="mt-8 rounded-lg border border-gray-800 bg-gray-900/30 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/30"
                onClick={() => setQuizExpanded(!quizExpanded)}
              >
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span>Video Quiz</span>
                    <Badge className="ml-2 bg-purple-600 text-white border-none">
                      {questions.length} questions
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Test your understanding of the video content
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: quizExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>

              <AnimatePresence>
                {quizExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {quizResults.shown ? (
                      <div className="p-6 border-t border-gray-800">
                        <div className="flex flex-col items-center text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                              quizResults.score === quizResults.total
                                ? "bg-green-900/30 text-green-400"
                                : quizResults.score >= quizResults.total / 2
                                ? "bg-amber-900/30 text-amber-400"
                                : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            <span className="text-3xl font-bold">
                              {quizResults.score}/{quizResults.total}
                            </span>
                          </motion.div>
                          <h3 className="text-xl font-bold mb-2 text-white">
                            Quiz Results
                          </h3>
                          <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            {quizResults.score === quizResults.total
                              ? "Perfect score! You've mastered this section."
                              : quizResults.score >= quizResults.total / 2
                              ? "Good job! You're making progress."
                              : "Keep learning. Review the video and try again."}
                          </p>
                          <div className="flex flex-wrap justify-center gap-3">
                            <Button
                              variant="outline"
                              onClick={handleResetQuiz}
                              className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                            >
                              Try Again
                            </Button>
                            <Button
                              onClick={handleQuizComplete}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {currentVideoIndex < videos.length - 1
                                ? "Next Video"
                                : "Complete Course"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 sm:p-6 border-t border-gray-800 space-y-6">
                          {questions.map((question, qIndex) => (
                            <motion.div
                              key={question.id}
                              className="space-y-3"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * qIndex }}
                            >
                              <h3 className="font-medium flex gap-2 text-white">
                                <span className="bg-purple-900/50 text-purple-400 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                                  {qIndex + 1}
                                </span>
                                <span>{question.question_text}</span>
                              </h3>
                              <div className="ml-8 space-y-2">
                                {options[question.id] &&
                                  options[question.id].map((option, oIndex) => (
                                    <motion.div
                                      key={option.id}
                                      onClick={() =>
                                        handleAnswerSelect(
                                          question.id,
                                          option.id
                                        )
                                      }
                                      className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                                        selectedAnswers[question.id] ===
                                        option.id
                                          ? "border-purple-500 bg-purple-900/20"
                                          : "border-gray-700 hover:border-purple-500/50 bg-gray-800/30"
                                      }`}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        delay: 0.1 * qIndex + 0.05 * oIndex,
                                      }}
                                      whileHover={{ x: 5 }}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                          selectedAnswers[question.id] ===
                                          option.id
                                            ? "border-purple-500"
                                            : "border-gray-600"
                                        }`}
                                      >
                                        {selectedAnswers[question.id] ===
                                          option.id && (
                                          <motion.div
                                            className="w-3 h-3 rounded-full bg-purple-500"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                              type: "spring",
                                              damping: 10,
                                            }}
                                          />
                                        )}
                                      </div>
                                      <label className="flex-1 cursor-pointer text-gray-300">
                                        {option.option_text}
                                      </label>
                                    </motion.div>
                                  ))}
                              </div>
                              {qIndex < questions.length - 1 && (
                                <Separator className="bg-gray-800" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-gray-800 flex justify-end">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Button
                              onClick={handleQuizSubmit}
                              disabled={!isQuizComplete()}
                              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500"
                            >
                              Submit Answers
                            </Button>
                          </motion.div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom footer with links */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#161616] border-t border-gray-800 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="link"
            size="sm"
            className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm p-0"
          >
            Lesson's links
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm p-0"
            onClick={toggleTableOfContents}
          >
            Table of content
          </Button>
        </div>
        <div>
          <span className="text-xs sm:text-sm text-gray-400">
            {currentVideoIndex + 1}/{videos.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-800 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${getProgressPercentage()}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default CourseDetail;
