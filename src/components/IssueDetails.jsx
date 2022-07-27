import {
  useInfiniteQuery,
  useQuery,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { Fragment } from "react";
import { useParams } from "react-router-dom";
import fetchWithError from "../helpers/fetchWithError";
import { relativeDate } from "../helpers/relativeDate";
import useScrollToBottom from "../helpers/useScrollToBottom";
import { useUserData } from "../helpers/useUserData";
import IssueAssignment from "./IssueAssignment";
import { IssueHeader } from "./IssueHeader";
import IssueLabels from "./IssueLabels";
import IssueStatus from "./IssueStatus";
import Loader from "./Loader";

function useIssueData(issueNumber) {
  return useQuery(["issues", issueNumber], ({ signal }) => {
    return fetchWithError(`/api/issues/${issueNumber}`, { signal });
  });
}

function useIssueComments(issueNumber) {
  return useInfiniteQuery(
    ["issues", issueNumber, "comments"],
    ({ signal, pageParam = 1 }) => {
      return fetchWithError(
        `/api/issues/${issueNumber}/comments?page=${pageParam}`,
        { signal }
      );
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return;
        return pages.length + 1;
      },
    }
  );
}

function Comment({ comment, createdBy, createdDate }) {
  const userQuery = useUserData(createdBy);

  if (userQuery.isLoading)
    return (
      <div className="comment">
        <div>
          <div className="comment-header">Loading...</div>
        </div>
      </div>
    );

  return (
    <div className="comment">
      <img src={userQuery.data.profilePictureUrl} alt="Commenter Avatar" />
      <div>
        <div className="comment-header">
          <span>{userQuery.data.name}</span> commented{" "}
          <span>{relativeDate(createdDate)}</span>
        </div>
        <div className="comment-body">{comment}</div>
      </div>
    </div>
  );
}

export default function IssueDetails() {
  const { number } = useParams();
  const issueQuery = useIssueData(number);
  const commentsQuery = useIssueComments(number);

  useScrollToBottom(document, commentsQuery.fetchNextPage, 100);

  return (
    <div className="issue-details">
      {issueQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <IssueHeader {...issueQuery.data} />
          <main>
            <section>
              {commentsQuery.isLoading ? (
                <p>Loading...</p>
              ) : (
                commentsQuery.data?.pages.map((page, index) => (
                  <Fragment key={index}>
                    {page.map((comment) => (
                      <Comment key={comment.id} {...comment} />
                    ))}
                  </Fragment>
                ))
              )}
              {commentsQuery.isFetchingNextPage && <Loader />}
            </section>
            <aside>
              <IssueStatus
                status={issueQuery.data.status}
                issueNumber={issueQuery.data.number.toString()}
              />
              <IssueAssignment
                assignee={issueQuery.data.assignee}
                issueNumber={issueQuery.data.number.toString()}
              />
              <IssueLabels
                labels={issueQuery.data.labels}
                issueNumber={issueQuery.data.number.toString()}
              />
            </aside>
          </main>
        </>
      )}
    </div>
  );
}
