import { email, z } from "zod";

export const usernameValidation = z
  .string()
  .min(5, "Username must be atleast 5 characters")
  .max(20, "Username must be atmost 20 characters")
  .regex(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim, "Invalid Username");

export const signupSchema = z.object({
  username: usernameValidation,
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(6, { error: "Password must be atleast 6 characters" }),
});
