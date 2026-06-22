"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLogin = async (data: LoginValues) => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Login failed");
      setIsLoading(false);
      return;
    }

    // Role-based redirection
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profile?.role === "admin") {
      router.push("/users");
    } else if (profile?.role === "manager") {
      router.push("/dashboard");
    } else {
      router.push("/user-dashboard");
    }
    
    router.refresh();
  };

  const onRegister = async (data: RegisterValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register");
      }

      // Success, the API route has logged us in.
      if (result.role === "admin") {
        router.push("/users");
      } else if (result.role === "manager") {
        router.push("/dashboard");
      } else {
        router.push("/user-dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex w-full mb-6 bg-[#0B0F19]/50 rounded-xl p-1 border border-white/5">
        <button
          onClick={() => { setMode("login"); setError(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "login" 
              ? "bg-white/10 text-white shadow-sm" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode("register"); setError(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "register" 
              ? "bg-white/10 text-white shadow-sm" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Register
        </button>
      </div>

      {mode === "login" ? (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              {...loginForm.register("email")}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 rounded-xl input-glass"
              disabled={isLoading}
            />
            {loginForm.formState.errors.email && (
              <p className="mt-1.5 text-sm text-red-400">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              {...loginForm.register("password")}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl input-glass"
              disabled={isLoading}
            />
            {loginForm.formState.errors.password && (
              <p className="mt-1.5 text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base font-medium btn-primary rounded-xl mt-2" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size={20} className="mr-2" /> : null}
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              {...registerForm.register("name")}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl input-glass"
              disabled={isLoading}
            />
            {registerForm.formState.errors.name && (
              <p className="mt-1.5 text-sm text-red-400">{registerForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              {...registerForm.register("email")}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 rounded-xl input-glass"
              disabled={isLoading}
            />
            {registerForm.formState.errors.email && (
              <p className="mt-1.5 text-sm text-red-400">{registerForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              {...registerForm.register("password")}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl input-glass"
              disabled={isLoading}
            />
            {registerForm.formState.errors.password && (
              <p className="mt-1.5 text-sm text-red-400">{registerForm.formState.errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base font-medium btn-primary rounded-xl mt-2" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size={20} className="mr-2" /> : null}
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      )}
    </div>
  );
}
