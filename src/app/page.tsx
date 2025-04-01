"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ArrowRight, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout/layout";
import ParallexCard from "@/components/ParallexCard";

const VideoLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Autoplay video when component mounts
    if (videoRef.current) {
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            // Auto-play was prevented
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    }
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header/Navigation */}
        {/* <header className="border-b border-border">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="font-bold text-2xl text-primary">
                    LearnHub
                  </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/courses"
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Video Library
                  </Link>
                  <Link
                    href="/certifications"
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Certifications
                  </Link>
                  <Link
                    href="/academy"
                    className="flex items-center text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Studio Academy <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 bg-muted rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm w-48"
                  />
                </div>

                <div className="hidden md:block">
                  <ModeToggle />
                </div>

                <Button variant="outline" className="hidden md:inline-flex">
                  Log In
                </Button>

                <Button className="hidden md:inline-flex">Sign Up</Button>

                <button
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>
        </header> */}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-b border-border">
            <div className="container py-4 px-4 space-y-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/courses"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  Video Library
                </Link>
                <Link
                  href="/certifications"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  Certifications
                </Link>
                <Link
                  href="/academy"
                  className="flex items-center text-foreground/80 hover:text-foreground transition-colors"
                >
                  Studio Academy <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </nav>

              <div className="flex items-center relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 bg-muted rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm w-full"
                />
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" className="flex-1">
                  Log In
                </Button>

                <Button className="flex-1">Sign Up</Button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section with Video */}
        {/* Hero Section with Video - Nearly Full Width */}
        <section className="relative py-6 px-4 md:px-5">
          {/* Outer container with very wide max width */}
          <div className="container mx-auto max-w-[95%]">
            {/* Video wrapper with shadow and rounded corners */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100/10">
              {/* Overlay with headline text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 px-4">
                <div className="text-center max-w-5xl">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                    You know what you want to accomplish.{" "}
                    <span className="text-yellow-400">Now learn how.</span>
                  </h1>

                  <div className="mt-8">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 rounded-full px-8"
                    >
                      <span>Start Learning</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Video Background */}
              <div className="relative w-full h-[calc(100vh-100px)] min-h-[600px] overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute w-full h-full object-cover"
                  muted
                  autoPlay
                  loop
                  onClick={handlePlayPause}
                >
                  <source src="/intro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Section (Optional) */}
        {/* Wix-Style Courses Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto max-w-7xl px-4">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-xl">
                Cover the basics with courses that are anything but basic
              </h2>
              <button className="mt-4 md:mt-0 text-primary font-medium hover:underline">
                Show Me More
              </button>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Course Card 1 - Website Building */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-md transition-shadow hover:shadow-lg flex flex-col h-full">
                <div className="bg-purple-600 p-8 pb-0">
                  <img
                    src="/course-website-builder.png"
                    alt="Website builder interface"
                    className="rounded-t-xl w-full object-cover"
                    style={{ height: "300px" }}
                  />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold mb-2">
                    Build your website with the Wix Editor
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    Learn how to create, build and customize your professional
                    website exactly the way you want.
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-auto">
                    <div className="text-sm text-gray-500">9 lessons | 69m</div>
                    <button className="text-primary font-medium flex items-center hover:underline">
                      Start Now <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - 2 Equal Cards */}
              <div className="flex flex-col justify-between gap-8 h-full">
                {/* Booking System Card */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-md transition-shadow hover:shadow-lg flex-1">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/2 bg-emerald-200 p-6 flex items-center justify-center">
                      <img
                        src="/course-booking-system.png"
                        alt="Booking system interface"
                        className="w-full h-auto object-contain max-h-44"
                      />
                    </div>
                    <div className="md:w-1/2 p-6 flex flex-col">
                      <h3 className="text-xl font-bold mb-2">
                        Set up & manage your online bookings
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 flex-grow">
                        Start accepting and managing online bookings for
                        appointments, classes and courses, right from your
                        website.
                      </p>
                      <div className="border-t border-gray-200 pt-3 mt-auto">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            7 lessons | 42m
                          </div>
                          <button className="text-primary font-medium flex items-center hover:underline">
                            Start Now <ArrowRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing Card */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-md transition-shadow hover:shadow-lg flex-1">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/2 bg-orange-400 p-6 flex items-center justify-center">
                      <img
                        src="/course-sales-marketing.png"
                        alt="Sales and marketing graph"
                        className="w-full h-auto object-contain max-h-44"
                      />
                    </div>
                    <div className="md:w-1/2 p-6 flex flex-col">
                      <h3 className="text-xl font-bold mb-2">
                        Drive traffic to your online store
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 flex-grow">
                        Learn how to generate traffic, promote your brand and
                        grow sales.
                      </p>
                      <div className="border-t border-gray-200 pt-3 mt-auto">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            9 lessons | 37m
                          </div>
                          <button className="text-primary font-medium flex items-center hover:underline">
                            Start Now <ArrowRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <ParallexCard/> */}
        {/* Know Your Stuff Section with Fixed CSS */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto max-w-7xl px-4">
            {/* Section Header with Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  Know your stuff,
                  <br />
                  no matter your stage
                </h2>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-lg text-gray-600 mb-6">
                  Find the right classes for you based on where you are in your
                  journey, and where you're going next.
                </p>
                <div>
                  <button className="text-primary font-medium text-lg hover:underline">
                    Start Learning
                  </button>
                </div>
              </div>
            </div>

            {/* Blue Card */}
            <div className="bg-blue-500 rounded-3xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
                {/* Left Side with Logo and Label */}
                <div className="flex flex-col items-center justify-center p-8 relative">
                  {/* Vertical "CREATION" text */}
                  <div
                    className="absolute left-10 text-white font-bold text-xl tracking-widest"
                    style={{
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                    }}
                  >
                    CREATION
                  </div>

                  {/* Plus/Creation Symbol */}
                  <div className="w-32 h-32 md:w-40 md:h-40">
                    <svg
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M40 0H60V40H100V60H60V100H40V60H0V40H40V0Z"
                        fill="black"
                      />
                      <rect
                        x="40"
                        y="40"
                        width="20"
                        height="20"
                        fill="#3B82F6"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right Side with Content */}
                <div className="flex flex-col justify-center p-8 md:pr-12">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    CREATE
                    <br />
                    YOUR WEBSITE
                  </h3>
                  <p className="text-white/90 text-lg mb-8">
                    Learn how to build and launch a wow-worthy website with
                    courses and lessons on design, coding, CMS and more.
                  </p>
                  <div>
                    <button className="bg-transparent hover:bg-white/10 text-white border border-white rounded-full px-6 py-2 transition-colors">
                      Explore Courses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default VideoLandingPage;
