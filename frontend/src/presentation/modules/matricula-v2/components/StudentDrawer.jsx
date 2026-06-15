/**
 * Drawer de detalle de matrícula.
 * @param {{ student: object|null, open: boolean, onClose: () => void, onEdit?: () => void }} props
 */
import { useEffect, useState } from 'react';
import { Button, Drawer, Progress, Tag } from 'antd';
import { CloseOutlined, EditOutlined, MailOutlined, PrinterOutlined } from '@ant-design/icons';
import { avatarFor } from '../utils/avatarFor';
import { sanitizeBusinessColor } from '../utils/sanitizeColor';
import { pagoStatusOf } from '../utils/pagoStatus';
import { useReducedMotion } from '@presentation/hooks/useReducedMotion';
import { STAGGER } from '@presentation/motion/presets';
import FadeIn from '@presentation/components/atoms/motion/FadeIn';
import StatusPill from './StatusPill';

// Progreso del semestre (placeholder pre-existente hasta exponer el dato real).
const SEMESTER_PROGRESS = 42;

// DetailSection migrado a FadeIn (capa compartida). Delay por índice usando STAGGER.perIndex.
function DetailSection({ title, children, index }) {
  return (
    <FadeIn
      className="matricula-v2-detail-section"
      delay={STAGGER.perIndex * index}
    >
      <div className="matricula-v2-detail-section__title">{title}</div>
      <div className="matricula-v2-detail-section__body">{children}</div>
    </FadeIn>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="matricula-v2-detail-row">
      <div className="matricula-v2-detail-row__label">{label}</div>
      <div className="matricula-v2-detail-row__value">{value}</div>
    </div>
  );
}

const StudentDrawer = ({ student, open, onClose, onEdit }) => {
  const reduce = useReducedMotion();
  // Anima la barra de progreso de 0 al valor al abrir (feedback de estado).
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    if (!open || reduce) return undefined;
    const id = requestAnimationFrame(() => setFilled(true));
    return () => {
      cancelAnimationFrame(id);
      setFilled(false);
    };
  }, [open, reduce]);
  const progress = !open ? 0 : reduce || filled ? SEMESTER_PROGRESS : 0;

  if (!student) return null;
  const av = avatarFor(student.fullName);
  const avatarColor = sanitizeBusinessColor(av.color, 'var(--brand-600)');
  const careerColor = sanitizeBusinessColor(student.career?.color, 'var(--brand-600)');

  return (
    <Drawer
      title={null}
      width={460}
      open={open}
      onClose={onClose}
      closable={false}
      styles={{ body: { padding: 0 }, header: { display: 'none' } }}
    >
      <div className="matricula-v2-drawer-hero">
        <div className="matricula-v2-drawer-hero__top">
          <Tag className="matricula-v2-drawer-tag">{student.tipo}</Tag>
          <Button
            type="text"
            onClick={onClose}
            className="matricula-v2-drawer-hero__close"
            aria-label="Cerrar"
            icon={<CloseOutlined />}
          />
        </div>
        <div className="matricula-v2-drawer-hero__id">
          <div className="matricula-v2-drawer-hero__avatar" style={{ '--avatar': avatarColor }}>
            {av.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="matricula-v2-drawer-hero__name">{student.fullName}</div>
            <div className="matricula-v2-drawer-hero__sub">
              Código {student.codigo} · CI {student.ci}
            </div>
          </div>
        </div>
      </div>

      <div className="matricula-v2-drawer-stats">
        <div className="matricula-v2-drawer-stats__card">
          <div>
            <div className="matricula-v2-drawer-stats__label">SEMESTRE</div>
            <div className="matricula-v2-drawer-stats__value">{student.semestre}°</div>
          </div>
          <div>
            <div className="matricula-v2-drawer-stats__label">MATERIAS</div>
            <div className="matricula-v2-drawer-stats__value">{student.materias}</div>
          </div>
          <div>
            <div className="matricula-v2-drawer-stats__label">GESTIÓN</div>
            <div className="matricula-v2-drawer-stats__value matricula-v2-drawer-stats__value--accent">
              {student.gestion}
            </div>
          </div>
        </div>
      </div>

      <div className="matricula-v2-drawer-body">
        <DetailSection title="Información de inscripción" index={0}>
          <DetailRow
            label="Carrera"
            value={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  className="matricula-v2-detail-career-dot"
                  style={{ background: careerColor }}
                  aria-hidden
                />
                <strong>{student.career.name}</strong>
              </span>
            }
          />
          <DetailRow label="Gestión" value={student.gestion} />
          <DetailRow label="Fecha matrícula" value={student.fechaMatricula} />
          <DetailRow
            label="Tipo"
            value={
              <Tag color={student.isAntiguo ? 'gold' : 'green'} style={{ margin: 0 }}>
                {student.tipo}
              </Tag>
            }
          />
          {student.paralelo ? <DetailRow label="Paralelo" value={student.paralelo} /> : null}
        </DetailSection>

        <DetailSection title="Estado académico" index={1}>
          <DetailRow
            label="Historial"
            value={<StatusPill statusKey={student.historial} label={student.historyState?.label} />}
          />
          <DetailRow
            label="Estado de pago"
            value={
              <Tag color={pagoStatusOf(student.estadoPago).tagColor} style={{ margin: 0 }}>
                {student.estadoPago}
              </Tag>
            }
          />
          <DetailRow
            label="Progreso del semestre"
            value={
              <div style={{ flex: 1 }}>
                <Progress
                  percent={progress}
                  size="small"
                  strokeColor="var(--brand-600)"
                  style={{ margin: 0 }}
                />
              </div>
            }
          />
        </DetailSection>

        <div className="matricula-v2-drawer-actions">
          <Button
            type="primary"
            icon={<EditOutlined />}
            block
            style={{ flex: 1 }}
            onClick={onEdit}
          >
            Editar inscripción
          </Button>
          <Button icon={<PrinterOutlined />}>Imprimir</Button>
          <Button icon={<MailOutlined />} aria-label="Enviar correo" />
        </div>
      </div>
    </Drawer>
  );
};

export default StudentDrawer;
