import { possibleStatus } from "../helpers/defaultData";

export function StatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="status-select">
      <option value="">Select a status to filter</option>
      {possibleStatus.map((status) => (
        <option key={status.id} value={status.id}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
