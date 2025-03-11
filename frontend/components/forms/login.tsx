"use client";

import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Webcam from "react-webcam";
import Image from "next/image";
import html2canvas from "html2canvas";

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

  // Webcam functionality
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const startWebcam = () => {
    setShowWebcam(true);
    setImage(null); // Clear previous image
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
      setShowWebcam(false); // Hide webcam after capturing
    }
  };

  // Add these webcam configurations
  const videoConstraints = {
    width: 200,
    height: 150,
    facingMode: "user"
  };

  const captureElement = async (element: HTMLElement) => {
    const canvas = await html2canvas(element, {
      width: 800, // specify desired width
      height: 600 // specify desired height
    });
    return canvas.toDataURL('image/png');
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

      {/* Webcam Section with Live Preview */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-[200px] h-[150px] bg-gray-100 rounded-md overflow-hidden">
          {showWebcam ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={videoConstraints}
              className="absolute inset-0 w-full h-full object-cover"
              onUserMediaError={(err) => {
                setWebcamError("Failed to access webcam");
                console.error(err);
              }}
              mirrored={true}
            />
          ) : image ? (
            <Image
              src={image}
              width={800}
              height={600}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span>{webcamError || "No image captured"}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!showWebcam ? (
            <Button 
              type="button" 
              onClick={startWebcam}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Open Camera
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={capturePhoto}
              variant="default"
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Capture Photo
            </Button>
          )}
          {image && (
            <Button
              type="button"
              onClick={startWebcam}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                <line x1="18" y1="9" x2="12" y2="15"/>
                <line x1="12" y1="9" x2="18" y2="15"/>
              </svg>
              Retake
            </Button>
          )}
        </div>
      </div>

      <center>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_REACT_APP_SITE_KEY || ""}
          onChange={handleCaptchaChange}
        />
      </center>
      <Button className="w-full" type="submit" disabled={isLoading || !isCaptchaVerified}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
