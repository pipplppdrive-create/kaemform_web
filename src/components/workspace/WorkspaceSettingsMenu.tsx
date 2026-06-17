"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Settings, Pencil, Trash2 } from "lucide-react";
import type { Workspace } from "@kaemform/shared";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Modal,
} from "@/components/ui";
import { useToast } from "@/stores/toastStore";

export function WorkspaceSettingsMenu({ workspace }: { workspace: Workspace }) {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(workspace.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRename = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        setError(t("common.error"));
        return;
      }

      setRenameOpen(false);
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, { method: "DELETE" });

      if (!res.ok) {
        toast({ title: t("common.error"), variant: "error" });
        return;
      }

      router.push("/app");
      router.refresh();
    } catch {
      toast({ title: t("common.networkError"), variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-input border border-border bg-white p-2 text-slate-400 shadow-sm outline-none transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          aria-label={t("workspace.settings")}
        >
          <Settings className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil className="h-4 w-4" />
            {t("workspace.renameWorkspace")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            {t("workspace.deleteWorkspace")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal open={renameOpen} onOpenChange={setRenameOpen} title={t("workspace.renameWorkspace")}>
        <form onSubmit={handleRename} className="flex flex-col gap-4">
          <Input
            label={t("common.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error ?? undefined}
            required
            maxLength={100}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRenameOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={loading} disabled={!name.trim()}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("workspace.deleteWorkspace")}
        description={t("workspace.deleteWorkspaceConfirm")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={loading} onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </>
        }
      />
    </>
  );
}
