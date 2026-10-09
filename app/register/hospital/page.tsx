"use client";

import React, { Suspense } from "react";
import RegisterPage from "../page";

export default function RegisterHospitalDirect() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
