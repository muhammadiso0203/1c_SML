import { useMutation } from "@tanstack/react-query";
import api from "@/config/config";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: Record<string, unknown> | null;
}

export const useLogin = () => {
  return useMutation<UserResponse, Error, LoginCredentials>({
    mutationFn: async ({ username, password }) => {
      console.log(api.defaults.baseURL);
      
      const token = btoa(`${username}:${password}`);
      const response = await api.get<UserResponse>("/dashboard/user", {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });
      return response.data;
    },
  });
};
