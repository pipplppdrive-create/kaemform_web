import { CalendarDays, Eye, FileText, Trash2 } from "lucide-react";
import type { TemplateRecord } from "../../../shared/types";
import { cn, formatDate } from "../lib/utils";
import { Badge, Button, Card } from "./ui";

export function TemplateCard({
  template,
  selected,
  onSelect,
  onPreview,
  onDelete,
}: {
  template: TemplateRecord;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden transition-all hover:-translate-y-px hover:border-kaem-200 hover:shadow-card-hover",
        selected && "border-kaem-400 ring-2 ring-kaem-100"
      )}
      onClick={onSelect}
    >
      <div className="h-1 bg-gradient-to-r from-kaem-400 to-kaem-600" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-input bg-kaem-50 text-kaem-700">
            <FileText className="h-5 w-5" />
          </div>
          <Badge variant="brand">{template.placeholders.length} placeholder</Badge>
        </div>
        <h3 className="mt-4 font-bold text-slate-900">{template.name}</h3>
        <p className="mt-1 truncate text-xs text-slate-400">{template.filename}</p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(template.created_at)}
        </div>
        {(onPreview || onDelete) && (
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            {onPreview && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onPreview();
                }}
              >
                <Eye className="h-4 w-4" /> Preview
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
