"use client";
import React, { useState } from "react";
// import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import CourseCategories from "@/components/CourseCategories";
import TestimonialSection from "@/components/TestimonialSection";
import CTASection from "@/components/CTASection";
import PageFooter from "@/components/PageFooter";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/mode-toggle";
import UserGreetText from "@/components/UserGreetText";
import { Menu, X } from "lucide-react";
import Layout from "@/components/Layout/layout";
// import ContinueLearningSection from "@/components/ContinueLearningSection";
// import { useAuth } from '@/context/AuthContext';

const Index = () => {
  // const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-neutral-100 relative">
      <Layout>
        <main className="relative">
          {/* Hero Section */}
          <HeroSection />

          {/* Continue Learning Section (for signed-in users) */}
          {/* <ContinueLearningSection /> */}

          {/* Course Categories */}
          <CourseCategories />

          {/* Testimonial Section */}
          <TestimonialSection />

          {/* CTA Section */}
          <CTASection />
        </main>

        {/* Footer */}
        <PageFooter />
      </Layout>
    </div>
  );
};

export default Index;
