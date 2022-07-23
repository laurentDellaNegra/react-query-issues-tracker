import { useLabelsData } from "../helpers/useLabelsData";

export function Label({ label }) {
  const labelQuery = useLabelsData();
  if (labelQuery.isLoading) return null;
  const labelObj = labelQuery.data.find(
    (queryLabel) => queryLabel.id === label
  );
  if (!labelObj) return null;
  return (
    <span key={label} className={`label ${labelObj.color}`}>
      {labelObj.name}
    </span>
  );
}
