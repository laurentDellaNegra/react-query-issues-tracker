import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GoGear } from "react-icons/go";
import fetchWithError from "../helpers/fetchWithError";
import { useLabelsData } from "../helpers/useLabelsData";

export default function IssueLabels({ labels, issueNumber }) {
  const labelsQuery = useLabelsData();
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const setLabels = useMutation(
    (newLabelId) => {
      const newLabels = labels.includes(newLabelId)
        ? labels.filter((currentLabel) => currentLabel !== newLabelId)
        : [...labels, newLabelId];
      return fetchWithError(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ labels: newLabels }),
      });
    },
    {
      onMutate: (newLabelId) => {
        const oldLabels = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).labels;
        const newLabels = oldLabels.includes(newLabelId)
          ? oldLabels.filter((label) => label !== newLabelId)
          : [...oldLabels, newLabelId];
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          labels: newLabels,
        }));
        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (data) => {
            const rollbackLabels = oldLabels.includes(newLabelId)
              ? [...data.labels, newLabelId]
              : data.labels.filter((label) => label !== newLabelId);
            return {
              ...data,
              labels: rollbackLabels,
            };
          });
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
        <span>Labels</span>
        {labelsQuery.isLoading
          ? null
          : labels.map((label) => {
              const labelObject = labelsQuery.data.find(
                (queryLabel) => queryLabel.id === label
              );
              return labelObject ? (
                <span key={label} className={`label ${labelObject.color}`}>
                  {labelObject.name}
                </span>
              ) : null;
            })}
      </div>
      <GoGear
        onClick={() => !labelsQuery.isLoading && setMenuOpen((open) => !open)}
      />
      {menuOpen && (
        <div className="picker-menu labels">
          {labelsQuery.data?.map((label) => {
            const selected = labels.includes(label.id);
            return (
              <div
                key={label.id}
                className={selected ? "selected" : ""}
                onClick={() => {
                  setLabels.mutate(label.id);
                }}
              >
                <span
                  className="label-dot"
                  style={{ backgroundColor: label.color }}
                ></span>
                {label.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
