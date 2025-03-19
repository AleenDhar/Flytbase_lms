"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  BarChart,
  Menu,
  X,
} from "lucide-react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import UserGreetText from "@/components/UserGreetText";
import LoginButton from "@/components/LoginLogoutButton";
import React, { ReactNode } from "react"; // Import ReactNode to fix JSX error
interface LayoutProps {
  children: React.ReactNode;
}
// Define types
type Feature = {
  id: number;
  title: string;
  description: string;
  icon: ReactNode; // Fix for JSX.Element error
};

type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
};

type PricingPlan = {
  id: number;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
};
const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(1);

  // For animation purposes
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev % features.length) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sample data
  const features: Feature[] = [
    {
      id: 1,
      title: "Interactive Courses",
      description:
        "Engage your students with interactive content, quizzes, and multimedia lessons that make learning enjoyable and effective.",
      icon: <BookOpen className="w-10 h-10 text-primary" />,
    },
    {
      id: 2,
      title: "Community Learning",
      description:
        "Foster collaboration through discussion forums, group projects, and peer reviews to enhance the learning experience.",
      icon: <Users className="w-10 h-10 text-primary" />,
    },
    {
      id: 3,
      title: "Certifications",
      description:
        "Offer certificates and badges upon course completion to recognize achievements and motivate your learners.",
      icon: <Award className="w-10 h-10 text-primary" />,
    },
    {
      id: 4,
      title: "Advanced Analytics",
      description:
        "Track student progress and engagement with detailed analytics to optimize your teaching approach.",
      icon: <BarChart className="w-10 h-10 text-primary" />,
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Training Director",
      company: "TechCorp",
      quote:
        "Implementing this LMS transformed our corporate training program. Our employee engagement increased by 78% and training completion rates soared.",
      avatar: "/api/placeholder/100/100",
    },
    {
      id: 2,
      name: "David Chen",
      role: "Professor",
      company: "Global University",
      quote:
        "The flexibility and rich features of this platform allowed us to easily transition to online learning while maintaining educational quality.",
      avatar: "/api/placeholder/100/100",
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "CEO",
      company: "EduStart",
      quote:
        "As a small educational startup, we needed a scalable solution. This LMS provided everything we needed at a price point that made sense for our growth.",
      avatar: "/api/placeholder/100/100",
    },
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: 1,
      name: "Starter",
      price: "$49",
      description: "Perfect for small teams and individual educators",
      features: [
        "Up to 100 students",
        "10 courses",
        "Basic analytics",
        "Email support",
      ],
      popular: false,
    },
    {
      id: 2,
      name: "Professional",
      price: "$99",
      description: "Ideal for growing educational institutions",
      features: [
        "Up to 1,000 students",
        "Unlimited courses",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      popular: true,
    },
    {
      id: 3,
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific needs",
      features: [
        "Unlimited students",
        "Unlimited courses",
        "Advanced analytics & reporting",
        "24/7 dedicated support",
        "Custom integrations",
        "Single Sign-On (SSO)",
      ],
      popular: false,
    },
  ];
  return (
    <div className="min-h-screen flex flex-col ">
      <nav className="bg-card sticky top-0 z-50 shadow-sm">
        <div className="mx-10  px-4 sm:px-6 lg:px-8 ">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* <span className="text-2xl text-primary font-extrabold"> */}
              {/* Flytbase Academy */}
              <img
                src="/flybase_academy_logo.svg"
                alt="hello"
                className="h-10 w-72"
              />
              {/* </span> */}
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard">
                <span className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
                  Dashboard
                </span>
              </Link>
              <Link href="/assignment">
                <span className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
                  Assignments
                </span>
              </Link>
              <Link href="/course">
                <span className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
                  Courses
                </span>
              </Link>
              <ModeToggle />
              <UserGreetText />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-primary focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card pt-2 pb-4 px-4">
            <div className="flex flex-col space-y-3">
              <Link href="#features" onClick={() => setIsMenuOpen(false)}>
                <span className="text-foreground hover:text-primary transition-colors duration-300 block py-2">
                  Features
                </span>
              </Link>
              <Link href="#testimonials" onClick={() => setIsMenuOpen(false)}>
                <span className="text-foreground hover:text-primary transition-colors duration-300 block py-2">
                  Testimonials
                </span>
              </Link>
              <Link href="#pricing" onClick={() => setIsMenuOpen(false)}>
                <span className="text-foreground hover:text-primary transition-colors duration-300 block py-2">
                  Pricing
                </span>
              </Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <span className="text-foreground hover:text-primary transition-colors duration-300 block py-2">
                  Login
                </span>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors duration-300 inline-block">
                  Get Started
                </span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Flytbase LMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
