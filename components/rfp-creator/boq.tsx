/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface BOQProps {
  data: any[];
  onChange: (items: any[]) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  secondaryQuestionId?: number;
}

export const BOQ: React.FC<BOQProps> = ({
  data,
  onChange,
  disabled,
}) => {
  const [items, setItems] = useState<any[]>(
    data?.length > 0
      ? data
      : [
          { itemName: "Premium Gourmet Gift Box", quantity: 500, targetPrice: "₹1,500" },
          { itemName: "Custom Embossed Notebook & Pen Set", quantity: 500, targetPrice: "₹500" },
        ]
  );

  const addItem = () => {
    const updated = [...items, { itemName: "", quantity: 100, targetPrice: "" }];
    setItems(updated);
    onChange(updated);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    onChange(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bill of Quantities (BOQ)</h2>
          <p className="text-xs text-slate-500 mt-0.5">List the items, quantities, and target prices for vendor quotes.</p>
        </div>
        <Button type="button" size="sm" onClick={addItem} disabled={disabled}>
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center">
            <div className="sm:col-span-6">
              <Input
                placeholder="Item Name / Description"
                value={item.itemName}
                onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                disabled={disabled}
                className="h-9 text-xs sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                disabled={disabled}
                className="h-9 text-xs sm:text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Target Price (e.g. ₹1500)"
                value={item.targetPrice}
                onChange={(e) => updateItem(idx, "targetPrice", e.target.value)}
                disabled={disabled}
                className="h-9 text-xs sm:text-sm"
              />
            </div>
            <div className="sm:col-span-1 text-right">
              {!disabled && (
                <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
