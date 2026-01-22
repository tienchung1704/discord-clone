"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import LightRays from "@/components/lightray";

export default function VerifyClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const success = searchParams?.get("success");
        const userId = searchParams?.get("userId");

        if (success === "true" && userId) {
            axios
                .post("/api/verify-payment", { userId })
                .then(() => {
                    setTimeout(() => {
                    toast.success("Payment successful!");
                    router.push("/");
                    }, 4500);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Payment failed!");
                });
        } else {
            toast.info("Payment canceled");
            router.push("/");
        }
    }, [searchParams, router]);

    return (
            <LightRays raysOrigin="top-center"
                raysColor="#00ffff"
                raysSpeed={1.5}
                lightSpread={0.8}
                rayLength={1.2}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.1}
                distortion={0.05}
                className="custom-rays" />
    )
}