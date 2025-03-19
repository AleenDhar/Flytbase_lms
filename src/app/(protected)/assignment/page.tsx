import React from "react";
import { assignments } from "@/data/assignments";
import { Sparkles } from "lucide-react";
import AssignmentCard from "@/components/AssignmentCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Testing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Assignments & Tests
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Select an assignment to begin. Each assignment has a time limit, and
            your progress will be tracked.
          </p>

          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </section>

        {/* Assignments Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="animate-fade-in">
                <AssignmentCard assignment={assignment} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
