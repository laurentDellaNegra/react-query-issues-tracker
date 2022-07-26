import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GoGear } from "react-icons/go";
import fetchWithError from "../helpers/fetchWithError";
import { useUserData } from "../helpers/useUserData";

export default function IssueAssignment({ assignee, issueNumber }) {
  const user = useUserData(assignee);
  const [menuOpen, setMenuOpen] = useState(false);
  const userQuery = useQuery(["users"], () => fetchWithError("/api/users"));
  const queryClient = useQueryClient();
  const setAssignment = useMutation(
    (newAssignee) => {
      return fetchWithError(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assignee: newAssignee }),
      });
    },
    {
      onMutate: (newAssignee) => {
        const oldAssignee = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).assignee;
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          assignee: newAssignee,
        }));
        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (data) => ({
            ...data,
            assignee: oldAssignee,
          }));
        };
      },
      onError: (error, variables, rollback) => {
        rollback();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["issues", issueNumber], { exact: true });
      },
    }
  );
  return (
    <div className="issue-options">
      <div>
        <span>Assignement</span>
        {user.isSuccess && (
          <div>
            <img src={user.data.profilePictureUrl} alt="" />
            {user.data.name}
          </div>
        )}
      </div>
      <GoGear
        onClick={() => !userQuery.isLoading && setMenuOpen((open) => !open)}
      />
      {menuOpen && (
        <div className="picker-menu">
          {userQuery.data?.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setAssignment.mutate(user.id);
              }}
            >
              <img src={user.profilePictureUrl} />
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
