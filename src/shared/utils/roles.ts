export const hasRole = (user: any, role: string) => {
  if (!user) return false;
  if (typeof user.role === "string") return user.role === role;
  return user.role?.name === role;
};