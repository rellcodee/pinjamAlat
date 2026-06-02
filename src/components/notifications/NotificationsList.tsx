"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Info, 
  AlertTriangle, 
  Trash2, 
  Check, 
  ChevronLeft,
  Eye
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=100");
      const data = await res.json();
      if (data.data) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const deleteNotification = async (id: number) => {
    if (!confirm("Hapus notifikasi ini?")) return;
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm("Hapus semua notifikasi?")) return;
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
    } catch (error) {
      console.error("Failed to delete all notifications", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "DANGER":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* 🟢 HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Pusat Notifikasi</h1>
            <p className="text-xs text-slate-500">Kelola semua pemberitahuan Anda</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Check size={14} />
                Baca Semua
              </button>
              <button
                onClick={deleteAllNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors"
              >
                <Trash2 size={14} />
                Hapus Semua
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🟢 LIST SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium">Memuat notifikasi...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak ada notifikasi</h3>
            <p className="text-sm">Semua pemberitahuan Anda akan muncul di sini</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 flex flex-col md:flex-row gap-4 transition-colors duration-200 group relative ${
                  !notification.isRead ? "bg-blue-50/20" : "hover:bg-slate-50/50"
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                )}
                
                <div className="flex-shrink-0 flex items-start gap-3">
                  <div className="mt-1">{getTypeIcon(notification.type)}</div>
                  <div className="md:hidden flex-1">
                    <p className={`text-sm font-bold leading-tight ${notification.isRead ? "text-slate-600" : "text-slate-900"}`}>
                      {notification.title}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="hidden md:block">
                    <p className={`text-base font-bold mb-1 ${notification.isRead ? "text-slate-600" : "text-slate-900"}`}>
                      {notification.title}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(notification.createdAt)}
                    </p>
                    
                    {notification.link && (
                      <button
                        onClick={() => {
                          markAsRead(notification.id);
                          router.push(notification.link!);
                        }}
                        className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all"
                      >
                        <Eye size={12} /> Lihat Detail
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                      title="Tandai dibaca"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
