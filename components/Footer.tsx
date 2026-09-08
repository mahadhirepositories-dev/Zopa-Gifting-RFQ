// components/Footer.jsx
import { cn } from "@/lib/utils";

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "bg-gray-100 h-[70px] flex flex-col justify-center items-center w-full ",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-700 mb-2">
          Need Assistance? Contact us for support:{" "}
          <a
            href="mailto:flux@zopapro.com"
            className="text-blue-600 hover:underline"
          >
            flux@zopapro.com
          </a>
        </p>
        <p className="text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} ZOPA FLUX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
