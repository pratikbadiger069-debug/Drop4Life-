import Link from "next/link";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <BrandLogo size="lg" showTagline={true} />
      </div>

      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="text-5xl font-extrabold text-red-700">404</span>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          The requested page is unavailable or may be part of an upcoming Drop4Life phase.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="default" className="w-full flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/design-system" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <span>View Design System</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
