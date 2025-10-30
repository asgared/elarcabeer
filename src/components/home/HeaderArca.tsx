"use client";

import {useState, type FormEvent} from "react";
import {FiLogIn} from "react-icons/fi";
import {HiMiniBars3} from "react-icons/hi2";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="border-b border-white/10 bg-muted/40 text-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <button
          type="button"
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-foreground transition hover:bg-muted md:hidden"
          onClick={() => setShowMenu((previous) => !previous)}
          aria-expanded={showMenu}
          aria-controls="header-nav"
        >
          <HiMiniBars3 className="h-5 w-5" />
        </button>

        <p className="text-lg font-semibold">My Website</p>

        <nav
          id="header-nav"
          className="hidden flex-1 items-center justify-end gap-6 text-sm font-medium text-foreground/80 md:flex"
        >
          <a className="transition hover:text-foreground" href="#inicio">
            Home
          </a>
          <a className="transition hover:text-foreground" href="#acerca">
            About
          </a>
          <a className="transition hover:text-foreground" href="#contacto">
            Contact
          </a>
          <LoginDialog />
        </nav>
      </div>

      {showMenu ? (
        <div className="border-t border-white/10 bg-muted/40 px-4 py-4 text-sm text-foreground md:hidden">
          <div className="flex flex-col gap-4">
            <a className="transition hover:text-foreground" href="#inicio" onClick={() => setShowMenu(false)}>
              Home
            </a>
            <a className="transition hover:text-foreground" href="#acerca" onClick={() => setShowMenu(false)}>
              About
            </a>
            <a className="transition hover:text-foreground" href="#contacto" onClick={() => setShowMenu(false)}>
              Contact
            </a>
            <LoginDialog inline onAction={() => setShowMenu(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}

type LoginDialogProps = {
  inline?: boolean;
  onAction?: () => void;
};

function LoginDialog({inline = false, onAction}: LoginDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Integrate with authentication flow
    setOpen(false);
    onAction?.();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value);
      if (!value) {
        onAction?.();
      }
    }}>
      <DialogTrigger asChild>
        {inline ? (
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium transition hover:bg-muted"
            onClick={() => setOpen(true)}
          >
            <FiLogIn className="h-4 w-4" />
            <span>Iniciar sesión</span>
          </button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <FiLogIn className="h-4 w-4" />
            Iniciar sesión
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Login / Sign Up</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales para continuar navegando en El Arca.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="tu@correo.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••" required />
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="submit">Iniciar sesión</Button>
            <Button type="button" variant="ghost">
              Crear cuenta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
