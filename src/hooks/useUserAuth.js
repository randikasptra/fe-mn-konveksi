import { useMutation } from "@tanstack/react-query";

/**
 * Mock user auth.
 * valid: user@konveksi.test / password123
 */
function loginFn({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "user@konveksi.test" && password === "password123") {
        resolve({
          token: "mock-user-token-456",
          user: { id: 11, name: "Pelangan Demo", email, role: "customer" },
        });
      } else {
        reject({ message: "Email atau password user salah" });
      }
    }, 700);
  });
}

export default function useUserAuth() {
  const m = useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      sessionStorage.setItem("user_token", data.token);
      sessionStorage.setItem("user_info", JSON.stringify(data.user));
    },
  });

  function logout() {
    sessionStorage.removeItem("user_token");
    sessionStorage.removeItem("user_info");
  }

  function isAuthenticated() {
    return !!sessionStorage.getItem("user_token");
  }

  return {
    login: m.mutate,
    loginAsync: m.mutateAsync,
    isLoading: m.isLoading,
    isError: m.isError,
    error: m.error,
    logout,
    isAuthenticated,
  };
}
