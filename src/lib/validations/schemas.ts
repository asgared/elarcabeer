import { z } from "zod";

// ---------------------------------------------------------------------------
// Atomic field validators
// ---------------------------------------------------------------------------

export const emailSchema = z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo electrónico válido")
    .transform((v) => v.trim().toLowerCase());

export const passwordSchema = z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres");

export const nameSchema = z
    .string()
    .max(120, "Máximo 120 caracteres")
    .optional()
    .or(z.literal(""));

export const phoneSchema = z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Solo números, +, - y paréntesis")
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal(""));

// ---------------------------------------------------------------------------
// Composite schemas
// ---------------------------------------------------------------------------

export const registerSchema = z
    .object({
        name: nameSchema,
        lastName: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const profileSchema = z
    .object({
        name: nameSchema,
        lastName: nameSchema,
        secondLastName: nameSchema,
        email: emailSchema,
        phone: phoneSchema,
        password: z.string().optional().or(z.literal("")),
        confirmPassword: z.string().optional().or(z.literal("")),
    })
    .refine((d) => !d.password || d.password.length >= 8, {
        message: "La contraseña debe tener al menos 8 caracteres",
        path: ["password"],
    })
    .refine((d) => !d.password || d.password === d.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type ProfileFormData = z.infer<typeof profileSchema>;

export const checkoutSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: emailSchema,
    phone: phoneSchema,
    label: z.string().optional().or(z.literal("")),
    street: z.string().min(1, "La dirección es obligatoria"),
    city: z.string().min(1, "La ciudad es obligatoria"),
    country: z.string().min(1, "El país es obligatorio"),
    postal: z.string().min(1, "El código postal es obligatorio"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
