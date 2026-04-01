type StoredAuthUser = {
  user?: {
    role?: unknown;
  };
};

export const readStoredAuthUser = (): StoredAuthUser | null => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
};

export const isStoredUserAdmin = (): boolean => {
  const auth = readStoredAuthUser();
  return auth?.user?.role === "admin";
};
