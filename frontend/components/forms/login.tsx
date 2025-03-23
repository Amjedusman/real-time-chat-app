"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import Webcam from "react-webcam";
import Image from "next/image";
import * as faceapi from "face-api.js";

interface LoginDetails {
  email: string;
  password: string;
}

const EAR_THRESHOLD = 0.25;
const BLINK_CONSEC_FRAMES = 2;

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
  const [showBlinkMessage, setShowBlinkMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDetails>();

  const blinkCounterRef = useRef(0);
  const blinkDetectedRef = useRef(false);

  const handleCaptchaChange = (token: string | null) => {
    setIsCaptchaVerified(!!token);
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  const processFrame = useCallback(async () => {
    if (!webcamRef.current || !showWebcam) return;
    const video = webcamRef.current.video;
    if (!video) return;

    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detections && detections.landmarks) {
      const leftEye = detections.landmarks.getLeftEye();
      const vertical1 = Math.hypot(leftEye[1].x - leftEye[5].x, leftEye[1].y - leftEye[5].y);
      const vertical2 = Math.hypot(leftEye[2].x - leftEye[4].x, leftEye[2].y - leftEye[4].y);
      const horizontal = Math.hypot(leftEye[0].x - leftEye[3].x, leftEye[0].y - leftEye[3].y);
      const ear = (vertical1 + vertical2) / (2.0 * horizontal);

      if (ear < EAR_THRESHOLD) {
        blinkCounterRef.current += 1;
      } else {
        if (blinkCounterRef.current >= BLINK_CONSEC_FRAMES) {
          if (!blinkDetectedRef.current) {
            blinkDetectedRef.current = true;
            capturePhoto();
          }
        }
        blinkCounterRef.current = 0;
      }
    }
  }, [showWebcam]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (showWebcam) {
      intervalId = setInterval(processFrame, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [processFrame, showWebcam]);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
      setShowWebcam(false);
      setShowBlinkMessage(false);
    }
  };

  const verifyImage = async (imageSrc: string) => {
    try {
      const response = await fetch("http://localhost:5000/face-recognizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error("Image verification failed:", error);
      return null;
    }
  };

  const onSubmit = async (data: LoginDetails) => {
    if (isLoading || !isCaptchaVerified || !image) return;

    setIsLoading(true);
    setError("");

    const recognizedName = await verifyImage(image);
    if (!recognizedName || recognizedName !== data.email) {
      setError("Face verification failed: Provided email does not match recognized face.");
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
    setShowBlinkMessage(true);
    blinkCounterRef.current = 0;
    blinkDetectedRef.current = false;
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
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              onUserMediaError={() => setError("Failed to access webcam")}
              mirrored={true}
            />
            {showBlinkMessage && <p className="text-blue-500 text-sm">Blink your eyes to capture the image...</p>}
          </>
        ) : image ? (
          <Image src={image} width={200} height={150} alt="Captured" />
        ) : (
          <p>No image captured</p>
        )}
        {!showWebcam && !image && (
          <Button type="button" onClick={startWebcam} variant="outline">
            Open Camera
          </Button>
        )}
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
