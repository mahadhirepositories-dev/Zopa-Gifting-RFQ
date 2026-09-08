/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Gift, Package, Layers } from "lucide-react";

interface CategoryProps {
  selection: any;
  handleUpdateSelection: (newSelection: any) => void;
  navigateTo: (section: string) => void;
}

export const Category: React.FC<CategoryProps> = ({
  selection,
  handleUpdateSelection,
  navigateTo,
}) => {
  const categories = [
    { id: "festive", name: "Festive Hampers", icon: Gift, desc: "Diwali, New Year, & Celebratory Gift Hampers" },
    { id: "boxes", name: "Corporate Gift Boxes", icon: Package, desc: "Custom Branded Gift Boxes for Employees & Clients" },
    { id: "merch", name: "Custom Merchandise", icon: Layers, desc: "Apparel, Tech Gadgets, Drinkware, & Stationery" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select Gifting Category</h2>
        <p className="text-xs text-slate-500 mt-1">Choose the category of corporate gifts you are requesting quotes for.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selection?.category === cat.name;

          return (
            <div
              key={cat.id}
              onClick={() => {
                handleUpdateSelection({ category: cat.name });
                navigateTo("requirement");
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
