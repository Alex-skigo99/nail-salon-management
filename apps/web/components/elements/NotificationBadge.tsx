import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
  isActive: boolean;
};

export function NotificationBadge({ label, isActive }: Props) {
  return (
    <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
      {label}: {isActive ? "ON" : "OFF"}
    </Badge>
  );
}
