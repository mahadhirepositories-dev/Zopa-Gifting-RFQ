/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import { CountrySelect } from "./multi-select/country-selection";
import { StateSelect } from "./multi-select/state-selection";
import { CitySelect } from "./multi-select/city-selection";
import { CustomPhoneInput } from "./ui/phone-input";
import { registerSchema, loginSchema } from "@/lib/validations/reg-schema";

interface RegisterFormState {
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
}

type RegisterFieldErrors = Partial<Record<keyof RegisterFormState, string>>;

interface LoginFormProps {
  authMode: "register" | "login";
  setAuthMode: (mode: "register" | "login") => void;
  regForm: RegisterFormState;
  setRegForm: (form: any) => void;
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  magicLinkState: {
    sent: boolean;
    email: string;
    demoUrl?: string;
  };
  setMagicLinkState: (state: any) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  feedback: {
    type: "success" | "error";
    message: string;
  } | null;
  setFeedback: (feedback: any) => void;
  rfqSteps: Array<{
    stepNumber: string;
    title: string;
    description: string;
    badge: string;
  }>;
  handleRegisterSubmit: (e: React.FormEvent) => Promise<void>;
  handleLoginSubmit: (e: React.FormEvent) => Promise<void>;
  resetMagicLink: () => void;
}

export const LoginForm = ({
  authMode,
  setAuthMode,
  regForm,
  setRegForm,
  loginEmail,
  setLoginEmail,
  magicLinkState,
  isSubmitting,
  feedback,
  setFeedback,
  rfqSteps,
  handleRegisterSubmit,
  handleLoginSubmit,
  resetMagicLink,
}: LoginFormProps) => {
  // Country calling code for the phone input (independent of the address country)
  const [phoneCountryCode, setPhoneCountryCode] = useState("IN");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  const clearFieldError = (field: keyof RegisterFormState) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateRegForm = (patch: Partial<RegisterFormState>) => {
    setRegForm({ ...regForm, ...patch });
    (Object.keys(patch) as (keyof RegisterFormState)[]).forEach(
      clearFieldError,
    );
  };

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse({
      ...regForm,
      phoneCountryCode,
    });

    if (!result.success) {
      const errors: RegisterFieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterFormState;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    await handleRegisterSubmit(e);
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email: loginEmail });
    if (!result.success) {
      setLoginError(result.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }

    setLoginError(null);
    await handleLoginSubmit(e);
  };

  return (
    <div className="relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* Logo & Headline */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Image
                src="/zopa-logo.svg"
                alt="ZOPA Logo"
                width={200}
                height={55}
                priority
                className="h-11 w-auto"
              />
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                Gifting RFQ Portal
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.15] tracking-tight">
              How{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                ZOPA Gifting RFQ
              </span>{" "}
              Works
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Streamline corporate gifting procurement in 4 simple steps. Create
              your requirements, share with approved vendors, compare
              competitive bids, and select the lowest (L1) vendor effortlessly.
            </p>
          </div>

          {/* 4 Core Workflow Step Cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase text-blue-800 tracking-wider">
              Step-by-Step RFQ Workflow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rfqSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/90 shadow-sm hover:shadow-md hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {step.stepNumber}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-extrabold px-2 py-0.5"
                    >
                      {step.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Gifting Category Showcase Images */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase text-blue-800 tracking-wider">
              Popular Corporate Gifting Categories
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative h-24 rounded-2xl overflow-hidden shadow-sm border border-white/80 group">
                <Image
                  src="/images/gifting/festive-hamper.jpg"
                  alt="Festive corporate gift hamper"
                  fill
                  sizes="250px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-2 left-2.5 text-white text-[11px] font-bold drop-shadow-md">
                  Festive Hampers
                </span>
              </div>

              <div className="relative h-24 rounded-2xl overflow-hidden shadow-sm border border-white/80 group">
                <Image
                  src="/images/gifting/corporate-gift-box.jpg"
                  alt="Corporate gift box"
                  fill
                  sizes="250px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-2 left-2.5 text-white text-[11px] font-bold drop-shadow-md">
                  Gift Boxes
                </span>
              </div>

              <div className="relative h-24 rounded-2xl overflow-hidden shadow-sm border border-white/80 group">
                <Image
                  src="/images/gifting/custom-merchandise.jpg"
                  alt="Custom branded merchandise"
                  fill
                  sizes="250px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-2 left-2.5 text-white text-[11px] font-bold drop-shadow-md">
                  Custom Merch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Passwordless Registration / Login Card */}
        <div className="lg:col-span-5 w-full">
          <Card className="border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">
                {authMode === "register"
                  ? "Create RFQ Account"
                  : "Sign In to Workspace"}
              </CardTitle>
              <CardDescription className="text-sm">
                {authMode === "register"
                  ? "Register your details to receive a Better Auth Magic Link."
                  : "Enter your work email address to receive your sign-in Magic Link."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {magicLinkState.sent ? (
                /* MAGIC LINK CONFIRMATION VIEW */
                <div className="text-center py-6 space-y-6">
                  <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center border border-blue-200 shadow-inner">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>

                  <div>
                 
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      Check your inbox!
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      We&apos;ve dispatched a secure Magic Link to:
                    </p>
                    <div className="mt-2 text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-50 py-2 px-4 rounded-xl inline-block border border-blue-200">
                      {magicLinkState.email}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed px-2">
                    Click the link in your email to log in and manage your ZOPA
                    Gifting RFQs. The link will expire in 10 minutes.
                  </p>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={resetMagicLink}
                    className="w-full text-xs font-bold"
                  >
                    Use a different email address
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Auth Mode Tabs */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setFeedback(null);
                      }}
                      className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        authMode === "register"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setFeedback(null);
                      }}
                      className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        authMode === "login"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Log In
                    </button>
                  </div>

                  {/* Feedback Banner */}
                  {feedback && (
                    <div
                      className={`mb-4 p-3 rounded-2xl text-xs sm:text-sm flex items-start space-x-2 border ${
                        feedback.type === "success"
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      }`}
                    >
                      <span className="font-medium leading-snug">
                        {feedback.message}
                      </span>
                    </div>
                  )}

                  {authMode === "register" ? (
                    /* REGISTRATION FORM */
                    <form
                      onSubmit={onRegisterSubmit}
                      className="space-y-4"
                      noValidate
                    >
                      {/* Row 1: Company Name & Full Name */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">
                            Company Name{" "}
                            <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            placeholder="Acme Corp"
                            value={regForm.companyName}
                            onChange={(e) =>
                              updateRegForm({ companyName: e.target.value })
                            }
                            className={`h-9 text-sm ${
                              fieldErrors.companyName ? "border-rose-400" : ""
                            }`}
                          />
                          {fieldErrors.companyName && (
                            <p className="text-xs text-rose-600">
                              {fieldErrors.companyName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">
                            Full Name <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={regForm.name}
                            onChange={(e) =>
                              updateRegForm({ name: e.target.value })
                            }
                            className={`h-9 text-sm ${
                              fieldErrors.name ? "border-rose-400" : ""
                            }`}
                          />
                          {fieldErrors.name && (
                            <p className="text-xs text-rose-600">
                              {fieldErrors.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Work Email & Phone */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">
                            Work Email <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            type="email"
                            placeholder="john@company.com"
                            value={regForm.email}
                            onChange={(e) =>
                              updateRegForm({ email: e.target.value })
                            }
                            className={`h-9 text-sm ${
                              fieldErrors.email ? "border-rose-400" : ""
                            }`}
                          />
                          {fieldErrors.email && (
                            <p className="text-xs text-rose-600">
                              {fieldErrors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <CustomPhoneInput
                            label="Phone Number"
                            value={regForm.phoneNumber}
                            onChange={(val) =>
                              updateRegForm({ phoneNumber: val })
                            }
                            countryCode={phoneCountryCode}
                            onCountryChange={setPhoneCountryCode}
                            required
                            error={fieldErrors.phoneNumber}
                          />
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                              Address Line 1{" "}
                              <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                              type="text"
                              placeholder="123 Main St"
                              value={regForm.addressLine1}
                              onChange={(e) =>
                                updateRegForm({ addressLine1: e.target.value })
                              }
                              className={`h-9 text-sm ${
                                fieldErrors.addressLine1
                                  ? "border-rose-400"
                                  : ""
                              }`}
                            />
                            {fieldErrors.addressLine1 && (
                              <p className="text-xs text-rose-600">
                                {fieldErrors.addressLine1}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                              Address Line 2
                            </Label>
                            <Input
                              type="text"
                              placeholder="Suite 100"
                              value={regForm.addressLine2}
                              onChange={(e) =>
                                updateRegForm({ addressLine2: e.target.value })
                              }
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>

                        {/* Country, State, City, Postal Code */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <CountrySelect
                              value={regForm.country}
                              onChange={(vals) => {
                                updateRegForm({
                                  country: vals,
                                  state: [],
                                  city: [],
                                });
                              }}
                              required
                            />
                            {fieldErrors.country && (
                              <p className="text-xs text-rose-600">
                                {fieldErrors.country}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <StateSelect
                              countryNames={regForm.country}
                              value={regForm.state}
                              onChange={(vals) => {
                                updateRegForm({ state: vals, city: [] });
                              }}
                              required
                            />
                            {fieldErrors.state && (
                              <p className="text-xs text-rose-600">
                                {fieldErrors.state}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <CitySelect
                              countryNames={regForm.country}
                              stateNames={regForm.state}
                              value={regForm.city}
                              onChange={(vals) => {
                                updateRegForm({ city: vals });
                              }}
                              required
                            />
                            {fieldErrors.city && (
                              <p className="text-xs text-rose-600">
                                {fieldErrors.city}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                              Postal Code{" "}
                              <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                              type="text"
                              placeholder="12345"
                              value={regForm.postalCode}
                              onChange={(e) =>
                                updateRegForm({ postalCode: e.target.value })
                              }
                              className={`h-9 text-sm ${
                                fieldErrors.postalCode ? "border-rose-400" : ""
                              }`}
                            />
                            {fieldErrors.postalCode && (
                              <p className="text-xs text-rose-600">
                                {fieldErrors.postalCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Terms & Submit */}
                      <div>
                        <div className="flex items-start space-x-2 pt-1">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={regForm.agreeTerms}
                            onChange={(e) =>
                              updateRegForm({ agreeTerms: e.target.checked })
                            }
                            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <label
                            htmlFor="terms"
                            className="text-xs text-gray-600"
                          >
                            I accept ZOPA&apos;s{" "}
                            <a
                              href="#"
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              Terms of Service
                            </a>{" "}
                            &{" "}
                            <a
                              href="#"
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              Privacy Policy
                            </a>
                            .
                          </label>
                        </div>
                        {fieldErrors.agreeTerms && (
                          <p className="text-xs text-rose-600 mt-1">
                            {fieldErrors.agreeTerms}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>Generating Magic Link...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />

                            <span>Send Magic Link to Register</span>
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    /* LOGIN FORM */
                    <form
                      onSubmit={onLoginSubmit}
                      className="space-y-4"
                      noValidate
                    >
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (loginError) setLoginError(null);
                          }}
                          className={`h-10 ${
                            loginError ? "border-rose-400" : ""
                          }`}
                        />
                        {loginError && (
                          <p className="text-xs text-rose-600">{loginError}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>Generating Magic Link...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            <span>Send Magic Link to Log In</span>
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
