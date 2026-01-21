export type Role = "buyer" | "supplier";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};
