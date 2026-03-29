"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User, UserPlus, ArrowLeft, Phone } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/inputs/PasswordInput";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useRegister, useGoogleSignIn } from "@/hooks/useAuth";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { PhoneFormInput, phoneSchemaRequired } from "@/components/inputs/PhoneFormInput";

const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.email("Invalid email address"),
    phone: phoneSchemaRequired,
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();

  const {
    register: formRegister,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useRegister();
  const googleSignIn = useGoogleSignIn();

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      toast.success("Account created successfully!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="relative w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="hover:bg-muted absolute top-4 left-4 rounded-lg p-2 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  {...formRegister("name", {
                    required: "Name is required",
                    maxLength: { value: 100, message: "Name is too long" },
                  })}
                />
              </div>
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...formRegister("email")}
                />
              </div>
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-10 left-3 size-4 -translate-y-1/2" />
                <PhoneFormInput
                  control={control}
                  name="phone"
                  id="phone"
                  label="Phone"
                  placeholder="+972-..."
                  inputClassName="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <PasswordInput
              id="password"
              label="Password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...formRegister("password")}
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              {...formRegister("confirmPassword")}
            />

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Spinner className="mr-2" /> : <UserPlus className="mr-2 size-4" />}
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="border-border w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card text-muted-foreground px-2">Or continue with</span>
            </div>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => googleSignIn.mutate()}
            disabled={googleSignIn.isPending}
          >
            {googleSignIn.isPending ? <Spinner className="mr-2" /> : <GoogleIcon className="mr-2 size-4" />}
            Sign up with Google
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
