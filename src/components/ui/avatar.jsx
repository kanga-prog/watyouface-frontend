import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const sizeMap = {
  "2xs": "w-4 h-4",  // 16px (mini)
  xs: "w-6 h-6",    // 24px (petit badge)
  sm: "w-8 h-8",    // 32px (NAVBAR recommandé)
  md: "w-10 h-10",  // 40px (standard)
  lg: "w-12 h-12",  // 48px (cards / profil compact)
  xl: "w-16 h-16",  // 64px (max conseillé, hors “profil géant”)
};

const Avatar = React.forwardRef(({ className, size = "md", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full",
      sizeMap[size] ?? sizeMap.md,
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };