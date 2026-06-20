/**
 * buildColumns — define las columnas de la tabla de inscripciones.
 * Recibe `t` (i18n) y handlers; devuelve la config de AntD Table. Sin estado.
 */
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { StatusPill } from '@ui/atoms/StatusPill/StatusPill';
import { IconButton } from '@ui/atoms/IconButton/IconButton';
import { StudentCell } from './StudentCell';

export function buildColumns(t, { onView, onEdit }) {
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
        <span className="mat-career">
          <span className="mat-career__bar" style={{ background: row.career.color }} aria-hidden />
          {row.career.name}
        </span>
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
      render: (_, row) => (
        <StatusPill tone={row.typeKey === 'new' ? 'ok' : 'warn'}>
          {t(`enrollments.type.${row.typeKey}`)}
        </StatusPill>
      ),
    },
    {
      title: t('enrollments.table.record'),
      key: 'record',
      render: (_, row) => (
        <StatusPill tone={row.record.tone}>{t(`enrollments.record.${row.record.key}`)}</StatusPill>
      ),
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
      width: 110,
      render: (_, row) => (
        <div className="mat-row-actions">
          <IconButton icon={<EyeOutlined />} label={t('enrollments.actions.view')} onClick={() => onView(row)} />
          <IconButton icon={<EditOutlined />} label={t('enrollments.actions.edit')} onClick={() => onEdit(row)} />
        </div>
      ),
    },
  ];
}

export default buildColumns;
