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
import Layout from "@/components/Layout/layout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import YouTubeEmbed from "@/components/ui-custom/YouTubeEmbed";
import { Separator } from "@/components/ui/separator";

interface mockCourseData {
  [key: string]: {
    id: string;
    title: string;
    description: string;
    videos: {
      id: string;
      title: string;
      videoId: string;
      duration: string;
      completed: boolean;
    }[];
  };
}

const mockCourseData: mockCourseData = {
  "1": {
    id: "1",
    title: "Introduction to React",
    description: "Learn the basics of React and build your first application",
    videos: [
      {
        id: "v1",
        title: "Getting Started with React",
        videoId: "w7ejDZ8SWv8",
        duration: "30:12",
        completed: false,
      },
      {
        id: "v2",
        title: "Components and Props",
        videoId: "FIetoJ-Bg4Y",
        duration: "25:45",
        completed: false,
      },
      {
        id: "v3",
        title: "State and Lifecycle",
        videoId: "4pO-HcG2igk",
        duration: "28:30",
        completed: false,
      },
    ],
  },
  "2": {
    id: "2",
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into JavaScript's advanced features and patterns",
    videos: [
      {
        id: "v1",
        title: "Closures Explained",
        videoId: "vKJpN5FAeF4",
        duration: "22:15",
        completed: true,
      },
      {
        id: "v2",
        title: "Promises and Async/Await",
        videoId: "li7FzDHYZpc",
        duration: "35:20",
        completed: false,
      },
    ],
  },
};

const CourseDetail = () => {
  const { course } = useParams(); // Get the dynamic route parameter

  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (course && mockCourseData[course as keyof typeof mockCourseData]) {
      setCurrentCourse(mockCourseData[course as keyof typeof mockCourseData]);
      // Find the first incomplete video
      const index = mockCourseData[
        course as keyof typeof mockCourseData
      ].videos.findIndex((v) => !v.completed);
      setCurrentVideoIndex(index >= 0 ? index : 0);
    } else {
      // If course not found, redirect to courses page
      // router.push("/course");
    }
    // setCurrentCourse(mockCourseData[course as keyof typeof mockCourseData]);
    setLoading(false);
  }, [course]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 flex justify-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <h1>Course not found</h1>
        <Link href="/course">Back to Courses</Link>
      </div>
    );
  }

  const currentVideo = currentCourse.videos[currentVideoIndex];
  const handleVideoEnd = () => {
    setQuizMode(true);
  };

  const handleQuizComplete = () => {
    if (currentCourse && currentVideoIndex < currentCourse.videos.length - 1) {
      // Mark current video as completed and move to next video
      const updatedCourse = { ...currentCourse };
      updatedCourse.videos[currentVideoIndex].completed = true;
      setCurrentCourse(updatedCourse);
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      // Last video completed
      const updatedCourse = { ...currentCourse };
      updatedCourse.videos[currentVideoIndex].completed = true;
      setCurrentCourse(updatedCourse);
      // Would show certificate in a real app
    }
    setQuizMode(false);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <Link href="/course">← Back to Courses</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{currentCourse.title}</h1>
          <p className="text-muted-foreground mb-6">
            {currentCourse.description}
          </p>

          {!quizMode ? (
            <>
              <div className="aspect-video w-full h-96 bg-black overflow-hidden rounded-lg mb-6">
                <YouTubeEmbed
                  videoId={currentVideo.videoId}
                  onVideoEnd={handleVideoEnd}
                />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                {currentVideo.title}
              </h2>
              <p className="text-muted-foreground">
                Duration: {currentVideo.duration}
              </p>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Video Quiz</CardTitle>
                <CardDescription>
                  Complete this quiz to continue to the next video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">
                    What was covered in this video?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    In a real app, these questions would be generated based on
                    the video content
                  </p>
                </div>
                <Separator />
                <div className="pt-4">
                  <Button onClick={handleQuizComplete} size="lg">
                    Complete Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {currentCourse.videos.length} videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentCourse.videos.map((video: any, index: number) => (
                  <div
                    key={video.id}
                    className={`p-3 rounded-md ${
                      currentVideoIndex === index
                        ? "bg-primary/10 border border-primary/20"
                        : video.completed
                        ? "bg-muted/50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full h-6 w-6 flex items-center justify-center text-xs ${
                          video.completed
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {video.completed ? "✓" : index + 1}
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            currentVideoIndex === index ? "text-primary" : ""
                          }`}
                        >
                          {video.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {video.duration}
                        </p>
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
