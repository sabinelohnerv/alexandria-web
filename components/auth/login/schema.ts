import { z } from "zod";

export const Schema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type FormData = z.infer<typeof Schema>;
