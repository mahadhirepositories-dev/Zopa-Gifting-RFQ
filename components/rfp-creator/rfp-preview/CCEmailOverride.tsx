// components/rfp-creator/rfp-preview/CCEmailOverride.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Mail, Info } from "lucide-react";
import { toast } from "react-toastify";

interface CCEmailOverrideProps {
  organizationId: string;
  value?: {
    useOrgDefaults: boolean;
    customEmails: string[];
    enabled: boolean;
  };
  onChange: (value: {
    useOrgDefaults: boolean;
    customEmails: string[];
    enabled: boolean;
  }) => void;
}

export const CCEmailOverride: React.FC<CCEmailOverrideProps> = ({
  organizationId,
  value = { useOrgDefaults: true, customEmails: [], enabled: false },
  onChange,
}) => {
  const [orgDefaults, setOrgDefaults] = useState<{
    ccEmails: string[];
    ccEnabled: boolean;
  }>({ ccEmails: [], ccEnabled: false });
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch organization defaults
  useEffect(() => {
    const fetchOrgDefaults = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/cc-settings`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            setOrgDefaults({ ccEmails: [], ccEnabled: false });
            return;
          }
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch settings: ${response.status}`,
          );
        }
        const data = await response.json();
        setOrgDefaults({
          ccEmails: data.ccEmails || [],
          ccEnabled: data.ccEnabled || false,
        });
      } catch (error) {
        console.error("Error fetching org CC defaults:", error);
        toast.error("Failed to load organization CC settings");
        setOrgDefaults({ ccEmails: [], ccEnabled: false });
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrgDefaults();
    }
  }, [organizationId]);

  const handleToggleEnabled = (checked: boolean) => {
    onChange({
      ...value,
      enabled: checked,
    });
  };

  const handleToggleDefaults = (checked: boolean) => {
    onChange({
      ...value,
      useOrgDefaults: checked,
      customEmails: checked ? [] : value.customEmails,
    });
  };

  const handleAddEmail = () => {
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      toast.warning("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.warning("Please enter a valid email address");
      return;
    }

    if (value.customEmails.includes(trimmedEmail)) {
      toast.warning("This email is already in the list");
      return;
    }

    onChange({
      ...value,
      customEmails: [...value.customEmails, trimmedEmail],
    });
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    onChange({
      ...value,
      customEmails: value.customEmails.filter(
        (email) => email !== emailToRemove,
      ),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if org has no CC emails configured and feature is disabled
  if (!orgDefaults.ccEnabled && orgDefaults.ccEmails.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              CC Email Recipients
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="cc-enabled-rfp" className="text-sm font-medium">
              Enable for this RFP
            </Label>
            <Switch
              id="cc-enabled-rfp"
              checked={value.enabled}
              onCheckedChange={handleToggleEnabled}
            />
          </div>
        </div>

        {value.enabled && (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                CC recipients will receive copies of RFP and vendor submission
                emails
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Switch
                  id="use-org-defaults"
                  checked={value.useOrgDefaults}
                  onCheckedChange={handleToggleDefaults}
                />
                <Label
                  htmlFor="use-org-defaults"
                  className="text-sm font-medium"
                >
                  Use Organization Defaults
                </Label>
              </div>
              {value.useOrgDefaults && (
                <Badge variant="secondary">
                  {orgDefaults.ccEmails.length} email(s)
                </Badge>
              )}
            </div>

            {value.useOrgDefaults && orgDefaults.ccEmails.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Organization Default Recipients
                </Label>
                <div className="border rounded-lg divide-y bg-gray-50">
                  {orgDefaults.ccEmails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 text-sm"
                    >
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{email}</span>
                      <Badge variant="outline" className="ml-auto">
                        Default
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!value.useOrgDefaults && (
              <div className="space-y-3">
                <Label className="text-sm">
                  Custom CC Recipients for this RFP
                </Label>

                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={handleAddEmail} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {value.customEmails.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {value.customEmails.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-6 text-center text-gray-500 text-sm">
                    No custom CC emails added. Add emails above.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
