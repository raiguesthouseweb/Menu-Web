import { Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return <Building className={cn("h-6 w-6 text-primary", className)} />;
}
