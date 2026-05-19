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

const StudentCard = ({ student, onOpen, onEdit, onView }) => {
  const av = avatarFor(student.fullName);
  const progress = Math.min(100, Math.round((Number(student.semestre) / 6) * 100));
  const hs = HISTORY_MAP[student.historial] || HISTORY_MAP.completo;
  const promedio = student.promedio ?? student.avgGrade ?? '—';

  const menuItems = [
    { key: 'print', icon: <PrinterOutlined />, label: 'Imprimir comprobante' },
    { key: 'mail', icon: <MailOutlined />, label: 'Enviar correo' },
    { key: 'doc', icon: <FileTextOutlined />, label: 'Generar reporte' },
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
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = student.career.color;
        e.currentTarget.style.boxShadow = `0 10px 30px ${student.career.color}25`;
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div
        style={{
          height: 64,
          background: `linear-gradient(135deg, ${student.career.color}, ${student.career.color}cc)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255,255,255,0.95)',
            color: student.isAntiguo ? 'var(--pill-warn-fg)' : 'var(--pill-ok-fg)',
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          {student.tipo}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 16,
            right: 80,
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            lineHeight: 1.2,
          }}
        >
          {student.career.name}
        </div>
      </div>

      <div
        style={{
          padding: '0 20px',
          marginTop: -28,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${av.color}, ${av.color}dd)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 20,
            border: '4px solid var(--surface)',
            boxShadow: `0 4px 12px ${av.color}55`,
            flexShrink: 0,
          }}
        >
          {av.initials}
        </div>
        <div style={{ flex: 1, paddingBottom: 4 }}>
          <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>#{student.codigo}</div>
        </div>
      </div>

      <div style={{ padding: '10px 20px 0' }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.25,
            letterSpacing: -0.2,
          }}
        >
          {student.fullName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 3 }}>
          CI {student.ci} · Inscripción {student.fechaMatricula}
        </div>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: hs.bg,
            color: hs.fg,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {hs.label}
        </span>
      </div>

      <div
        style={{
          margin: '14px 20px 0',
          padding: '12px 0',
          borderTop: '1px solid var(--divider)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
        }}
      >
        <StatBlock label="Semestre" value={`${student.semestre}°`} />
        <StatBlock label="Materias" value={student.materias} />
        <StatBlock label="Promedio" value={promedio} accent="var(--brand-600)" />
      </div>

      <div
        style={{
          margin: '0 20px',
          padding: '10px 0 14px',
          borderTop: '1px solid var(--divider)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            color: 'var(--text-soft)',
            fontWeight: 600,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            marginBottom: 5,
          }}
        >
          <span>Progreso académico</span>
          <span>{progress}%</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 4,
            background: 'var(--bg-page-2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--brand-500), var(--brand-700))',
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: 'var(--surface-alt)',
          padding: '10px 16px',
          display: 'flex',
          gap: 8,
          borderTop: '1px solid var(--divider)',
          marginTop: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          style={{
            flex: 1,
            background: 'var(--surface)',
            color: 'var(--brand-600)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            padding: '6px 0',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <EyeOutlined /> Ver
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          style={{
            width: 32,
            height: 32,
            background: 'var(--surface)',
            color: 'var(--accent-gold)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Editar"
        >
          <EditOutlined />
        </button>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 32,
              height: 32,
              background: 'var(--surface)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-strong)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
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
