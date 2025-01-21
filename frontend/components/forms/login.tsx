"use client";

import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import ReCAPTCHA from 'react-google-recaptcha';

interface LoginDetails {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDetails>();

  const handleCaptchaChange = (token: string | null) => {
    setIsCaptchaVerified(!!token);
  };

  const onSubmit = async (data: LoginDetails) => {
    if (isLoading || !isCaptchaVerified) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      await login(data.email, data.password);
      router.push("/chat");
    } catch (error: any) {
      setError(error.message || "Login failed");
      recaptchaRef.current?.reset();
      setIsCaptchaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...register("email", { required: "Email is required" })}
          placeholder="m@example.com"
          type="email"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          {...register("password", { required: "Password is required" })}
          type="password"
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <ReCAPTCHA 
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_REACT_APP_SITE_KEY || ''}
        onChange={handleCaptchaChange}
      />
      <Button 
        className="w-full" 
        type="submit" 
        disabled={isLoading || !isCaptchaVerified}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
