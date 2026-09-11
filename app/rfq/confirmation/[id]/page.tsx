/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Plus, Eye, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;
  const { data: session, isPending: authLoading } = useSession();
  const [storedOrgSlug, setStoredOrgSlug] = useState<string | undefined>("");

  const isLoggedIn = useMemo(() => {
    return !authLoading && !!session?.user;
  }, [authLoading, session?.user]);

  const activeOrgId = (session?.session as any)?.activeOrganizationId;

  useEffect(() => {
    async function fetchOrgSlug() {
      if (!activeOrgId || storedOrgSlug) return;

      try {
        const response = await fetch(
          `/api/organizations/${activeOrgId}`,
        );
        if (response.ok) {
          const orgData = await response.json();
          if (orgData?.slug) {
            setStoredOrgSlug(orgData.slug);
          }
        }
      } catch (error) {
        console.error("Error fetching organization slug:", error);
      }
    }

    if (isLoggedIn && !authLoading) {
      fetchOrgSlug();
    }
  }, [activeOrgId, isLoggedIn, authLoading, storedOrgSlug]);

  const role = useMemo(() => {
    return (session?.user as any)?.role || null;
  }, [session?.user]);

  const handleCreateNewRfp = () => {
    const newRfpId = window.crypto.randomUUID();
    router.push(`/rfq/${newRfpId}/requirement`);
  };

  const handleViewRfp = () => {
    if (rfpId) {
      router.push(`/rfq/${rfpId}/requirement`);
    } else {
      router.push("/");
    }
  };

  const handleGoToDashboard = () => {
    const pathRole = role?.includes("_")
      ? role.replace(/_/g, "-")
      : role || "user";
    if (storedOrgSlug) {
      router.push(`/${storedOrgSlug}/${pathRole}/dashboard`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main Content */}
      <div className="flex-1 py-12 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200"
          >
            {/* Header with ZOPA FLUX branding */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500 shadow-lg mb-4"
              >
                <CheckCircle className="h-9 w-9 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* ZOPA FLUX Logo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-3"
              >
                <Image
                  src="/zopa-logo.svg"
                  alt="ZOPA FLUX Logo"
                  width={160}
                  height={36}
                  priority
                  className="mx-auto filter brightness-0 invert"
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
              >
                Thank You for Your Submission!
              </motion.h1>
            </div>

            {/* Content area */}
            <div className="px-6 py-8 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"
              >
                <p className="text-emerald-800 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  Your RFQ request has been successfully submitted
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-slate-600 text-sm text-center leading-relaxed"
              >
                Notification emails will be sent to vendors shortly. They will
                be invited to review the RFQ and submit their quotations in
                response.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
              >
                <Button
                  onClick={handleCreateNewRfp}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-5 py-2.5 h-10 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Create New RFQ
                </Button>

                <Button
                  onClick={handleViewRfp}
                  variant="outline"
                  className="w-full sm:w-auto border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs uppercase px-5 py-2.5 h-10 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Eye className="h-4 w-4" />
                  View RFQ
                </Button>

                {storedOrgSlug && (
                  <Button
                    onClick={handleGoToDashboard}
                    variant="ghost"
                    className="w-full sm:w-auto text-slate-600 hover:bg-slate-100 font-semibold text-xs uppercase px-4 py-2.5 h-10 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-500" />
                    Dashboard
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
