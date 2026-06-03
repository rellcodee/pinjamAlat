"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Notification {

  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications?limit=1");
      const data = await res.json();
      if (data.meta) {
        setUnreadCount(data.meta.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Determine notification link based on current layout path
  const getNotificationLink = () => {
    if (pathname.startsWith("/petugas")) return "/petugas/notifications";
    if (pathname.startsWith("/peminjam")) return "/peminjam/notifications";
    return "/notifications";
  };

  return (
    <Link
      href={getNotificationLink()}
      className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
