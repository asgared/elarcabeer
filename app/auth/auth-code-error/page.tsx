import Link from "next/link";

export default function AuthCodeErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-amber-50">
            <div className="max-w-md w-full space-y-8 text-center p-8 bg-neutral-900 rounded-lg border border-amber-900/30">
                <h2 className="mt-6 text-3xl font-serif font-bold text-amber-500">
                    Error de Autenticación
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                    Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo.
                </p>
                <div className="mt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-colors"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
