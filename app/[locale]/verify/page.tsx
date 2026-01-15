"use client";
import { Suspense } from "react";
import VerifyClient from "@/components/verify/verify";

export default function VerifyPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyClient />;
    </Suspense>
  );
}
