/**
 * Celda de estudiante con avatar e iniciales.
 * El nombre viene de `student.fullName`, formateado por el adaptador con
 * `buildFullName` (orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES, §4b).
 * @param {{ student: object, showAvatar?: boolean }} props
 */
import { avatarFor } from '../utils/avatarFor';
import { sanitizeBusinessColor } from '../utils/sanitizeColor';

const StudentCell = ({ student, showAvatar = true }) => {
  const av = avatarFor(student.fullName);
  const avatarColor = sanitizeBusinessColor(av.color, 'var(--brand-600)');

  return (
    <div className="matricula-v2-student-cell">
      {showAvatar ? (
        <div
          className="matricula-v2-student-cell__avatar"
          style={{ '--avatar': avatarColor }}
        >
          {av.initials}
        </div>
      ) : null}
      <div className="matricula-v2-student-cell__main">
        <div className="matricula-v2-student-cell__name">{student.fullName}</div>
        <div className="matricula-v2-student-cell__meta">
          <span>#{student.codigo}</span>
          <span className="matricula-v2-student-cell__ci">CI {student.ci}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentCell;
