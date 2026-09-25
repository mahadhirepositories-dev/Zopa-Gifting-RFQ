"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      const errorDesc = params.get("error_description");
      if (errorParam) {
        if (errorParam === "INVALID_TOKEN") {
          toast.error("This magic link has expired or has already been used. Please request a new one.");
        } else {
          toast.error(errorDesc || `Login failed: ${errorParam}`);
        }
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    
    try {
      const { data, error } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/admin",
        errorCallbackURL: "/admin/login",
      });
      if (error) {
        toast.error(error.message || "Failed to send magic link");
      } else {
        toast.success("Magic link sent! Please check your email.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">ZOPA Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-2">Log in with your administrator email</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@zopapro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Send Magic Link
          </Button>
        </form>
      </div>
    </div>
  );
}
