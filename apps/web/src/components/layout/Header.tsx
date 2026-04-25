"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Settings, User } from "lucide-react";

import { dashboardNavigation } from "@/components/layout/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getCurrentSection(pathname: string) {
  return (
    dashboardNavigation.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? dashboardNavigation[0]
  );
}

export function Header() {
  const pathname = usePathname();
  const currentSection = getCurrentSection(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Abrir navegação"
            >
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>AdminDashboard</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dashboardNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {currentSection.label}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            admin.raguiar.pt
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="size-10 rounded-full p-0"
              aria-label="Abrir menu de utilizador"
            >
              <Avatar className="size-8">
                <AvatarFallback>RA</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-sm">Rui Aguiar</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Administrador
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <User className="size-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut className="size-4" />
              Terminar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
