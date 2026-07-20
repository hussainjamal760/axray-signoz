import { BranchSummary } from '../types/repositories.types';

export interface BranchDropdownProps {
  branches: BranchSummary[];
  value?: string;
  onChange?: (value: string) => void;
}

export function BranchDropdown({ branches, value, onChange }: BranchDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="font-mono-label text-xs font-black uppercase text-primary-fixed">Branch</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-background border-2 border-outline p-3 text-on-surface font-bold focus:border-primary-fixed ring-0 outline-none"
      >
        {branches.map((branch) => (
          <option key={branch.name} value={branch.name}>
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
}
