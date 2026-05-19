/**
 * Tarjeta de estudiante (vista grid rediseñada).
 * @param {{ student: object, onOpen: () => void, onEdit?: () => void, onView?: () => void }} props
 */
import {
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PrinterOutlined,
  MailOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { avatarFor } from '../utils/avatarFor';
import { mv2DropdownPopupProps } from '../theme/popupClass';

function StatBlock({ label, value, accent = 'var(--text)' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: accent,
          letterSpacing: -0.5,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-soft)',
          fontWeight: 600,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

const HISTORY_MAP = {
  pendiente: { bg: 'var(--pill-warn-bg)', fg: 'var(--pill-warn-fg)', label: 'Pendiente' },
  completo: { bg: 'var(--pill-ok-bg)', fg: 'var(--pill-ok-fg)', label: 'Completo' },
  observado: { bg: 'var(--pill-err-bg)', fg: 'var(--pill-err-fg)', label: 'Observado' },
  revision: { bg: 'var(--pill-info-bg)', fg: 'var(--pill-info-fg)', label: 'Revisión' },
  no_aplica: { bg: 'var(--surface-alt)', fg: 'var(--text-muted)', label: 'Sin historial' },
};

function MetaRow({ label, value }) {
  if (value == null || value === '' || value === '—') return null;
  return (
    <div className="matricula-v2-student-card__meta-row">
      <span className="matricula-v2-student-card__meta-label">{label}</span>
      <span className="matricula-v2-student-card__meta-value">{value}</span>
    </div>
  );
}

const StudentCard = ({ student, onOpen, onEdit, onView }) => {
  const av = avatarFor(student.fullName);
  const progress = Math.min(100, Math.round((Number(student.semestre) / 6) * 100));
  const hs = HISTORY_MAP[student.historial] || HISTORY_MAP.completo;
  const promedio = student.promedio ?? student.avgGrade ?? '—';
  const careerColor = student.career?.color ?? 'var(--brand-600)';
  const periodoLabel = [student.periodoNombre, student.paralelo].filter(Boolean).join(' · ');

  const menuItems = [
    {
      key: 'print',
      icon: <PrinterOutlined style={{ color: 'var(--info)' }} />,
      label: 'Imprimir comprobante',
    },
    {
      key: 'mail',
      icon: <MailOutlined style={{ color: 'var(--info)' }} />,
      label: 'Enviar correo',
    },
    {
      key: 'doc',
      icon: <FileTextOutlined style={{ color: 'var(--info)' }} />,
      label: 'Generar reporte',
    },
    { type: 'divider' },
    { key: 'del', icon: <DeleteOutlined />, label: 'Eliminar', danger: true },
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
      className="matricula-v2-student-card"
      style={{ '--card-career-color': careerColor }}
    >
      <div className="matricula-v2-student-card__accent" aria-hidden />

      <div className="matricula-v2-student-card__header">
        <div
          className="matricula-v2-student-card__avatar"
          style={{
            background: `linear-gradient(135deg, ${av.color}, color-mix(in srgb, ${av.color} 88%, black))`,
          }}
        >
          {av.initials}
        </div>
        <div className="matricula-v2-student-card__identity">
          <div className="matricula-v2-student-card__code">#{student.codigo}</div>
          <div className="matricula-v2-student-card__name">{student.fullName}</div>
        </div>
        <span
          className={`matricula-v2-student-card__tipo ${
            student.isAntiguo
              ? 'matricula-v2-student-card__tipo--antiguo'
              : 'matricula-v2-student-card__tipo--nuevo'
          }`}
        >
          {student.tipo}
        </span>
      </div>

      <div className="matricula-v2-student-card__body">
        <div className="matricula-v2-student-card__career" title={student.career.name}>
          <span className="matricula-v2-student-card__career-dot" aria-hidden />
          <span className="matricula-v2-student-card__career-label">{student.career.name}</span>
        </div>

        <div className="matricula-v2-student-card__enrollment">
          <MetaRow label="CI" value={student.ci} />
          <MetaRow label="Gestión" value={student.gestion} />
          <MetaRow label="Inscripción" value={student.fechaMatricula} />
          <MetaRow label="Periodo" value={periodoLabel} />
          <MetaRow label="Pago" value={student.estadoPago} />
        </div>
      </div>

      <div className="matricula-v2-student-card__status">
        <span
          className="matricula-v2-student-card__history"
          style={{ background: hs.bg, color: hs.fg }}
        >
          {hs.label}
        </span>
      </div>

      <div className="matricula-v2-student-card__stats">
        <StatBlock label="Semestre" value={`${student.semestre}°`} />
        <StatBlock label="Materias" value={student.materias} />
        <StatBlock label="Promedio" value={promedio} accent="var(--brand-600)" />
      </div>

      <div className="matricula-v2-student-card__progress">
        <div className="matricula-v2-student-card__progress-head">
          <span>Progreso académico</span>
          <span>{progress}%</span>
        </div>
        <div className="matricula-v2-student-card__progress-track">
          <div className="matricula-v2-student-card__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div
        className="matricula-v2-student-card__footer"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="matricula-v2-student-card__btn matricula-v2-student-card__btn--primary"
          onClick={(e) => {
            e.stopPropagation();
            if (onView) onView();
            else onOpen();
          }}
        >
          <EyeOutlined /> Ver
        </button>
        <button
          type="button"
          className="matricula-v2-student-card__btn matricula-v2-student-card__btn--icon matricula-v2-student-card__btn--edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          aria-label="Editar"
        >
          <EditOutlined />
        </button>
        <Dropdown {...mv2DropdownPopupProps} menu={{ items: menuItems }} trigger={['click']}>
          <button
            type="button"
            className="matricula-v2-student-card__btn matricula-v2-student-card__btn--icon matricula-v2-student-card__btn--more"
            onClick={(e) => e.stopPropagation()}
            aria-label="Más opciones"
          >
            <MoreOutlined />
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default StudentCard;
