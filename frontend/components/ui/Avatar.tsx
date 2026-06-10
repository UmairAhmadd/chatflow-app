"use client";

import Image from "next/image";
import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = 40, online, className }: AvatarProps) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <Image
          src={src}
          alt={name || "avatar"}
          width={size}
          height={size}
          className={cn("rounded-full object-cover", className)}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-accent/20 text-accent font-medium",
            className
          )}
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
            online ? "bg-green-500" : "bg-gray-300"
          )}
        />
      )}
    </div>
  );
}
