/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { isWorkEmail } from "@/lib/validations/work-email";

export default function ZopaGiftingRFQPage() {
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [regForm, setRegForm] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    addressLine1: string;
    addressLine2: string;
    country: string[];
    state: string[];
    city: string[];
    postalCode: string;
    agreeTerms: boolean;
  }>({
    name: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    country: ["India"],
    state: [],
    city: [],
    postalCode: "",
    agreeTerms: true,
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [magicLinkState, setMagicLinkState] = useState<{
    sent: boolean;
    email: string;
    demoUrl?: string;
  }>({
    sent: false,
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const rfqSteps = [
    {
      stepNumber: "1",
      title: "Create RFQ",
      description:
        "Create your gifting requirement with the required items, quantities, and specifications.",
      badge: "Step 1",
    },
    {
      stepNumber: "2",
      title: "Receive Samples",
      description: "Receive product samples from vendors to evaluate quality and suitability.",
      badge: "Step 2",
    },
    {
      stepNumber: "3",
      title: "Compare Quotes",
      description:
        "Vendors submit their quotes. Compare the responses in one place.",
      badge: "Step 3",
    },
    {
      stepNumber: "4",
      title: "Approve Vendors",
      description:
        "Review the comparative quotes and approve the best vendors based on your requirement.",
      badge: "Step 4",
    },
  ];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (
      !regForm.name ||
      !regForm.email ||
      !regForm.phoneNumber ||
      !regForm.companyName
    ) {
      setFeedback({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    if (!isWorkEmail(regForm.email)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid work email address. Personal email domains (Gmail, Yahoo, Outlook, etc.) are not allowed.",
      });
      return;
    }

    if (!regForm.agreeTerms) {
      setFeedback({
        type: "error",
        message: "You must accept the Terms of Service to proceed.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isAlreadyRegistered) {
          setLoginEmail(regForm.email);
        }
        throw new Error(
          data.error ||
            "This email is already registered. Please log in to continue.",
        );
      }

      const targetUrl =
        data.redirectUrl ||
        data.magicLinkUrl ||
        "/";

      window.location.href = targetUrl;
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "An unexpected error occurred.",
      });
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!loginEmail) {
      setFeedback({
        type: "error",
        message: "Please enter your Work Email address.",
      });
      return;
    }

    if (!isWorkEmail(loginEmail)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid work email address. Personal email domains (Gmail, Yahoo, Outlook, etc.) are not allowed.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isNotRegistered) {
          setRegForm((prev) => ({ ...prev, email: loginEmail }));
        }
        throw new Error(
          data.error ||
            "This email is not registered. Please register first to continue.",
        );
      }

      const targetUrl =
        data.redirectUrl ||
        data.magicLinkUrl ||
        "/";

      window.location.href = targetUrl;
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "An unexpected error occurred.",
      });
      setIsSubmitting(false);
    }
  };

  const resetMagicLink = () => {
    setMagicLinkState({ sent: false, email: "" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative overflow-hidden text-gray-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-100/30 rounded-full blur-2xl" />
      </div>

      <LoginForm
        authMode={authMode}
        setAuthMode={setAuthMode}
        regForm={regForm}
        setRegForm={setRegForm}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        magicLinkState={magicLinkState}
        setMagicLinkState={setMagicLinkState}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        feedback={feedback}
        setFeedback={setFeedback}
        rfqSteps={rfqSteps}
        handleRegisterSubmit={handleRegisterSubmit}
        handleLoginSubmit={handleLoginSubmit}
        resetMagicLink={resetMagicLink}
      />
    </div>
  );
}
