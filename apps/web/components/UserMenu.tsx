"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { LogOut, User, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useAuth";

export function UserMenu() {
  const { data: session, status } = useSession();
  const logoutMutation = useLogout();
  const [imgError, setImgError] = useState(false);

  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex gap-2 p-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href="/signup">Sign Up</Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const callbackUrl = typeof window !== "undefined" ? window.location.pathname : "/login";

  const user = session.user;
  const isAdmin = (user as any).role === "ADMIN";
  const accountPath = isAdmin ? "/admin" : "/client";
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
          {user.image && !imgError ? (
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="size-7 rounded-full"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-medium">
              {initials}
            </div>
          )}
          <div className="flex flex-col items-start text-left text-xs">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground">{user.email}</span>
          </div>
          {isAdmin && <Shield className="text-primary ml-auto size-3.5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuItem asChild>
          <Link href={accountPath} className="flex items-center gap-2">
            <User className="size-4" />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate(callbackUrl)}
          className="text-destructive focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
