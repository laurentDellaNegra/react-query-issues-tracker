import { useQuery } from "@tanstack/react-query";
import fetchWithError from "./fetchWithError";

export function useUserData(userId) {
  const usersData = useQuery(
    ["users", userId],
    ({ signal }) => fetchWithError(`/api/users/${userId}`, { signal }),
    { staleTime: 1000 * 60 * 5 }
  );

  return usersData;
}
