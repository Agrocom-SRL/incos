/**
 * Drawer de detalle de matrícula.
 * @param {{ student: object|null, open: boolean, onClose: () => void, onEdit?: () => void }} props
 */
import { Button, Drawer, Progress, Tag } from 'antd';
import {
  EditOutlined,
  MailOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { avatarFor } from '../utils/avatarFor';
import StatusPill from './StatusPill';

function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-soft)',
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: 'var(--surface-alt)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '4px 14px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid var(--divider)',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text)', textAlign: 'right', flex: 1, minWidth: 0 }}>
        {value}
      </div>
    </div>
  );
}

const StudentDrawer = ({ student, open, onClose, onEdit }) => {
  if (!student) return null;
  const av = avatarFor(student.fullName);

  return (
    <Drawer
      title={null}
      width={460}
      open={open}
      onClose={onClose}
      closable={false}
      styles={{ body: { padding: 0 }, header: { display: 'none' } }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, var(--brand-700), var(--brand-500))',
          padding: '28px 24px 60px',
          color: 'white',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Tag
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: 999,
              padding: '2px 10px',
            }}
          >
            {student.tipo}
          </Tag>
          <Button
            type="text"
            onClick={onClose}
            style={{ color: 'white' }}
            icon={<span style={{ fontSize: 18 }}>×</span>}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'white',
              color: av.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              border: '3px solid rgba(255,255,255,0.4)',
            }}
          >
            {av.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{student.fullName}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              Código {student.codigo} · CI {student.ci}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px', marginTop: -36 }}>
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500 }}>SEMESTRE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{student.semestre}°</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500 }}>MATERIAS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{student.materias}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500 }}>GESTIÓN</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-700)' }}>{student.gestion}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <DetailSection title="Información de inscripción">
          <DetailRow
            label="Carrera"
            value={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{ width: 8, height: 8, borderRadius: 2, background: student.career.color }}
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

        <DetailSection title="Estado académico">
          <DetailRow
            label="Historial"
            value={<StatusPill statusKey={student.historial} label={student.historyState?.label} />}
          />
          <DetailRow
            label="Estado de pago"
            value={
              <Tag
                color={
                  student.estadoPago === 'Al día'
                    ? 'green'
                    : student.estadoPago === 'Pendiente'
                      ? 'red'
                      : 'blue'
                }
                style={{ margin: 0 }}
              >
                {student.estadoPago}
              </Tag>
            }
          />
          <DetailRow
            label="Progreso del semestre"
            value={
              <div style={{ flex: 1 }}>
                <Progress percent={42} size="small" strokeColor="var(--brand-600)" style={{ margin: 0 }} />
              </div>
            }
          />
        </DetailSection>

        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            block
            style={{ flex: 1, background: 'var(--brand-700)', borderColor: 'var(--brand-700)' }}
            onClick={onEdit}
          >
            Editar inscripción
          </Button>
          <Button icon={<PrinterOutlined />}>Imprimir</Button>
          <Button icon={<MailOutlined />} />
        </div>
      </div>
    </Drawer>
  );
};

export default StudentDrawer;
