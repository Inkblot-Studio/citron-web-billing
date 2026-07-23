/** Shared session types — safe to import from client components. */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  workspace?: string;
};
