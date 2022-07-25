import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchWithError from "../helpers/fetchWithError";
import { StatusSelect } from "./StatusSelect";

export default function IssueStatus({ status, issueNumber }) {
  const queryClient = useQueryClient();
  const setStatus = useMutation(
    (newStatus) => {
      fetchWithError(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    },
    {
      onMutate: (status) => {
        const oldStatus = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).status;
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          status,
        }));
        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (data) => ({
            ...data,
            status: oldStatus,
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
        <span>
          <StatusSelect
            noEmptyOptions
            value={status}
            onChange={(e) => setStatus.mutate(e.target.value)}
          />
        </span>
      </div>
    </div>
  );
}
