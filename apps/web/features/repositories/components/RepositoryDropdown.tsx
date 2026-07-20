import { RepositorySummary } from '../types/repositories.types';

export interface RepositoryDropdownProps {
  repositories: RepositorySummary[];
  value?: string;
  onChange?: (value: string) => void;
}

export function RepositoryDropdown({ repositories, value, onChange }: RepositoryDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="font-mono-label text-xs font-black uppercase text-primary-fixed">Repository</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-background border-2 border-outline p-3 text-on-surface font-bold focus:border-primary-fixed ring-0 outline-none"
      >
        {repositories.map((repo) => (
          <option key={repo.id} value={repo.fullName}>
            {repo.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}
