"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-[16px] border border-white/80 bg-white p-6 shadow-form",
            "max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title && (
                <Dialog.Title className="text-lg font-bold tracking-tight text-slate-900">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="rounded-input p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children && <div className="mt-5">{children}</div>}
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
