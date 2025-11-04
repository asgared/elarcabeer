"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {User} from "@prisma/client";
import {ColumnDef} from "@tanstack/react-table";
import {ArrowUpDown, CheckCircle, MoreHorizontal, Pencil, Trash2, XCircle} from "lucide-react";

import {ClientEditForm} from "@/components/admin/clients/client-edit-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DropdownMenu} from "@/components/ui/dropdown-menu";
import {useToast} from "@/hooks/use-toast";

function ClientActions({client}: {client: User}) {
  const toast = useToast();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentClient, setCurrentClient] = useState(client);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          typeof errorBody?.error === "string"
            ? errorBody.error
            : "No se pudo eliminar al cliente.";
        throw new Error(message);
      }

      toast({title: "Cliente eliminado", status: "success"});
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar al cliente.";

      toast({
        title: "Error al eliminar",
        description: message,
        status: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const dialogTitle = useMemo(() => {
    const fullName = [currentClient.name, currentClient.lastName].filter(Boolean).join(" ");

    if (fullName) {
      return `Editar cliente: ${fullName}`;
    }

    return `Editar cliente: ${currentClient.email}`;
  }, [currentClient.email, currentClient.lastName, currentClient.name]);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label={`Acciones para ${currentClient.email}`}
            size="icon"
            variant="ghost"
            className="text-white/80 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="min-w-[160px] rounded-lg border border-white/10 bg-background/95 p-1 text-sm text-white shadow-lg backdrop-blur"
            sideOffset={8}
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left transition-colors focus:outline-none data-[highlighted]:bg-white/10 data-[highlighted]:text-white"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-red-200 transition-colors focus:outline-none data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-100"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <ClientEditForm
            client={currentClient}
            onSuccess={(updatedClient) => {
              setCurrentClient(updatedClient);
              setIsEditOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer y eliminará permanentemente al cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const clientColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({column}) => (
      <Button
        variant="ghost"
        className="-ml-3 px-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({row}) => (
      <span className="font-medium text-white">
        {(row.getValue("name") as string | null) ?? "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "lastName",
    header: "Apellido",
    cell: ({row}) => (
      <span className="text-white/80">{(row.getValue("lastName") as string | null) ?? "N/A"}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({row}) => <span className="text-white/80">{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({row}) => {
      const isAdmin = row.getValue("role") === "ADMIN";

      return isAdmin ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          ADMIN
        </div>
      ) : (
        <div className="flex items-center gap-2 text-white/80">
          <XCircle className="h-4 w-4" />
          USER
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <span>Acciones</span>,
    cell: ({row}) => <ClientActions client={row.original} />,
  },
];

export const columns = clientColumns;
