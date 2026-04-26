"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Clock, AlertTriangle, User, ChevronRight, GripVertical, CalendarDays,
} from "lucide-react";
import { useAllTenders } from "@/data/session-tenders";
import type { Tender, BoardColumn } from "@/data/bidpanion";

const BOARD_COLUMNS: BoardColumn[] = [
  'Backlog', 'Screening', 'Go / No-Go', 'Drafting', 'Review', 'Submitted', 'Won', 'Lost'
];

const COLUMN_COLORS: Record<BoardColumn, string> = {
  'Backlog': 'border-slate-200 bg-slate-50',
  'Screening': 'border-blue-200 bg-blue-50',
  'Go / No-Go': 'border-amber-200 bg-amber-50',
  'Drafting': 'border-violet-200 bg-violet-50',
  'Review': 'border-orange-200 bg-orange-50',
  'Submitted': 'border-teal-200 bg-teal-50',
  'Won': 'border-emerald-200 bg-emerald-50',
  'Lost': 'border-slate-200 bg-slate-100',
};

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DeadlineChip({ deadline }: { deadline: string | null }) {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
        <AlertTriangle size={10} />No deadline
      </span>
    );
  }
  const days = getDaysUntilDeadline(deadline);
  if (days === null) return null;

  if (days < 0) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-400">Expired</span>;
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle size={10} />{days}d
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock size={10} />{days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
      <CalendarDays size={10} />{days}d
    </span>
  );
}

interface TenderCardProps {
  tender: Tender;
  onClick: () => void;
}

const TenderCard: React.FC<TenderCardProps> = ({ tender, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TENDER_CARD',
    item: { tenderId: tender.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const fitScoreColor = tender.fitScore
    ? tender.fitScore >= 70
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : tender.fitScore >= 50
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-red-100 text-red-700 border-red-200'
    : 'bg-slate-100 text-slate-500 border-slate-200';

  return (
    <div
      ref={(node) => { drag(node); }}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-lg p-3 mb-3 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-40' : ''
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
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${fitScoreColor}`}>
                {tender.fitScore}%
              </span>
            )}
          </div>

          {tender.tasksTotal !== undefined && tender.tasksTotal > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-teal-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${((tender.tasksCompleted ?? 0) / tender.tasksTotal) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {tender.tasksCompleted}/{tender.tasksTotal}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-slate-400" />
              <span className="text-xs text-slate-600">{tender.owner}</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface BoardColumnProps {
  column: BoardColumn;
  tenders: Tender[];
  onTenderClick: (tender: Tender) => void;
  onDrop: (tenderId: string, targetColumn: BoardColumn) => void;
}

const BoardColumnComponent: React.FC<BoardColumnProps> = ({ column, tenders, onTenderClick, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'TENDER_CARD',
    drop: (item: { tenderId: string }) => {
      onDrop(item.tenderId, column);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`border rounded-lg ${COLUMN_COLORS[column]} p-3`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-900">{column}</h3>
          <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            {tenders.length}
          </span>
        </div>
        <div
          ref={(node) => { drop(node); }}
          className={`min-h-[500px] transition-colors ${isOver ? 'bg-teal-50 border-2 border-dashed border-teal-300 rounded-lg' : ''}`}
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
};

export default function BoardPage() {
  const router = useRouter();
  const { tenders: allTenders, updateOverride } = useAllTenders();
  const [localOverrides, setLocalOverrides] = useState<Record<string, BoardColumn>>({});

  const tenders: Tender[] = allTenders.map((t) => ({
    ...t,
    boardColumn: localOverrides[t.id] ?? t.boardColumn ?? "Backlog",
  }));

  const handleDrop = (tenderId: string, targetColumn: BoardColumn) => {
    setLocalOverrides((prev) => ({ ...prev, [tenderId]: targetColumn }));
    updateOverride(tenderId, { boardColumn: targetColumn });
  };

  const handleTenderClick = (tender: Tender) => {
    router.push(`/app/tenders/${tender.id}`);
  };

  const groupedTenders = BOARD_COLUMNS.reduce((acc, column) => {
    acc[column] = tenders.filter(t => t.boardColumn === column);
    return acc;
  }, {} as Record<BoardColumn, Tender[]>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-slate-900 mb-1">Board</h1>
          <p className="text-slate-600 text-sm">Manage tenders across pipeline stages</p>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-max">
            {BOARD_COLUMNS.map((column) => (
              <BoardColumnComponent
                key={column}
                column={column}
                tenders={groupedTenders[column] || []}
                onTenderClick={handleTenderClick}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
