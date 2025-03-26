"use client";

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
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  video_count: number;
  playlist_id: string;
  created_at: string;
}

const UserPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("courses").select("*");

      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  if (loading)
    return (
      <p className="text-center text-lg py-12 text-foreground">
        Loading courses...
      </p>
    );
  if (!courses.length)
    return (
      <p className="text-center text-lg py-12 text-foreground">
        No courses found
      </p>
    );

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-28 bg-gradient-to-br from-primary to-secondary">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Elevate Your Skills
          </h1>
          <p className="text-xl md:text-2xl text-white mb-10">
            Explore our curated courses and start your journey toward mastery.
          </p>
          <Button asChild variant="default">
            <Link href="/explore">Discover Courses</Link>
          </Button>
        </div>
      </section>

      {/* Courses Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-4 md:mb-0">
            Courses for You
          </h2>
          <Button asChild variant="outline">
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="bg-card border-card rounded-lg overflow-hidden shadow transition-transform transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative w-full overflow-hidden h-40">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {course.title}
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-muted-foreground">
                  {course.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="text-sm text-foreground">
                  {course.video_count} videos
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button asChild className="w-full">
                  <Link href={`/course/${course.id}`}>View Course</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="px-6 py-8 bg-card rounded-lg shadow-sm">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Fast Learning
              </h3>
              <p className="text-muted-foreground">
                Bite-sized lessons that help you learn quickly and efficiently.
              </p>
            </div>
            <div className="px-6 py-8 bg-card rounded-lg shadow-sm">
              <div className="text-5xl mb-4">🛠️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Practical Tools
              </h3>
              <p className="text-muted-foreground">
                Interactive resources and real-world examples to boost your
                skills.
              </p>
            </div>
            <div className="px-6 py-8 bg-card rounded-lg shadow-sm">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Global Community
              </h3>
              <p className="text-muted-foreground">
                Connect with learners worldwide and share your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-10">
            Hear from Our Learners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="px-6 py-8 bg-card border border-card rounded-lg shadow-sm">
              <p className="text-muted-foreground italic">
                "This platform has completely changed my approach to learning.
                The courses are structured, engaging, and truly inspiring."
              </p>
              <p className="mt-4 font-semibold text-foreground">- Alex D.</p>
            </div>
            <div className="px-6 py-8 bg-card border border-card rounded-lg shadow-sm">
              <p className="text-muted-foreground italic">
                "The interactive tools and global community have made learning
                so much more enjoyable and effective!"
              </p>
              <p className="mt-4 font-semibold text-foreground">- Jamie L.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Informed</h2>
          <p className="text-lg text-white mb-8">
            Subscribe to our newsletter for exclusive tips, courses, and
            updates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary mb-4 sm:mb-0 sm:rounded-r-none"
            />
            <Button asChild className="w-full sm:w-auto sm:rounded-l-none">
              <Link href="/subscribe">Subscribe</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-card">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of learners and unlock your potential today.
          </p>
          <Button asChild variant="default">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default UserPage;
