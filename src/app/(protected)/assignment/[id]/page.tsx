"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { assignments } from "@/data/assignments";
import { TestProvider, useTest } from "@/contexts/TestContext";
import { Clock, BarChart, ChevronLeft, Play } from "lucide-react";
import { toast } from "sonner";
import { NextPage } from "next";
import Link from "next/link";
import { log } from "node:console";

type Assignment = {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  questions: { id: string; question: string }[];
  thumbnail?: string;
};

const AssignmentDetail: NextPage = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { startTest } = useTest();
  const [assignment, setAssignment] = useState<Assignment | undefined>(
    assignments.find((a) => a.id === id) as Assignment | undefined
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!assignment && id) {
      toast.error("Assignment not found", {
        description: "The assignment you're looking for doesn't exist.",
      });
    }
  }, [assignment, id]);

  if (!assignment) {
    return null;
  }

  const handleStartTest = () => {
    setIsLoading(true);
    setTimeout(() => {
      startTest(assignment.id, assignment.timeLimit);
      router.push(`/test/${assignment.id}`);
    }, 800);
  };

  const getDifficultyColor = () => {
    switch (assignment.difficulty) {
      case "easy":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      case "hard":
        return "bg-rose-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <TestProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/assignment" className="cursor-pointer">
            <Button
              variant="ghost"
              className="cursor-pointer mb-8 group subtle-transitions"
            >
              <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Assignments
            </Button>
          </Link>

          <Card className="overflow-hidden border border-border/50 shadow-sm">
            <div
              className="h-64 w-full bg-cover bg-center border-b border-border/10"
              style={{
                backgroundImage: `url(${
                  assignment.thumbnail ||
                  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop"
                })`,
              }}
            />

            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {assignment.category}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full text-white ${getDifficultyColor()}`}
                    >
                      {assignment.difficulty}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {assignment.description}
                  </CardDescription>
                </div>

                <Button
                  onClick={handleStartTest}
                  className="cursor-pointer w-full md:w-auto shadow-sm min-w-36 py-6 subtle-transitions"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Preparing Test...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </div>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-foreground">Time Limit</p>
                      <p className="text-sm">{assignment.timeLimit} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-foreground">Questions</p>
                      <p className="text-sm">
                        {assignment.questions.length} questions to complete
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
                  <h3 className="font-medium mb-2">Test Instructions</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>
                      • You will have {assignment.timeLimit} minutes to complete
                      this test.
                    </li>
                    <li>
                      • The test will automatically submit when the time is up.
                    </li>
                    <li>• Do not refresh or leave the page during the test.</li>
                    <li>
                      • Make sure to save your answers before moving to the next
                      question.
                    </li>
                    <li>• You can review your answers before submitting.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TestProvider>
  );
};

export default AssignmentDetail;
