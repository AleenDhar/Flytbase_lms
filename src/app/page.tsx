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

export default function Home() {
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div
              className={`text-center lg:text-left transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight">
                Transform Your{" "}
                <span className="text-primary">Educational Experience</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground">
                Empower your teaching and enhance learning outcomes with our
                intuitive, feature-rich learning management system designed for
                educators and students alike.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/signup"
                  className="flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground text-lg font-medium rounded-md hover:bg-primary/90 transition-colors duration-300 shadow-md"
                >
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/demo"
                  className="flex items-center justify-center px-8 py-3 bg-card text-primary text-lg font-medium rounded-md border border-primary hover:bg-accent transition-colors duration-300"
                >
                  <span>Request Demo</span>
                </Link>
              </div>
            </div>
            <div
              className={`mt-12 lg:mt-0 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="bg-card shadow-xl rounded-lg overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-w-16 aspect-h-9 bg-accent flex items-center justify-center">
                  <img
                    src="/api/placeholder/800/450"
                    alt="LMS Dashboard Preview"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Course Dashboard
                    </h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-destructive rounded-full"></div>
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-primary-foreground/80">Active Learners</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-primary-foreground/80">Courses Created</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-primary-foreground/80">Completion Rate</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Institutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Powerful Features for Modern Education
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform is designed to make teaching and learning efficient,
              engaging, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-6">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                    activeFeature === feature.id
                      ? "bg-accent border-l-4 border-primary shadow-md"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-xl shadow-xl p-1 w-full max-w-md">
                <div className="bg-card rounded-lg p-6">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`transition-opacity duration-500 ${
                        activeFeature === feature.id
                          ? "block opacity-100"
                          : "hidden opacity-0"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-semibold text-foreground">
                          {feature.title}
                        </h4>
                        {feature.icon}
                      </div>
                      <div className="space-y-4 mb-6">
                        <div className="h-8 bg-muted rounded-md w-full"></div>
                        <div className="h-24 bg-muted rounded-md w-full"></div>
                        <div className="h-12 bg-muted rounded-md w-3/4"></div>
                      </div>
                      <div className="flex justify-end">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-300 text-sm">
                          Learn More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-secondary rounded-full opacity-70"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-primary/40 rounded-full opacity-70"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trusted by Educators Worldwide
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              See what our customers have to say about their experience with our
              platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {testimonial.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to Transform Your Educational Experience?
          </h2>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Join thousands of educators and institutions who have already
            elevated their teaching and learning.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-card text-primary text-lg font-semibold rounded-md hover:bg-accent transition-colors duration-300 shadow-lg"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted-foreground/90 text-muted-foreground/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-accent-foreground text-lg font-semibold mb-4">
                Flytbase
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-accent-foreground text-lg font-semibold mb-4">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enterprise"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-accent-foreground text-lg font-semibold mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    API Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-accent-foreground text-lg font-semibold mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gdpr"
                    className="hover:text-accent-foreground transition-colors duration-300"
                  >
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-muted-foreground/10 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm">
              &copy; {new Date().getFullYear()} Flytbase. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link
                href="#"
                className="text-muted-foreground/50 hover:text-accent-foreground transition-colors duration-300"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground/50 hover:text-accent-foreground transition-colors duration-300"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground/50 hover:text-accent-foreground transition-colors duration-300"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 3.995-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-3.995-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground/50 hover:text-accent-foreground transition-colors duration-300"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
