/**
 * Chip de filtro por carrera.
 * @param {{ career: { id: string, name: string, color: string }, count: number, active: boolean, onClick: () => void }} props
 */
const CareerChip = ({ career, count, active, onClick }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onClick();
    }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      background: active ? career.color : 'var(--surface)',
      color: active ? 'white' : 'var(--text-2)',
      border: `1px solid ${active ? career.color : 'var(--border)'}`,
      borderRadius: 999,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 500,
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: active ? 'white' : career.color,
      }}
    />
    {career.name}
    <span
      style={{
        background: active ? 'rgba(255,255,255,0.25)' : 'var(--bg-page-2)',
        color: active ? 'white' : 'var(--text-muted)',
        padding: '1px 8px',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {count}
    </span>
  </div>
);

export default CareerChip;
