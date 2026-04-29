"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type NotificationType = "intel" | "radar" | "reminder" | "report";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "date">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "seed-1",
      title: "Weekly Recon Report",
      message: "You tracked 12 applications this week and your match score average was 88%. Keep up the momentum!",
      type: "report",
      read: false,
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "seed-2",
      title: "Follow-up Required",
      message: "It's been 5 days since you applied to Netflix. It might be time to reach out to a recruiter. Click here to generate a custom follow-up email.",
      type: "reminder",
      read: false,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notif: Omit<Notification, "id" | "read" | "date">) => {
    setNotifications((prev) => [
      { ...notif, id: Math.random().toString(36).substr(2, 9), read: false, date: new Date() },
      ...prev,
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
