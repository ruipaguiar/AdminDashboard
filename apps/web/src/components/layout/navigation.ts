import {
  Bitcoin,
  MessageSquareText,
  Newspaper,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavigation: DashboardNavigationItem[] = [
  { href: "/crypto", label: "Crypto", icon: Bitcoin },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/chat", label: "Chat IA", icon: MessageSquareText },
  { href: "/settings", label: "Settings", icon: Settings },
];
