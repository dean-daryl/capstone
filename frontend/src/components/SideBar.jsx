import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, CircleUserRound, PanelRightClose, Settings, User, X } from "lucide-react";
import RecentActivities from "./recent-activity/RecentActivities.jsx";
import sidebar from "../../public/assets/sidebar.svg";

function SideBar({ isOpen, setIsOpen }) {
  const firstName = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName") ?? "";
  const role = localStorage.getItem("role");
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen flex flex-col justify-between bg-gray-900 text-gray-100 shadow-lg transition-all ${
          isOpen ? "w-75" : "w-0"
        } overflow-hidden`}
      >
        {isOpen && (
          <>
            <div className="sticky top-0 py-4 px-4 flex items-center justify-between bg-gray-900 w-full">
              <div className="logo font-bold text-2xl z-50">
                <Link to="/dashboard" className="flex items-center">
                  <Bot size={40} className="text-purple-400 mr-3" />
                  <h1 className="text-base font-bold text-gray-100">
                    SomaTek AI
                  </h1>
                </Link>
              </div>
              <button
                className="p-1 hover:bg-gray-800 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <div className="py-4 px-6 bg-gray-900">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-gray-100"
                />
              </div>
              <div className="py-4 px-4 bg-gray-900">
                {role === "STUDENT" ? <RecentActivities /> : 
                <div className="py-4">
                  <Link to="/users" className="flex items-center py-2 px-4 hover:bg-gray-800 rounded-md">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-100">Users</span>
                  </Link>
                  <Link to="/settings" className="flex items-center py-2 px-4 hover:bg-gray-800 rounded-md">
                    <Settings className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-100">Settings</span>
                  </Link>
                </div>
                }

              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-900">
                <CircleUserRound className="w-6 h-6 text-gray-200" />
                <h3 className="text-sm font-medium text-gray-100">{firstName}</h3>
              </div>
            </div>
          </>
        )}
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-0 left-0 p-5 md:p-7 z-50 hover:opacity-80 transition-opacity"
        >
          <PanelRightClose size={20} className="text-gray-900" />
        </button>
      )}
    </>
  );
}

export default SideBar;
