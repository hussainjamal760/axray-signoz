import { RepositorySummary } from '../types/repositories.types';

export interface RepositoryDropdownProps {
  repositories: RepositorySummary[];
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function RepositoryDropdown({ repositories, value, onChange, disabled, isLoading }: RepositoryDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="font-mono-label text-xs font-black uppercase text-primary-fixed">Repository</label>
      
      {isLoading ? (
        <div className="w-full h-[50px] bg-surface-container border-2 border-outline animate-pulse flex items-center px-4 font-mono-label text-xs font-bold text-primary-fixed uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm animate-spin mr-2">sync</span>
          Loading repositories...
        </div>
      ) : (
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
      )}
    </div>
  );
}
