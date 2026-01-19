import { z } from "zod"

export const registerSchema = z.object({ name:z.string(), email:z.string().email(), password:z.string().min(6) })
export const loginSchema = z.object({ email:z.string().email(), password:z.string() })
export const transactionSchema = z.object({ amount:z.number(), type:z.enum(["income","expense"]), category_id:z.number(), description:z.string().optional() })
