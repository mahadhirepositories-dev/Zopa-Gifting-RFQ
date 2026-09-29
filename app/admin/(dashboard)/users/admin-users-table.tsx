/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Shield, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  createdAt?: Date | string | null;
}

interface AdminUsersTableProps {
  admins: AdminUser[];
}

export function AdminUsersTable({ admins }: AdminUsersTableProps) {
  const router = useRouter();

  // Edit state
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditName(admin.name || "");
    setEditEmail(admin.email || "");
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Please fill in both name and email.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: editingAdmin.id,
          name: editName.trim(),
          email: editEmail.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update admin user");
      }

      toast.success("Admin user updated successfully.");
      setEditingAdmin(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update admin user.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(deletingAdmin.id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete admin user");
      }

      toast.success("Admin user deleted successfully.");
      setDeletingAdmin(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete admin user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[320px]">Admin Name & Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-slate-500 py-10 text-sm"
                >
                  No admin users found.
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const initial = (admin.name || admin.email || "A")
                  .charAt(0)
                  .toUpperCase();
                return (
                  <TableRow key={admin.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarImage
                            src={admin.image || undefined}
                            alt={admin.name}
                          />
                          <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {admin.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {admin.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[11px] font-semibold"
                      >
                        <Shield className="w-3 h-3 text-blue-600" />
                        Administrator
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {admin.createdAt
                        ? format(new Date(admin.createdAt), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(admin)}
                          title="Edit Admin"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingAdmin(admin)}
                          title="Delete Admin"
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Admin Modal */}
      <Dialog
        open={!!editingAdmin}
        onOpenChange={(open) => !open && setEditingAdmin(null)}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Pencil className="w-4 h-4 text-blue-600" />
              Edit Admin User
            </DialogTitle>
            <DialogDescription>
              Update administrator credentials and contact details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateAdmin} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                placeholder="Full Name"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                placeholder="admin@zopapro.com"
                disabled={isUpdating}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingAdmin(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Confirmation Modal */}
      <Dialog
        open={!!deletingAdmin}
        onOpenChange={(open) => !open && setDeletingAdmin(null)}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Admin User
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">
                {deletingAdmin?.name} ({deletingAdmin?.email})
              </strong>{" "}
              from platform administrators? This user will lose all administrative access.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingAdmin(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAdmin}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
