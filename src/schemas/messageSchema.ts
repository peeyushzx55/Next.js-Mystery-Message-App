import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(20, { error: "Content must be atleast 20 characters" })
    .max(300, { error: "Content must be atmost 300 characters" }),
});
