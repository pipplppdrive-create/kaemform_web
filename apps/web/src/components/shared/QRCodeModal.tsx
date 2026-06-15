"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Modal } from "@/components/ui";

export function QRCodeModal({
  open,
  onOpenChange,
  url,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}) {
  const t = useTranslations("qrCode");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qrcode.png";
    link.click();
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
      footer={
        <Button type="button" onClick={handleDownload}>
          {t("download")}
        </Button>
      }
    >
      <div className="flex justify-center py-4">
        <QRCodeCanvas ref={canvasRef} value={url} size={300} marginSize={2} />
      </div>
    </Modal>
  );
}
