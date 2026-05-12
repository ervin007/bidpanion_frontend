"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Clock,
  AlertTriangle,
  User,
  ChevronRight,
  GripVertical,
  CalendarDays,
} from "lucide-react";
import { api, type RouterOutputs } from "@/trpc/react";
import {
  BOARD_COLUMNS,
  BOARD_COLUMN_LABEL,
  daysUntil,
} from "@/lib/bidpanion-labels";
import type { BoardColumn } from "@/generated/prisma";

type TenderListItem = RouterOutputs["tender"]["list"][number];

const COLUMN_COLORS: Record<BoardColumn, string> = {
  BACKLOG: "border-slate-200 bg-slate-50",
  SCREENING: "border-blue-200 bg-blue-50",
  GO_NO_GO: "border-amber-200 bg-amber-50",
  DRAFTING: "border-violet-200 bg-violet-50",
  REVIEW: "border-orange-200 bg-orange-50",
  SUBMITTED: "border-teal-200 bg-teal-50",
  WON: "border-emerald-200 bg-emerald-50",
  LOST: "border-slate-200 bg-slate-100",
};

function DeadlineChip({ deadline }: { deadline: Date | string | null }) {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
        <AlertTriangle size={10} />
        No deadline
      </span>
    );
  }
  const days = daysUntil(deadline);
  if (days === null) return null;
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-400">
        Expired
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle size={10} />
        {days}d
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock size={10} />
        {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
      <CalendarDays size={10} />
      {days}d
    </span>
  );
}

function TenderCard({
  tender,
  onClick,
}: {
  tender: TenderListItem;
  onClick: () => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: "TENDER_CARD",
    item: { tenderId: tender.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const fitScoreColor =
    tender.fitScore !== null
      ? tender.fitScore >= 70
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : tender.fitScore >= 50
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-red-100 text-red-700 border-red-200"
      : "bg-slate-100 text-slate-500 border-slate-200";

  const total = tender.tasksTotal ?? 0;
  const done = tender.tasksCompleted ?? 0;

  return (
    <div
      ref={(node) => {
        drag(node);
      }}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-lg p-3 mb-3 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <GripVertical size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 leading-tight mb-1.5 line-clamp-2">
            {tender.title}
          </h4>
          <p className="text-xs text-slate-500 mb-2">{tender.authority}</p>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <DeadlineChip deadline={tender.deadline} />
            {tender.fitScore !== null && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${fitScoreColor}`}
              >
                {tender.fitScore}%
              </span>
            )}
          </div>

          {total > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-teal-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(done / total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {done}/{total}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-slate-400" />
              <span className="text-xs text-slate-600">
                {tender.owner?.name ?? "Unassigned"}
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardColumnView({
  column,
  tenders,
  onTenderClick,
  onDrop,
}: {
  column: BoardColumn;
  tenders: TenderListItem[];
  onTenderClick: (tender: TenderListItem) => void;
  onDrop: (tenderId: string, target: BoardColumn) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "TENDER_CARD",
    drop: (item: { tenderId: string }) => {
      onDrop(item.tenderId, column);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`border rounded-lg ${COLUMN_COLORS[column]} p-3`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-900">
            {BOARD_COLUMN_LABEL[column]}
          </h3>
          <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            {tenders.length}
          </span>
        </div>
        <div
          ref={(node) => {
            drop(node);
          }}
          className={`min-h-[500px] transition-colors ${
            isOver ? "bg-teal-50 border-2 border-dashed border-teal-300 rounded-lg" : ""
          }`}
        >
          {tenders.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              No tenders
            </div>
          ) : (
            tenders.map((tender) => (
              <TenderCard
                key={tender.id}
                tender={tender}
                onClick={() => onTenderClick(tender)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const tenderQuery = api.tender.list.useQuery({ includeDeleted: false });
  const setBoardColumn = api.tender.setBoardColumn.useMutation({
    onMutate: async (variables) => {
      await utils.tender.list.cancel();
      const previous = utils.tender.list.getData({ includeDeleted: false });
      utils.tender.list.setData({ includeDeleted: false }, (data) =>
        data?.map((t) =>
          t.id === variables.id ? { ...t, boardColumn: variables.boardColumn } : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        utils.tender.list.setData({ includeDeleted: false }, ctx.previous);
      }
    },
    onSettled: () => {
      utils.tender.list.invalidate();
    },
  });

  const tenders = tenderQuery.data ?? [];
  const grouped = BOARD_COLUMNS.reduce(
    (acc, column) => {
      acc[column] = tenders.filter((t) => (t.boardColumn ?? "BACKLOG") === column);
      return acc;
    },
    {} as Record<BoardColumn, TenderListItem[]>,
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-slate-900 mb-1">Board</h1>
          <p className="text-slate-600 text-sm">
            Manage tenders across pipeline stages. Drag cards between columns to update.
          </p>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-max">
            {BOARD_COLUMNS.map((column) => (
              <BoardColumnView
                key={column}
                column={column}
                tenders={grouped[column] ?? []}
                onTenderClick={(t) => router.push(`/app/tenders/${t.id}`)}
                onDrop={(id, col) =>
                  setBoardColumn.mutate({ id, boardColumn: col })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
