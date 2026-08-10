import { useQuery } from "@tanstack/react-query";
import api from "../../config/config";
import type { Pr010Response } from "./interface";

export const usePr010 = (date: string = "20260724") => {
  return useQuery<Pr010Response, Error>({
    queryKey: ["pr010", date],
    queryFn: async () => {
      const response = await api.get<Pr010Response>(`dashboard/pr010`, {
        params: { date }
      });
      return response.data;
    }
  });
};
