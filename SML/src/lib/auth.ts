const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const logoutUser = () => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("login_time");
};

export const checkAuth = (): boolean => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const loginTimeStr = localStorage.getItem("login_time");

  if (!isAuthenticated || !loginTimeStr) {
    logoutUser();
    return false;
  }

  const loginTime = parseInt(loginTimeStr, 10);
  const now = Date.now();

  // If more than 24 hours have passed since login
  if (isNaN(loginTime) || now - loginTime > ONE_DAY_MS) {
    logoutUser();
    return false;
  }

  return true;
};

export const setAuthSession = (username: string, token: string) => {
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("user", username);
  localStorage.setItem("auth_token", token);
  localStorage.setItem("login_time", Date.now().toString());
};
