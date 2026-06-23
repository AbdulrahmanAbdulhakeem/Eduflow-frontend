import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['LECTURER', 'STUDENT']),
  level: z.number().optional().nullable(),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;

export interface APIUser {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  level: number | null;
  createdAt: string;
}