'use client';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, pageSize, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <p className="text-sm text-gray-500">
        Mostrando {from}–{to} de {total} resultado{total !== 1 ? 's' : ''}
      </p>

      <div className="flex items-center gap-1">
        <PageBtn label="←" disabled={page === 1} onClick={() => onPageChange(page - 1)} />

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">…</span>
          ) : (
            <PageBtn
              key={p}
              label={String(p)}
              active={p === page}
              onClick={() => onPageChange(Number(p))}
            />
          )
        )}

        <PageBtn label="→" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} />
      </div>
    </div>
  );
}

function PageBtn({
  label, onClick, disabled, active,
}: {
  label: string; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[2rem] h-8 px-2 rounded text-sm font-medium transition-colors
        ${active
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
    >
      {label}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}
