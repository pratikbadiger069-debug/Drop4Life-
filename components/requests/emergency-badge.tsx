"use client";

import React from "react";
import { RequestPriority } from "@/lib/types";
import { AlertCircle, AlertTriangle, Clock, Calendar } from "lucide-react";

interface EmergencyBadgeProps {
  priority: RequestPriority;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmergencyBadge({ priority, size = "md", className = "" }: EmergencyBadgeProps) {
  const isEmergency = priority === "CRITICAL" || priority === "EMERGENCY";

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const config: Record<
    RequestPriority,
    {
      label: string;
      sublabel: string;
      icon: React.ReactNode;
      containerClass: string;
      ariaLabel: string;
    }
  > = {
    CRITICAL: {
      label: "Critical",
      sublabel: "< 1 hr",
      icon: <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse flex-shrink-0" aria-hidden="true" />,
      containerClass: "bg-red-50 text-red-700 border-red-200 border ring-1 ring-red-500/20 font-semibold",
      ariaLabel: "Priority: Critical. Required within 1 hour.",
    },
    EMERGENCY: {
      label: "Emergency",
      sublabel: "< 4 hrs",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" aria-hidden="true" />,
      containerClass: "bg-red-50 text-red-700 border-red-200 border font-medium",
      ariaLabel: "Priority: Emergency. Required within 4 hours.",
    },
    URGENT: {
      label: "Urgent",
      sublabel: "< 24 hrs",
      icon: <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" aria-hidden="true" />,
      containerClass: "bg-amber-50 text-amber-700 border-amber-200 border font-medium",
      ariaLabel: "Priority: Urgent. Required within 24 hours.",
    },
    NORMAL: {
      label: "Standard",
      sublabel: "Scheduled",
      icon: <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" aria-hidden="true" />,
      containerClass: "bg-slate-100 text-slate-700 border-slate-200 border font-medium",
      ariaLabel: "Priority: Standard scheduled request.",
    },
  };

  const item = config[priority] || config.NORMAL;

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeStyles[size]} ${item.containerClass} ${className}`}
      role="status"
      aria-label={item.ariaLabel}
    >
      {item.icon}
      <span>{item.label}</span>
      {size !== "sm" && <span className="opacity-75 font-normal">({item.sublabel})</span>}
      {isEmergency && (
        <span className="sr-only">Emergency high-priority requisition</span>
      )}
    </span>
  );
}
