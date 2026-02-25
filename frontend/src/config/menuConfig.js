import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Users,
  BookOpen,
  BarChart3,
  UserCircle,
  Settings,
} from "lucide-react";

const menuConfig = {
  STUDENT: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Ask AI", icon: MessageSquare, path: "/dashboard/query" },
    { type: "recent-activities" },
    { label: "Profile", icon: UserCircle, path: "/dashboard/profile" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ],
  TEACHER: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Ask AI", icon: MessageSquare, path: "/dashboard/query" },
    { label: "Documents", icon: FileText, path: "/dashboard/documents" },
    { label: "Courses", icon: BookOpen, path: "/dashboard/courses" },
    { label: "Analytics", icon: BarChart3, path: "/dashboard" },
    { label: "Profile", icon: UserCircle, path: "/dashboard/profile" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ],
  ADMIN: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Ask AI", icon: MessageSquare, path: "/dashboard/query" },
    { label: "Documents", icon: FileText, path: "/dashboard/documents" },
    { label: "Users", icon: Users, path: "/dashboard/users" },
    { label: "Courses", icon: BookOpen, path: "/dashboard/courses" },
    { label: "Analytics", icon: BarChart3, path: "/dashboard" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ],
};

export default menuConfig;
