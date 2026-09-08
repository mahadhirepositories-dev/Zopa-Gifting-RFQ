/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ScopeOfWorkProps {
  data: any;
  onChange: (data: any) => void;
  selectedSubCategory?: number;
  onNext?: () => void;
  onError?: (msg: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const ScopeOfWork: React.FC<ScopeOfWorkProps> = ({
  data,
  onChange,
  disabled,
}) => {
  const [deliverables, setDeliverables] = useState<string[]>(
    data?.deliverables || ["Custom logo printing on boxes", "Individual doorstep shipping to employee addresses"]
  );
  const [newItem, setNewItem] = useState("");

  const addDeliverable = () => {
    if (!newItem.trim()) return;
    const updated = [...deliverables, newItem.trim()];
    setDeliverables(updated);
    setNewItem("");
    onChange({ deliverables: updated });
  };

  const removeDeliverable = (index: number) => {
    const updated = deliverables.filter((_, i) => i !== index);
    setDeliverables(updated);
    onChange({ deliverables: updated });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Scope of Work & Deliverables</h2>
        <p className="text-xs text-slate-500 mt-0.5">Specify expected deliverables from the selected vendor.</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Add deliverable (e.g. Custom ribbon branding)"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            disabled={disabled}
            className="h-9 text-sm"
          />
          <Button type="button" onClick={addDeliverable} disabled={disabled} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <ul className="space-y-2">
          {deliverables.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
              <span>{item}</span>
              {!disabled && (
                <button type="button" onClick={() => removeDeliverable(idx)} className="text-rose-500 hover:text-rose-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
