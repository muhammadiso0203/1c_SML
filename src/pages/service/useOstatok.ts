import { useQuery } from "@tanstack/react-query";
import api from "../../config/config";
import type { OstatokResponse } from "./interface";



export const useOstatok = (date: string = "20260724") => {
  return useQuery<OstatokResponse, Error>({
    queryKey: ["ostatok", date],
    queryFn: async () => {
      const response = await api.get<OstatokResponse>(`dashboard/pr001`, {
        params: { date }
      });
      return response.data;
    }
  });
};