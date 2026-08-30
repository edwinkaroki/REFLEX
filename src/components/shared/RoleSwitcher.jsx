import { ChevronDown } from "lucide-react";

export default function RoleSwitcher({
  role,
  setRole,
  disabled = true,
}) {
  return (
    <div className="role-switcher">

      <select
        value={role}
        onChange={(e) => {
          if (!disabled) {
            setRole?.(e.target.value);
          }
        }}
        className="role-select"
        disabled={disabled}
        aria-label="Current workspace role"
      >

        <option
          value="dispatcher"
          className="text-ink"
        >
          Dispatcher
        </option>

        <option
          value="retailer"
          className="text-ink"
        >
          Retailer
        </option>

        <option
          value="rider"
          className="text-ink"
        >
          Rider
        </option>

      </select>

      <ChevronDown
        size={16}
        className="role-chevron"
      />

    </div>
  );
}