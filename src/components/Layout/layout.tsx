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
  Home,
  BookText,
  GraduationCap,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import UserGreetText from "@/components/UserGreetText";
import LoginButton from "@/components/LoginLogoutButton";
import React, { ReactNode } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface LayoutProps {
  children: React.ReactNode;
}

// Define types
type Feature = {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
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
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // For mobile view determination
  const [isMobile, setIsMobile] = useState(false);

  // For animation purposes
  const [isVisible, setIsVisible] = useState(false);

  // Check if component is mounted to avoid hydration issues with theme
  useEffect(() => {
    setMounted(true);
    // Initial check for mobile view
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev % features.length) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMenuOpen &&
        !target.closest("#mobile-menu") &&
        !target.closest("#menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Also close menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        // md breakpoint in Tailwind
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Toggle theme handler for mobile view
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Logout handler with Supabase
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsMenuOpen(false);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error logging out:", error.message);
        throw error;
      }

      // Redirect to home page after successful logout
      router.push("/");

      // Optional: Clear any local storage or cookies if needed
      // localStorage.removeItem('some-key');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get logo based on theme and screen size
  const getLogo = () => {
    if (!mounted) return "/lovable-uploads/logo.png"; // Default before hydration

    if (isMobile) {
      return theme === "dark"
        ? "/lovable-uploads/logo.png"
        : "/lovable-uploads/logo.png";
    }

    return "/lovable-uploads/logo.png";
  };

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
    <div className="min-h-screen flex flex-col">
      <nav className="bg-card sticky top-0 z-50 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between h-16">
            <Link className="flex items-center" href="/">
              <img
                src={getLogo()}
                alt="Flytbase Academy"
                className="h-10 w-auto sm:w-auto max-w-[72px] sm:max-w-[200px] md:max-w-[280px] object-contain"
              />
            </Link>

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
                id="menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-primary focus:outline-none p-2 rounded-md transition-colors"
                aria-label="Toggle menu"
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
          <div
            id="mobile-menu"
            className="md:hidden bg-card py-4 px-4 shadow-lg border-t border-border animate-in slide-in-from-top duration-300"
          >
            <div className="space-y-1">
              {/* User greeting removed from mobile view as requested */}

              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <span className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-accent/50 transition-colors duration-300 py-3 px-3 rounded-md">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </span>
              </Link>

              <Link href="/assignment" onClick={() => setIsMenuOpen(false)}>
                <span className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-accent/50 transition-colors duration-300 py-3 px-3 rounded-md">
                  <BookText className="w-5 h-5" />
                  <span>Assignments</span>
                </span>
              </Link>

              <Link href="/course" onClick={() => setIsMenuOpen(false)}>
                <span className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-accent/50 transition-colors duration-300 py-3 px-3 rounded-md">
                  <GraduationCap className="w-5 h-5" />
                  <span>Courses</span>
                </span>
              </Link>

              {/* Custom theme toggle for mobile that works consistently */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between text-foreground hover:bg-accent/50 transition-colors duration-300 py-3 px-3 rounded-md"
              >
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  <span>Theme</span>
                </div>
                <span className="text-sm font-medium">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </button>

              <div className="pt-2 mt-2 border-t border-border">
                {/* Functional logout button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors duration-300 py-3 px-3 rounded-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Flytbase Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
