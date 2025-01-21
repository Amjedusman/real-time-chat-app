"use client";

import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { useState, useRef } from "react";
import ReCAPTCHA from 'react-google-recaptcha';

interface RegisterDetails {
  username: string;
  email: string;
  password: string;
}


export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDetails>();

  const handleCaptchaChange = (token: string | null) => {
    setIsCaptchaVerified(!!token);
  };

  const onSubmit = async (data: RegisterDetails) => {
    if (isLoading || !isCaptchaVerified) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      await axios.post("/api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      router.push("/chat");
    } catch (error: any) {
      setError(error.response?.data?.error || "Registration failed");
      recaptchaRef.current?.reset();
      setIsCaptchaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          {...register("username", { required: "Username is required" })}
          placeholder="Enter your username"
        />
        {errors.username && (
          <p className="text-red-500">{errors.username.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...register("email", { 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
          placeholder="m@example.com"
          type="email"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          {...register("password", { 
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters"
            }
          })}
          type="password"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}
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
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
