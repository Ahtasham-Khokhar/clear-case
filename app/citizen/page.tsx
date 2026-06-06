"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { type Case, type Notification } from "@/lib/supabase";
import type { JSX } from "react";

export default function CitizenDashboard() {
  const { authUser, user, loading: authLoading } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role === "citizen") {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    if (!user) return; // Guard clause to prevent null access

    try {
      setError(null);
      setLoading(true);

      const casesResponse = await apiClient.getCases({
        citizen_id: user.id,
      });

      if (!casesResponse || !casesResponse.cases) {
        throw new Error("Failed to fetch cases");
      }

      setCases(casesResponse.cases);

      const notificationsResponse = await apiClient.getNotifications({
        limit: 10,
      });

      if (notificationsResponse && notificationsResponse.notifications) {
        setNotifications(notificationsResponse.notifications);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_investigation":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "under_investigation":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "citizen") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold text-lg">
          You are not authorized to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome back, {user.full_name}
              </h1>
              <p className="text-sm text-gray-600">Citizen Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="relative">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {notifications.filter((n) => !n.is_read).length}
                  </Badge>
                )}
              </Button>
              <Button asChild>
                <Link href="/citizen/report">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Crime
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Other UI sections (stat cards, tabs) would go here */}
    </div>
  );
}

// Reusable stat card
function StatCard({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          {icon}
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
