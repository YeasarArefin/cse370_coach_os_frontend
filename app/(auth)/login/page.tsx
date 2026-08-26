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
import { BookOpen, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error("Invalid email or password");
      }

      return res;
    },
    onSuccess: () => {
      toast.success("Welcome back!", {
        description: "Logged in successfully.",
      });
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error("Authentication Failed", {
        description: error.message || "Invalid credentials provided.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password) {
      const msg = "Please fill in all fields.";
      setValidationError(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    loginMutation.mutate({ email, password });
  };

  const errorMessage =
    validationError ||
    (loginMutation.isError
      ? loginMutation.error?.message || "Failed to sign in. Please try again."
      : null);

  return (
    <Card className="w-full max-w-md rounded-xl border border-border bg-card p-2 sm:p-4 shadow-none">
      <CardHeader className="flex flex-col items-center gap-3 text-center pb-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
          <BookOpen className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-2xl font-bold tracking-tight text-card-foreground">
            Teacher Sign In
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Access your batches and CoachOS dashboard
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
                disabled={loginMutation.isPending}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loginMutation.isPending}
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2
                  className="animate-spin"
                  data-icon="inline-start"
                />
                Signing in...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have a teacher account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Register as Teacher
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
