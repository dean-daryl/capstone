import { Link, useLocation } from "react-router-dom";
import { Bot, CircleUserRound, LogOut, PanelRightClose, X } from "lucide-react";
import RecentActivities from "./recent-activity/RecentActivities.jsx";
import menuConfig from "../config/menuConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

function SideBar({ isOpen, setIsOpen }) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const menuItems = menuConfig[role] || menuConfig.STUDENT;

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen flex flex-col bg-gray-950 text-gray-100 border-r border-gray-800/50 transition-all ${
          isOpen ? "w-[300px]" : "w-0"
        } overflow-hidden z-40`}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <Bot size={28} className="text-purple-400" />
                <span className="text-lg font-semibold text-white tracking-tight">
                  SomaTek AI
                </span>
              </Link>
              <button
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {menuItems.map((item, index) => {
                  if (item.type === "recent-activities") {
                    return (
                      <div key="recent-activities" className="mt-6 mb-2">
                        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Recent Activity
                        </p>
                        <RecentActivities />
                      </div>
                    );
                  }
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-purple-500/10 text-purple-400"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] ${isActive ? "text-purple-400" : "text-gray-500"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* User footer */}
            <div className="border-t border-gray-800/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <CircleUserRound className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 p-2 z-50 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors"
        >
          <PanelRightClose size={18} className="text-gray-400" />
        </button>
      )}
    </>
  );
}

export default SideBar;
