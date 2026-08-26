"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import {
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const signupMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create teacher account.");
      }

      // Automatically sign in the teacher after successful signup
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error(
          "Account created successfully, but automatic login failed. Please sign in."
        );
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Account Created!", {
        description: "Welcome to CoachOS Portal.",
      });
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Registration Failed", {
        description: error.message || "Could not register account.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name || !email || !password) {
      const msg = "Please fill in all required fields.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    signupMutation.mutate({ name, email, password });
  };

  const errorMessage =
    validationError ||
    (signupMutation.isError
      ? signupMutation.error?.message || "Failed to register. Please try again."
      : null);

  return (
    <Card className="w-full max-w-md rounded-xl border border-border bg-card p-2 sm:p-4 shadow-none">
      <CardHeader className="flex flex-col items-center gap-3 text-center pb-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
          <BookOpen className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-2xl font-bold tracking-tight text-card-foreground">
            Teacher Registration
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Create an account to manage your coaching batches and students
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {errorMessage && (
            <Alert variant="destructive" className="rounded-xl py-2.5">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Prof. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={signupMutation.isPending}
                className="h-10 rounded-full border-border bg-background/50 pl-10 pr-4 text-sm focus-visible:bg-background"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={signupMutation.isPending}
                className="h-10 rounded-full border-border bg-background/50 pl-10 pr-4 text-sm focus-visible:bg-background"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="•••••••• (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={signupMutation.isPending}
                className="h-10 rounded-full border-border bg-background/50 pl-10 pr-11 text-sm focus-visible:bg-background"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-4 flex w-[calc(100%+1rem)] -mx-2 flex-col gap-4 pt-4 sm:w-[calc(100%+2rem)] sm:-mx-4">
          <Button
            type="submit"
            className="h-10 w-auto rounded-full px-5 font-medium text-sm shadow-none"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <Loader2
                  className="animate-spin"
                  data-icon="inline-start"
                />
                Creating Account...
              </>
            ) : (
              "Create Teacher Account"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
