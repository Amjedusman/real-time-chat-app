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
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDetails>();

  const handleCaptchaChange = (token: string | null) => {
    setIsCaptchaVerified(!!token);
  };

  // Verify the image by sending it to the Flask endpoint.
  // This function now returns the recognized face's name.
  const verifyImage = async (imageSrc: string) => {
    try {
      const response = await fetch("http://localhost:5000/face-recognizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageSrc }),
      });
      const data = await response.json();
      return data.name; // Expecting the backend to return { "name": "<recognized_name>" }
    } catch (error) {
      console.error("Image verification failed:", error);
      return null;
    }
  };

  const onSubmit = async (data: LoginDetails) => {
    if (isLoading || !isCaptchaVerified || !image) return;

    setIsLoading(true);
    setError("");

    // Get recognized name from face-recognizer endpoint
    const recognizedName = await verifyImage(image);
    // Check if the recognized name matches the email provided (from DB, name field is the email)
    if (!recognizedName || recognizedName !== data.email) {
      setError("Face verification failed: provided email does not match recognized face.");
      setIsLoading(false);
      return;
    }

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

  const startWebcam = () => {
    setShowWebcam(true);
    setImage(null);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
      setShowWebcam(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input {...register("email", { required: "Email is required" })} placeholder="m@example.com" type="email" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input {...register("password", { required: "Password is required" })} type="password" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="flex flex-col items-center space-y-4">
        {showWebcam ? (
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/png" />
        ) : image ? (
          <Image src={image} width={200} height={150} alt="Captured" />
        ) : (
          <p>No image captured</p>
        )}
        <div className="flex gap-2">
          {!showWebcam ? (
            <Button type="button" onClick={startWebcam} variant="outline">
              Open Camera
            </Button>
          ) : (
            <Button type="button" onClick={capturePhoto} variant="default">
              Capture Photo
            </Button>
          )}
        </div>
      </div>
      <center>
        <ReCAPTCHA ref={recaptchaRef} sitekey={process.env.NEXT_PUBLIC_REACT_APP_SITE_KEY || ""} onChange={handleCaptchaChange} />
      </center>
      <Button className="w-full" type="submit" disabled={isLoading || !isCaptchaVerified || !image}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
