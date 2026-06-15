import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { displayValue } from "../lib/utils";
import { Input } from "./ui";

export function DataTable({
  rows,
  pageSize = 8,
}: {
  rows: Record<string, unknown>[];
  pageSize?: number;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const columns = useMemo(() => [...new Set(rows.flatMap((row) => Object.keys(row)))], [rows]);
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        Object.values(row).some((value) =>
          displayValue(value).toLowerCase().includes(search.toLowerCase())
        )
      ),
    [rows, search]
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Cari data..."
          className="pl-10"
        />
        <Search className="pointer-events-none relative -mt-[30px] ml-3 h-4 w-4 text-slate-400" />
      </div>
      <div className="overflow-hidden rounded-card border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-12 px-4 py-3">#</th>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-100 text-slate-600 transition-colors hover:bg-kaem-50/70"
                >
                  <td className="px-4 py-3 text-slate-400">{(page - 1) * pageSize + index + 1}</td>
                  {columns.map((column) => (
                    <td key={column} className="max-w-[260px] truncate px-4 py-3">
                      {displayValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>{filtered.length} data</span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
              disabled={page === pages}
              onClick={() => setPage((value) => value + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
