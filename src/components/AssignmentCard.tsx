"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Clock, BarChart } from "lucide-react";
import { Assignment } from "@/types";
import Link from "next/link";

interface AssignmentCardProps {
  assignment: Assignment;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const { id, title, description, timeLimit, difficulty, thumbnail, category } =
    assignment;

  const getBgImage = () => {
    return (
      thumbnail ||
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80"
    );
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
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
    <Link href={`/assignment/${id}`}>
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg border border-border/50 h-full">
        <div
          className="h-48 w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${getBgImage()})` }}
        />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              {category}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full text-white ${getDifficultyColor()}`}
            >
              {difficulty}
            </span>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{timeLimit} minutes</span>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <BarChart className="mr-1 h-4 w-4" />
              <span>{assignment.questions.length} questions</span>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              Start Test
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AssignmentCard;
