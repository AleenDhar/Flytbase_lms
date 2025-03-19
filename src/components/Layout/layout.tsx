import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserGreetText from "../UserGreetText";
import LoginButton from "../LoginLogoutButton";
import { ModeToggle } from "../theme/mode-toggle";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col ">
      <header className="border-b ">
        <div className="container  mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Flytbase Academy
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/course"
              className="hidden md:block hover:text-primary transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/dashboard"
              className="hidden md:block hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <ModeToggle />
            <UserGreetText />
            <LoginButton />
          </nav>
        </div>
      </header>

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
