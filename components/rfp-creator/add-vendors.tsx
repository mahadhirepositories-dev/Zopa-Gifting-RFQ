/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Trash2 } from "lucide-react";

interface VendorContactsProps {
  data: any[];
  onChange: (vendorContacts: any[]) => void;
  errors: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  disabled?: boolean;
  rfpId?: string | null;
  orgSlug?: string;
}

export const VendorContacts: React.FC<VendorContactsProps> = ({
  data,
  onChange,
  disabled,
}) => {
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [contacts, setContacts] = useState<any[]>(data || []);

  const addVendor = () => {
    if (!vendorEmail.trim()) return;
    const newVendor = { email: vendorEmail.trim(), name: vendorName.trim() || "Vendor" };
    const updated = [...contacts, newVendor];
    setContacts(updated);
    setVendorEmail("");
    setVendorName("");
    onChange(updated);
  };

  const removeVendor = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Add Specific Vendor Contacts</h2>
        <p className="text-xs text-slate-500 mt-0.5">Invite specific vendor emails to receive and bid on this RFQ.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="sm:col-span-5">
          <Input
            placeholder="Vendor Company Name"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            disabled={disabled}
            className="h-9 text-xs sm:text-sm bg-white"
          />
        </div>
        <div className="sm:col-span-5">
          <Input
            type="email"
            placeholder="Vendor Email Address"
            value={vendorEmail}
            onChange={(e) => setVendorEmail(e.target.value)}
            disabled={disabled}
            className="h-9 text-xs sm:text-sm bg-white"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="button" onClick={addVendor} disabled={disabled} className="w-full h-9 text-xs font-bold">
            <UserPlus className="w-4 h-4 mr-1" /> Invite
          </Button>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Invited Vendors ({contacts.length})</h3>
          <div className="grid grid-cols-1 gap-2">
            {contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900">{c.name}</span>
                  <span className="text-slate-400">({c.email})</span>
                </div>
                {!disabled && (
                  <button type="button" onClick={() => removeVendor(idx)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
