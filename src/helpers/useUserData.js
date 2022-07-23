import { useQuery } from "react-query";

export function useUserData(userId) {
  const usersData = useQuery(
    ["users", userId],
    () => fetch(`/api/users/${userId}`).then((res) => res.json()),
    { enabled: !!userId }
  );

  return usersData;
}
