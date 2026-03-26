import * as z from "zod";

export const orderSchema = z.object({
  name: z.string().uuid(),
  amount: z.number().int().min(1),
  ingredients: z.array(z.string()).min(1),
});