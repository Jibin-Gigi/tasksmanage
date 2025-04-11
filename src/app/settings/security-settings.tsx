"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function SecuritySettings() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    special: false,
    capital: false,
  });

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      capital: /[A-Z]/.test(password),
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    const { length, number, special, capital } = passwordStrength;
    if (!(length && number && special && capital)) {
      setError("Password doesn't meet strength requirements");
      return;
    }

    try {
      setLoading(true);

      // First verify current password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect");
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Clear form and show success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password updated successfully!");
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-violet-400" />
          <h2 className="text-2xl font-bold text-violet-100">Password Settings</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded p-4 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-violet-200 mb-2">
              Current Password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-violet-950/50 border-violet-500/30 text-violet-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-violet-200 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (!hasStartedTyping && e.target.value) setHasStartedTyping(true);
                checkPasswordStrength(e.target.value);
              }}
              className="bg-violet-950/50 border-violet-500/30 text-violet-100"
              required
            />
            {hasStartedTyping && newPassword && (
              <div className="mt-2 space-y-2">
                {Object.entries(passwordStrength).map(([key, valid]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {valid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={valid ? "text-green-500" : "text-red-500"}>
                      {key === "length" && "At least 8 characters"}
                      {key === "number" && "Contains a number"}
                      {key === "special" && "Contains a special character"}
                      {key === "capital" && "Contains a capital letter"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-violet-200 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-violet-950/50 border-violet-500/30 text-violet-100"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
