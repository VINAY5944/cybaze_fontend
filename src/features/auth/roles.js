export const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toUpperCase() : "";

export const isCustomerRole = (role) =>
  ["CUSTOMER", "USER"].includes(normalizeRole(role));
