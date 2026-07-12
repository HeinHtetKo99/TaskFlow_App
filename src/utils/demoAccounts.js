export const DEMO_ACCOUNTS = [
  {
    id: "admin",
    role: "Admin",
    description: "Full access — invite, create, assign, and manage tasks.",
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || "",
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    id: "member",
    role: "Member",
    description: "View the board and move tasks between columns.",
    email: import.meta.env.VITE_DEMO_MEMBER_EMAIL || "",
    password: import.meta.env.VITE_DEMO_MEMBER_PASSWORD || "",
    accent: "from-sky-500 to-indigo-500",
  },
];

export function demoAccountsConfigured() {
  return DEMO_ACCOUNTS.every((a) => a.email && a.password);
}
