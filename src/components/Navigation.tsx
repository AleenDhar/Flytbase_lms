
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BrandLogo from "./BrandLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminView } from "@/hooks/use-admin-view";
import { useAdminCheck } from "@/hooks/use-admin-check";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { viewAsUser, setAdminView } = useAdminView();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Define navigation items - only show public pages for non-authenticated users
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "Assessments", path: "/assessments" },
  ];

  // Add dashboard link for signed-in users only
  if (user) {
    navItems.push({ name: "Dashboard", path: "/dashboard" });

    // Only add admin link if user is admin and not viewing as regular user
    if (isAdmin && !viewAsUser) {
      navItems.push({ name: "Admin", path: "/admin" });
    }
  }

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleReturnToAdminView = () => {
    setAdminView(false);
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.user_metadata?.first_name) {
      return `${user.user_metadata.first_name.charAt(0)}${
        user.user_metadata.last_name
          ? user.user_metadata.last_name.charAt(0)
          : ""
      }`;
    }
    return user.email ? user.email.charAt(0).toUpperCase() : "U";
  };

  // Show admin badge in dropdown if viewing as regular user
  const adminViewingAsUser = viewAsUser && isAdmin;

  return (
    <nav className="bg-flytbase-primary border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <BrandLogo className="h-8 w-auto" />
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? "text-white bg-[#1A1F2C]"
                        : "text-neutral-300 hover:text-white hover:bg-[#1A1F2C]/50"
                    } transition-colors duration-200`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url || ""}
                        alt={user.email || "User"}
                      />
                      <AvatarFallback className="bg-flytbase-secondary text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {adminViewingAsUser && (
                      <div
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-flytbase-primary"
                        title="Admin viewing as user"
                      ></div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.user_metadata?.first_name && (
                        <p className="font-medium">
                          {user.user_metadata.first_name}{" "}
                          {user.user_metadata.last_name}
                        </p>
                      )}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                      {adminViewingAsUser && (
                        <p className="text-sm text-blue-500 font-medium">
                          Admin viewing as user
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {isAdmin && adminViewingAsUser && (
                    <DropdownMenuItem onClick={handleReturnToAdminView}>
                      Return to Admin View
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-500"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/sign-in">
                <Button className="bg-flytbase-secondary hover:bg-flytbase-secondary/90">
                  Start Learning
                </Button>
              </Link>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-300 hover:text-white hover:bg-[#1A1F2C]/50 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1A1F2C]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? "text-white bg-[#2A3249]"
                    : "text-neutral-300 hover:text-white hover:bg-[#2A3249]/50"
                } transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-white/10">
            <div className="space-y-2 px-2">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-2">
                    <div className="mr-3 relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url || ""}
                          alt={user.email || "User"}
                        />
                        <AvatarFallback className="bg-flytbase-secondary text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      {adminViewingAsUser && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-flytbase-primary"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-base font-medium text-white">
                        {user.user_metadata?.first_name
                          ? `${user.user_metadata.first_name} ${
                              user.user_metadata.last_name || ""
                            }`
                          : user.email?.split("@")[0] || "User"}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {user.email}
                      </div>
                      {adminViewingAsUser && (
                        <div className="text-sm text-blue-500">
                          Admin viewing as user
                        </div>
                      )}
                    </div>
                  </div>
                  {isAdmin && adminViewingAsUser && (
                    <Button
                      onClick={handleReturnToAdminView}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Return to Admin View
                    </Button>
                  )}
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start bg-flytbase-secondary hover:bg-flytbase-secondary/90">
                    Start Learning
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
