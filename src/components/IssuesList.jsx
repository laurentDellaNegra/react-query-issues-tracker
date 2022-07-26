import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IssueItem } from "./IssueItem";
import fetchWithError from "../helpers/fetchWithError";
import Loader from "./Loader";

export default function IssuesList({ labels, status, pageNum, setPageNum }) {
  const queryClient = useQueryClient();
  const issuesQuery = useQuery(
    ["issues", { labels, status, pageNum }],
    async ({ signal }) => {
      const statusString = status ? `&status=${status}` : "";
      const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
      const paginationString = pageNum ? `&page=${pageNum}` : "";
      const res = await fetchWithError(
        `/api/issues?${labelsString}${statusString}${paginationString}`,
        {
          signal,
          headers: {
            "x-error": true,
          },
        }
      );
      res.forEach((issue) =>
        queryClient.setQueryData(["issues", issue.number.toString()], issue)
      );
      return res;
    },
    {
      keepPreviousData: true,
    }
  );
  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useQuery(
    ["issues", "search", searchValue],
    ({ signal }) =>
      fetchWithError(`/api/search/issues?q=${searchValue}`, { signal }),
    { enabled: searchValue.length > 0 }
  );
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchValue(e.target.elements.search.value);
        }}
      >
        <label htmlFor="search">Search issues</label>
        <input
          type="search"
          name="search"
          id="search"
          placeholder="Search"
          onChange={(e) => {
            if (e.target.value.length === 0) setSearchValue("");
          }}
        />
      </form>
      <h2>Issues List {issuesQuery.isFetching ? <Loader /> : null}</h2>
      {issuesQuery.isLoading ? (
        <p>Loading...</p>
      ) : issuesQuery.isError ? (
        <p>{issuesQuery.error.message}</p>
      ) : searchQuery.fetchStatus === "idle" &&
        searchQuery.isLoading === true ? (
        <>
          <ul className="issues-list">
            {issuesQuery.data.map((issue) => (
              <IssueItem
                key={issue.id}
                title={issue.title}
                number={issue.number}
                assignee={issue.assignee}
                commentCount={issue.comments.length}
                createdBy={issue.createdBy}
                createdDate={issue.createdDate}
                labels={issue.labels}
                status={issue.status}
              />
            ))}
          </ul>
          <div className="pagination">
            <button
              onClick={() => {
                console.log(pageNum);
                if (pageNum > 1) setPageNum(pageNum - 1);
              }}
              disabled={pageNum === 1}
            >
              Previous
            </button>
            <p>
              Page {pageNum} {issuesQuery.isFetching ? "..." : ""}
            </p>
            <button
              onClick={() => {
                if (
                  issuesQuery.data?.length !== 0 &&
                  !issuesQuery.isPreviousData
                )
                  setPageNum(pageNum + 1);
              }}
              disabled={
                issuesQuery.data?.length === 0 || issuesQuery.isPreviousData
              }
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Search Results</h2>
          {searchQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data.count} Results</p>
              <ul className="issues-list">
                {searchQuery.data.items.map((issue) => (
                  <IssueItem
                    key={issue.id}
                    title={issue.title}
                    number={issue.number}
                    assignee={issue.assignee}
                    commentCount={issue.comments.length}
                    createdBy={issue.createdBy}
                    createdDate={issue.createdDate}
                    labels={issue.labels}
                    status={issue.status}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
