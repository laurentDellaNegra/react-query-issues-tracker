import { useQuery } from "@tanstack/react-query";
import { defaultLabels } from "./defaultData";
import fetchWithError from "./fetchWithError";

export function useLabelsData() {
  const labelsQuery = useQuery(
    ["labels"],
    ({ signal }) => fetchWithError(`/api/labels/`, { signal }),
    { staleTime: 1000 * 60 * 60, placeholderData: defaultLabels }
  );
  return labelsQuery;
}
