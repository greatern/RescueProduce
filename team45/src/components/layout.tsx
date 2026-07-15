// Layout.tsx
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import AppLogo from "../assets/img/AppLogo.png";
import { NotificationBell } from "../components/NotificationBell";

interface LayoutProps {
  options: { path: string; name: string; icon?: React.ReactNode }[];
}

const Layout: React.FC<LayoutProps> = ({ options }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white/70 backdrop-blur-lg shadow-xl flex flex-col rounded-r-3xl border-r border-green-100 sticky top-0 h-screen">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-green-100 flex-shrink-0">
            <div className="flex justify-center items-center">
              <img src={AppLogo} alt="App Logo" className="h-10 w-auto" />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-grow px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {options.map((option) => {
                const isActive =
                  location.pathname === option.path ||
                  location.pathname.startsWith(`${option.path}/`);
                return (
                  <li key={option.path}>
                    <Link
                      to={option.path}
                      className={`flex items-center py-3 px-5 rounded-2xl transition-all duration-200 group ${
                        isActive
                          ? "bg-green-100 text-green-700 font-semibold shadow-inner"
                          : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {option.icon && (
                        <span
                          className={`mr-3 transition-colors ${
                            isActive
                              ? "text-green-700"
                              : "text-green-400 group-hover:text-green-600"
                          }`}
                        >
                          {option.icon}
                        </span>
                      )}
                      <span>{option.name}</span>
                      {isActive && (
                        <motion.span
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-green-500 rounded-full"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-6 border-t border-green-100 space-y-4 flex-shrink-0">
            <NotificationBell />

            <div className="px-5 py-3 rounded-2xl bg-green-50 hover:bg-green-100 transition cursor-pointer flex items-center">
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                AU
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-green-800">Admin User</p>
                <p className="text-xs text-green-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
