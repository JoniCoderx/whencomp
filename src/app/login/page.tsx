import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="pt-6">
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
