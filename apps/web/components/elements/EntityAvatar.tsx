import { UserCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizes = {
  xs: { container: "h-6 w-6", icon: "h-3 w-3" },
  sm: { container: "h-7 w-7", icon: "h-3.5 w-3.5" },
  md: { container: "h-10 w-10", icon: "h-5 w-5" },
  lg: { container: "h-12 w-12", icon: "h-6 w-6" },
} as const;

export type AvatarSize = keyof typeof sizes;

type EntityAvatarProps = {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
};

export function EntityAvatar({ src, alt, size = "sm", className }: EntityAvatarProps) {
  const s = sizes[size];

  return (
    <Avatar className={cn(s.container, "shrink-0", className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="bg-primary/10 text-primary">
        <UserCircle className={s.icon} />
      </AvatarFallback>
    </Avatar>
  );
}
