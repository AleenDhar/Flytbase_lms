"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]">
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
      <div className="container max-w-6xl mx-auto px-4 py-12">
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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="mb-2 -ml-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link href="/course">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {videos[0]?.title?.split(" - ")[0] || "Course"}
          </h1>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {videos.length} videos
            </span>
            <span className="text-muted-foreground mx-1">•</span>
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              ~{videos.length * 5} min
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {/* <Progress value={getProgressPercentage()} className="h-2" /> */}
          {/* <span className="text-sm font-medium">
            {Math.round(getProgressPercentage())}%
          </span> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Card */}
          <Card className="overflow-hidden border-2 shadow-sm">
            <div className="w-full relative">
              <Badge className="absolute top-4 right-4 z-10">
                Video {currentVideoIndex + 1} of {videos.length}
              </Badge>
              <div className="aspect-video w-full bg-black overflow-hidden">
                <YouTubeEmbed
                  videoId={currentVideo.youtube_video_id}
                  onVideoEnd={handleVideoEnd}
                />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{currentVideo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <div className="flex justify-between items-start">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground">
                      {getTruncatedDescription(currentVideo.about)}
                    </p>
                  </div>
                </div>
                {currentVideo.about && currentVideo.about.length > 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-primary"
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
            </CardContent>
          </Card>

          {/* Quiz Card */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setQuizExpanded(!quizExpanded)}
              >
                <CardTitle className="flex items-center gap-2">
                  <span>Video Quiz</span>
                  <Badge variant="outline">{questions.length} questions</Badge>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {quizExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                Test your understanding of the video content
              </CardDescription>
            </CardHeader>

            {quizExpanded && (
              <>
                {quizResults.shown ? (
                  <CardContent>
                    <div className="flex flex-col items-center text-center py-4">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                          quizResults.score === quizResults.total
                            ? "bg-green-100 text-green-600"
                            : quizResults.score >= quizResults.total / 2
                            ? "bg-amber-100 text-amber-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <span className="text-3xl font-bold">
                          {quizResults.score}/{quizResults.total}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Quiz Results</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {quizResults.score === quizResults.total
                          ? "Perfect score! You've mastered this section."
                          : quizResults.score >= quizResults.total / 2
                          ? "Good job! You're making progress."
                          : "Keep learning. Review the video and try again."}
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button variant="outline" onClick={handleResetQuiz}>
                          Try Again
                        </Button>
                        <Button onClick={handleQuizComplete}>
                          {currentVideoIndex < videos.length - 1
                            ? "Next Video"
                            : "Complete Course"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <CardContent className="space-y-6">
                      {questions.length > 0 ? (
                        questions.map((question, qIndex) => (
                          <div key={question.id} className="space-y-3">
                            <h3 className="font-medium flex gap-2">
                              <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                                {qIndex + 1}
                              </span>
                              <span>{question.question_text}</span>
                            </h3>
                            <div className="ml-8 space-y-2">
                              {options[question.id] &&
                                options[question.id].map((option) => (
                                  <div
                                    key={option.id}
                                    onClick={() =>
                                      handleAnswerSelect(question.id, option.id)
                                    }
                                    className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                                      selectedAnswers[question.id] === option.id
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-primary/50"
                                    }`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                        selectedAnswers[question.id] ===
                                        option.id
                                          ? "border-primary"
                                          : "border-muted-foreground/30"
                                      }`}
                                    >
                                      {selectedAnswers[question.id] ===
                                        option.id && (
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                      )}
                                    </div>
                                    <label className="flex-1 cursor-pointer">
                                      {option.option_text}
                                    </label>
                                  </div>
                                ))}
                            </div>
                            {qIndex < questions.length - 1 && (
                              <Separator className="mt-6" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No questions available for this video.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-3 pt-2">
                      <Button
                        onClick={handleQuizSubmit}
                        disabled={!isQuizComplete()}
                        className="w-full sm:w-auto"
                      >
                        Submit Answers
                      </Button>
                    </CardFooter>
                  </>
                )}
              </>
            )}
          </Card>
        </div>

        <div>
          <Card className="sticky top-6 border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>{videos.length} videos</span>
                <span className="text-sm font-medium">
                  {completedVideos.size} completed
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoSelect(index)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${
                      currentVideoIndex === index
                        ? "bg-primary/10 border-primary/30"
                        : completedVideos.has(video.id)
                        ? "bg-green-50/50 border-green-200/50"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={
                            video.thumbnail ||
                            `https://i.ytimg.com/vi/${video.youtube_video_id}/mqdefault.jpg`
                          }
                          alt={video.title}
                          className="w-20 h-12 rounded-md object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                          {completedVideos.has(video.id) ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <PlayCircle className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p
                          className={`font-medium text-sm ${
                            currentVideoIndex === index
                              ? "text-primary"
                              : completedVideos.has(video.id)
                              ? "text-green-700"
                              : ""
                          }`}
                        >
                          {video.title}
                        </p>
                        {completedVideos.has(video.id) && (
                          <span className="flex items-center text-xs text-green-600 mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
