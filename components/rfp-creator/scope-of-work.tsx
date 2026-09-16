/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import {
  scopeSchema,
  type ScopeFieldErrors,
} from "@/lib/validations/rfq-creator-schema";

interface ScopeOfWorkProps {
  data: any;
  onChange: (data: any) => void;
  selectedSubCategory?: number;
  onNext?: () => void;
  onError?: (msg: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export interface ScopeOfWorkHandle {
  /** Marks the deliverables list as touched and returns whether it's valid. */
  validate: () => boolean;
}

export const ScopeOfWork = forwardRef<ScopeOfWorkHandle, ScopeOfWorkProps>(
  ({ data, onChange, onError, disabled }, ref) => {
    const [deliverables, setDeliverables] = useState<string[]>(
      data?.deliverables || [],
    );

    useEffect(() => {
      setDeliverables(data?.deliverables || []);
    }, [data?.deliverables]);
    const [newItem, setNewItem] = useState("");
    const [touched, setTouched] = useState(false);

    const validation = useMemo(() => {
      const result = scopeSchema.safeParse({ deliverables });

      if (result.success) {
        return { errors: {} as ScopeFieldErrors, isValid: true };
      }

      const fieldErrors: ScopeFieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ScopeFieldErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      return { errors: fieldErrors, isValid: false };
    }, [deliverables]);

    useImperativeHandle(
      ref,
      () => ({
        validate: () => {
          setTouched(true);
          if (!validation.isValid) {
            onError?.(
              validation.errors.deliverables || "Scope of work is invalid",
            );
          } else {
            onError?.("");
          }
          return validation.isValid;
        },
      }),
      [validation, onError],
    );

    const addDeliverable = () => {
      if (!newItem.trim()) return;
      // Split by new lines and filter out empty lines
      const items = newItem.split("\n").filter((item) => item.trim() !== "");
      const updated = [...deliverables, ...items.map((item) => item.trim())];
      setDeliverables(updated);
      setNewItem("");
      setTouched(true);
      onChange({ deliverables: updated });
    };

    const removeDeliverable = (index: number) => {
      const updated = deliverables.filter((_, i) => i !== index);
      setDeliverables(updated);
      setTouched(true);
      onChange({ deliverables: updated });
    };

    const deliverablesError = touched
      ? validation.errors.deliverables
      : undefined;

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 ">
            <Textarea
              placeholder="Add deliverables"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              disabled={disabled}
              className="min-h-[50px] text-sm resize-y border-slate-300 rounded-md bg-white shadow-2xs"
              rows={4}
            />
            <Button
              type="button"
              onClick={addDeliverable}
              disabled={!newItem.trim() || disabled}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-md shadow-sm transition-colors cursor-pointer ml-auto"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          <ul className="space-y-2 mt-4">
            {deliverables.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <span>{item}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeDeliverable(idx)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {deliverablesError && (
            <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="w-3 h-3" />
              {deliverablesError}
            </p>
          )}
        </div>
      </div>
    );
  },
);

ScopeOfWork.displayName = "ScopeOfWork";
