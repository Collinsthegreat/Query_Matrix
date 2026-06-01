"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

export type ToastTone = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  actionLabel?: string;
  action?: () => void;
};

type ToastStore = {
  messages: ToastMessage[];
  pushToast: (message: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  messages: [],
  pushToast: (message) => set((state) => ({ messages: [...state.messages, { ...message, id: nanoid() }].slice(-4) })),
  removeToast: (id) => set((state) => ({ messages: state.messages.filter((message) => message.id !== id) }))
}));
