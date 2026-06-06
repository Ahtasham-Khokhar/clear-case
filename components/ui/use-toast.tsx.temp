import * as React from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title: string
  description?: string
  duration?: number
  variant?: "default" | "destructive"
}

export function toast({ title, description, duration = 3000, variant = "default" }: ToastProps) {
  sonnerToast[variant === "destructive" ? "error" : "success"](title, {
    description,
    duration,
  })
} 