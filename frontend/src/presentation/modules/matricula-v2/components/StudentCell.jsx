/**
 * Celda de estudiante con avatar e iniciales.
 * @param {{ student: object, showAvatar?: boolean }} props
 */
import { avatarFor } from '../utils/avatarFor';

const StudentCell = ({ student, showAvatar = true }) => {
  const av = avatarFor(student.fullName);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {showAvatar ? (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: `${av.color}15`,
            color: av.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
            border: `1.5px solid ${av.color}25`,
          }}
        >
          {av.initials}
        </div>
      ) : null}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
          {student.fullName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-soft)',
            marginTop: 2,
            display: 'flex',
            gap: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span>#{student.codigo}</span>
          <span>CI {student.ci}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentCell;
