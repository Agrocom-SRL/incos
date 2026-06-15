/**
 * Grilla de tarjetas de estudiante con entrada en stagger (jerarquiza la carga y
 * evita el cambio brusco al filtrar). Respeta reduced-motion vía MotionConfig
 * global (MainLayout) + Stagger que solo anima opacity en ese caso.
 *
 * Migrado a capa de motion compartida: Stagger / Stagger.Item de
 * presentation/components/atoms/motion (fuente única de presets).
 *
 * @param {{ students: object[], onOpen: (s) => void, onEdit: (s) => void }} props
 */
import StudentCard from './StudentCard';
import Stagger from '@presentation/components/atoms/motion/Stagger';

const StudentCardGrid = ({ students, onOpen, onEdit }) => (
  <Stagger className="matricula-v2-grid">
    {students.map((s) => (
      <Stagger.Item key={s.id} style={{ minWidth: 0 }}>
        <StudentCard student={s} onOpen={() => onOpen(s)} onEdit={() => onEdit(s)} />
      </Stagger.Item>
    ))}
  </Stagger>
);

export default StudentCardGrid;
