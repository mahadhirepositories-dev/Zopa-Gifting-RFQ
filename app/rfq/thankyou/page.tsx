"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Main Content */}
      <div className="flex-1 bg-white py-16 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
          >
            {/* Header with ZOPA FLUX branding */}
            <div className="bg-blue-600 px-6 py-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500 shadow-md mb-4"
              >
                <CheckCircle className="h-9 w-9 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Logo / Brand Name */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-3 flex items-center justify-center gap-2"
              >
                <Image
                  src="/zopa-logo.svg"
                  alt="ZOPA FLUX Logo"
                  width={160}
                  height={32}
                  priority
                  className="filter brightness-0 invert"
                  onError={(e) => {
                    // Fallback to text if logo image is not found
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-white font-bold text-xl tracking-wider">ZOPA FLUX</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl font-bold text-white tracking-tight"
              >
                Thank You for Your Submission!
              </motion.h1>
            </div>

            {/* Content area */}
            <div className="px-8 py-8 text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-center gap-2 text-emerald-800 font-semibold text-sm"
              >
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Your submission has been received</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-gray-600 text-sm font-mono leading-relaxed"
              >
                We&apos;ll review your information and get back to you soon.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer className="w-full" />
    </div>
  );
}
