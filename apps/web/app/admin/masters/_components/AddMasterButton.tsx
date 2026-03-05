"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Button>;

export default function AddMasterButton({ children, className, ...rest }: Props) {
  const classes = cn("gap-2", className);

  return (
    <Button {...rest} className={classes}>
      <UserPlus className="h-4 w-4" />
      {children ?? "Add Master"}
    </Button>
  );
}
