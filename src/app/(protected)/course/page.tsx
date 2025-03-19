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

import Link from "next/link";
interface User {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  progress: number;
}

const dummyCourses = [
  {
    id: 1,
    title: "Introduction to React",
    description: "Learn the basics of React and build your first application",
    thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=React+Course",
    videoCount: 10,
    progress: 40,
  },
  {
    id: 2,
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into JavaScript's advanced features and patterns",
    thumbnail: "https://placehold.co/600x400/f59e0b/ffffff?text=JavaScript",
    videoCount: 8,
    progress: 25,
  },
  {
    id: 3,
    title: "CSS Mastery",
    description: "Master CSS techniques for modern web development",
    thumbnail: "https://placehold.co/600x400/10b981/ffffff?text=CSS+Mastery",
    videoCount: 12,
    progress: 0,
  },
];

const UserPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if (course) {
    //   fetch(`https://jsonplaceholder.typicode.com/users/${course}`)
    //     .then((res) => res.json())
    //     .then((data) => {
    //       setUser(data);
    //       setLoading(false);
    //     });
    // }
  }, []);

  // if (loading) return <p>Loading...</p>;
  //   if (!user) return <p>User not found</p>;

  return (
    <div>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <Button asChild variant="outline">
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover-card">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span>{course.videoCount} videos</span>
                  {course.progress > 0 ? (
                    <span className="text-primary">
                      {course.progress}% complete
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not started</span>
                  )}
                </div>
                {course.progress > 0 && (
                  <div className="mt-2 progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/course/${course.id}`}>
                    {course.progress > 0 ? "Continue Learning" : "Start Course"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;

// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import Layout from "@/components/layout/Layout";

// const dummyCourses = [
//   {
//     id: "1",
//     title: "Introduction to React",
//     description: "Learn the basics of React and build your first application",
//     thumbnail: "https://placehold.co/600x400/3b82f6/ffffff?text=React+Course",
//     videoCount: 10,
//     progress: 40
//   },
//   {
//     id: "2",
//     title: "Advanced JavaScript Concepts",
//     description: "Deep dive into JavaScript's advanced features and patterns",
//     thumbnail: "https://placehold.co/600x400/f59e0b/ffffff?text=JavaScript",
//     videoCount: 8,
//     progress: 25
//   },
//   {
//     id: "3",
//     title: "CSS Mastery",
//     description: "Master CSS techniques for modern web development",
//     thumbnail: "https://placehold.co/600x400/10b981/ffffff?text=CSS+Mastery",
//     videoCount: 12,
//     progress: 0
//   }
// ];

// const Courses = () => {
//   const [courses] = useState(dummyCourses);

//   return (

//   );
// };

// export default Courses;
