"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/toastStore";

const variantClasses = {
  default: "border-primary-200 bg-white text-slate-900",
  success: "border-emerald-300 bg-white text-slate-900",
  error: "border-red-300 bg-white text-slate-900",
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <RadixToast.Provider swipeDirection="right">
      {toasts.map((t) => (
        <RadixToast.Root
          key={t.id}
          duration={4000}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id);
          }}
          className={cn(
            "rounded-card border p-4 shadow-card-hover",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out",
            variantClasses[t.variant]
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <RadixToast.Title className="text-sm font-semibold">
                {t.title}
              </RadixToast.Title>
              {t.description && (
                <RadixToast.Description className="mt-1 text-sm text-gray-500">
                  {t.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </RadixToast.Close>
          </div>
        </RadixToast.Root>
      ))}
      <RadixToast.Viewport className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none" />
    </RadixToast.Provider>
  );
}
