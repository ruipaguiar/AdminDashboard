"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Indica um email válido."),
  password: z.string().min(1, "Indica a password."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 350));
    form.setError("root", {
      message: "Não foi possível iniciar sessão com estes dados.",
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            AD
          </div>
          <div className="space-y-1">
            <CardTitle>AdminDashboard</CardTitle>
            <CardDescription>Entra na tua conta para continuar.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          autoComplete="email"
                          className="pl-9"
                          placeholder="ruipaguiar@gmail.com"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          autoComplete="current-password"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root ? (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                <LogIn className="size-4" />
                {form.formState.isSubmitting ? "A entrar..." : "Entrar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
