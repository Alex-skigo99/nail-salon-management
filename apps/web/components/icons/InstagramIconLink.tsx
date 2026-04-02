import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  iconClassName?: string;
};

export default function InstagramIconLink({ className, iconClassName }: Props) {
  return (
    <a
      href="https://www.instagram.com/xena_nails_studio?igsh=MWZubGh2cWFvYWFyNw=="
      target="_blank"
      rel="noopener noreferrer"
      title="Instagram"
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl bg-gray-800 transition-colors hover:bg-pink-500",
        className
      )}
      aria-label="Instagram"
    >
      <Instagram className={cn("size-5", iconClassName)} />
    </a>
  );
}
