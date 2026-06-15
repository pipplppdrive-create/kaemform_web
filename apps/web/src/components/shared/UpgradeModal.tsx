"use client";

import { useTranslations } from "next-intl";
import { Button, Modal } from "@/components/ui";

const KAEMNUR_STORE_URL = `${process.env.NEXT_PUBLIC_KAEMNUR_URL ?? "https://kaemnur.com"}/store`;

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t("upgrade.modalTitle")}
      description={t("upgrade.modalDescription")}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
          <Button
            onClick={() => window.open(KAEMNUR_STORE_URL, "_blank", "noopener,noreferrer")}
          >
            {t("upgrade.cta")}
          </Button>
        </>
      }
    >
      <p className="text-sm font-medium text-gray-900">{t("upgrade.price")}</p>
    </Modal>
  );
}
