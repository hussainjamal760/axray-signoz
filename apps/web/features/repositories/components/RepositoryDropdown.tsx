import { RepositorySummary } from '../types/repositories.types';

export interface RepositoryDropdownProps {
  repositories: RepositorySummary[];
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function RepositoryDropdown({ repositories, value, onChange, disabled }: RepositoryDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="font-mono-label text-xs font-black uppercase text-primary-fixed">Repository</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full bg-background border-2 border-outline p-3 text-on-surface font-bold focus:border-primary-fixed ring-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {repositories.length === 0 ? (
          <option value="">No repositories found</option>
        ) : (
          repositories.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.fullName}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
