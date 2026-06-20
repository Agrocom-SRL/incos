/**
 * buildColumns — define las columnas de la tabla de inscripciones.
 * Recibe `t` (i18n) y handlers; devuelve la config de AntD Table. Sin estado.
 * Compone átomos compartidos (StatusPill, IconButton) y organismos locales.
 */
import {
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  PrinterOutlined,
  MailOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { StatusPill } from '@ui/atoms/StatusPill/StatusPill';
import { IconButton } from '@ui/atoms/IconButton/IconButton';
import { StudentCell } from './StudentCell';
import { AdmissionTypeTag } from './AdmissionTypeTag';
import { pagoStatusOf } from './pagoStatus';
import { historyStateOf, HISTORY_ICONS } from './historyStates';

/** Render de la píldora de historial (helper, no es un componente exportado). */
function renderHistoryPill(row, t) {
  const state = historyStateOf(row.historialKey);
  const Icon = HISTORY_ICONS[state.iconKey];
  return (
    <StatusPill tone={state.tone} icon={Icon ? <Icon /> : null}>
      {t(`enrollments.history.${row.historialKey}`)}
    </StatusPill>
  );
}

export function buildColumns(t, { onView, onEdit, onPrint, onEmail, onReport, onDelete }) {
  const rowMenu = (row) => ({
    items: [
      { key: 'print', icon: <PrinterOutlined />, label: t('enrollments.actions.print'), onClick: () => onPrint?.(row) },
      { key: 'email', icon: <MailOutlined />, label: t('enrollments.actions.email'), onClick: () => onEmail?.(row) },
      { key: 'report', icon: <FileTextOutlined />, label: t('enrollments.actions.report'), onClick: () => onReport?.(row) },
      { type: 'divider' },
      { key: 'delete', icon: <DeleteOutlined />, label: t('enrollments.actions.delete'), danger: true, onClick: () => onDelete?.(row) },
    ],
  });

  return [
    {
      title: t('enrollments.table.student'),
      key: 'student',
      render: (_, row) => <StudentCell row={row} />,
    },
    {
      title: t('enrollments.table.program'),
      key: 'program',
      render: (_, row) => (
        <div className="mat-career-cell">
          <span className="mat-career">
            <span className="mat-career__bar" style={{ background: row.career.color }} aria-hidden />
            {row.career.name}
          </span>
          <span className="mat-career__sub">
            {t('enrollments.table.careerSubtitle', { semestre: row.semestre, materias: row.materias })}
          </span>
        </div>
      ),
    },
    {
      title: t('enrollments.table.term'),
      key: 'term',
      render: (_, row) => (
        <div className="mat-term">
          <div className="mat-term__year">{row.gestionYear}</div>
          <div className="mat-term__date">{row.fecha}</div>
        </div>
      ),
    },
    {
      title: t('enrollments.table.type'),
      key: 'type',
      render: (_, row) => <AdmissionTypeTag typeKey={row.typeKey} t={t} />,
    },
    {
      title: t('enrollments.table.record'),
      key: 'record',
      render: (_, row) => renderHistoryPill(row, t),
    },
    {
      title: t('enrollments.table.payment'),
      key: 'payment',
      render: (_, row) => {
        if (!row.estadoPago) return <span className="mat-dash">—</span>;
        const { tone } = pagoStatusOf(row.estadoPago);
        const labelKey = tone === 'ok' ? 'enrollments.payment.upToDate' : 'enrollments.payment.pending';
        return <StatusPill tone={tone}>{t(labelKey)}</StatusPill>;
      },
    },
    {
      title: t('enrollments.table.subjects'),
      key: 'subjects',
      align: 'center',
      render: (_, row) => <span className="mat-subjects">{row.materias}</span>,
    },
    {
      title: t('enrollments.table.actions'),
      key: 'actions',
      align: 'right',
      width: 140,
      render: (_, row) => (
        <div className="mat-row-actions">
          <IconButton tone="info" icon={<EyeOutlined />} label={t('enrollments.actions.view')} onClick={() => onView?.(row)} />
          <IconButton tone="warning" icon={<EditOutlined />} label={t('enrollments.actions.edit')} onClick={() => onEdit?.(row)} />
          <Dropdown menu={rowMenu(row)} trigger={['click']} placement="bottomRight">
            <span onClick={(e) => e.stopPropagation()}>
              <IconButton tone="muted" icon={<MoreOutlined />} label={t('enrollments.actions.more')} />
            </span>
          </Dropdown>
        </div>
      ),
    },
  ];
}

export default buildColumns;
