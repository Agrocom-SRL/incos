/**
 * Columnas de la tabla de inscripciones (4 layouts responsive).
 */
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  MailOutlined,
  MoreOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Tooltip } from 'antd';
import AdmissionTypeTag from '../components/AdmissionTypeTag';
import StatusPill from '../components/StatusPill';
import StudentCell from '../components/StudentCell';
import { mv2DropdownPopupProps, mv2TooltipProps } from '../theme/popupClass';
import { pagoStatusOf } from './pagoStatus';
import { sanitizeBusinessColor } from './sanitizeColor';

function rowActionMenuItems(r, { handleView, handleEdit }) {
  return [
    {
      key: 'view',
      icon: <EyeOutlined style={{ color: 'var(--info)' }} />,
      label: 'Ver detalle',
      onClick: () => handleView(r),
    },
    {
      key: 'edit',
      icon: <EditOutlined style={{ color: 'var(--warning)' }} />,
      label: 'Editar',
      onClick: () => handleEdit(r),
    },
    { type: 'divider' },
    ...rowOverflowMenuItems(),
  ];
}

function rowOverflowMenuItems() {
  return [
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
}

function TableRowActions({ record, handlers, menuOnly }) {
  const fullMenu = { items: rowActionMenuItems(record, handlers) };
  const overflowMenu = { items: rowOverflowMenuItems() };

  if (menuOnly) {
    return (
      <div className="matricula-v2-table-actions">
        <Dropdown {...mv2DropdownPopupProps} menu={fullMenu} trigger={['click']}>
          <Button
            type="text"
            size="small"
            className="matricula-v2-action-icon--muted"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
            aria-label="Acciones"
          />
        </Dropdown>
      </div>
    );
  }

  return (
    <div className="matricula-v2-table-actions" onClick={(e) => e.stopPropagation()}>
      <Tooltip title="Ver detalle" {...mv2TooltipProps}>
        <Button
          type="text"
          size="small"
          className="matricula-v2-action-icon--info"
          icon={<EyeOutlined />}
          onClick={() => handlers.handleView(record)}
          aria-label="Ver detalle"
        />
      </Tooltip>
      <Tooltip title="Editar" {...mv2TooltipProps}>
        <Button
          type="text"
          size="small"
          className="matricula-v2-action-icon--warning"
          icon={<EditOutlined />}
          onClick={() => handlers.handleEdit(record)}
          aria-label="Editar"
        />
      </Tooltip>
      <Dropdown {...mv2DropdownPopupProps} menu={overflowMenu} trigger={['click']}>
        <Button
          type="text"
          size="small"
          className="matricula-v2-action-icon--muted"
          icon={<MoreOutlined />}
          aria-label="Más acciones"
        />
      </Dropdown>
    </div>
  );
}

function buildActionsColumn(handlers, { menuOnly = false } = {}) {
  return {
    title: '',
    key: 'actions',
    className: 'matricula-v2-table-col-actions',
    width: menuOnly ? 56 : 112,
    align: 'right',
    render: (_, r) => <TableRowActions record={r} handlers={handlers} menuOnly={menuOnly} />,
  };
}

const studentColumn = {
  title: 'Estudiante',
  key: 'student',
  width: 280,
  ellipsis: true,
  render: (_, r) => <StudentCell student={r} />,
};

const careerColumn = {
  title: 'Carrera',
  key: 'career',
  width: 180,
  ellipsis: true,
  render: (_, r) => (
    <div>
      <div className="matricula-v2-table-career">
        <span
          className="matricula-v2-table-career__bar"
          style={{ background: sanitizeBusinessColor(r.career.color) }}
          aria-hidden
        />
        {r.career.name}
      </div>
      <div className="matricula-v2-table-career__sub">
        {r.semestre}° semestre · {r.materias} materias
      </div>
    </div>
  ),
};

const historyColumn = {
  title: 'Historial',
  key: 'history',
  width: 150,
  render: (_, r) => <StatusPill statusKey={r.historial} label={r.historyState?.label} />,
};

const pagoColumn = {
  title: 'Pago',
  key: 'pago',
  width: 96,
  render: (_, r) => (
    <span className="matricula-v2-table-expand__pago" data-status={pagoStatusOf(r.estadoPago).status}>
      {r.estadoPago}
    </span>
  ),
};

/** Gestión + fecha + tipo (6 columnas en vista full, sin columna Tipo aparte). */
const gestionColumn = {
  title: 'Gestión',
  key: 'gestion',
  width: 128,
  render: (_, r) => (
    <div className="matricula-v2-table-gestion">
      <div className="matricula-v2-table-gestion__year">{r.gestion}</div>
      <div className="matricula-v2-table-gestion__date">{r.fechaMatricula}</div>
      <span className="matricula-v2-table-gestion__tipo">
        <AdmissionTypeTag tipo={r.tipo} />
      </span>
    </div>
  ),
};

const compactStudentColumn = {
  title: 'Estudiante',
  key: 'student',
  className: 'matricula-v2-table-col-student',
  ellipsis: true,
  render: (_, r) => (
    <div className="matricula-v2-table-compact-student">
      <StudentCell student={r} />
      <div className="matricula-v2-table-compact-student__hint">
        Pulsa <strong>+</strong> para ver carrera, historial y más
      </div>
    </div>
  ),
};

/**
 * @param {{ handleView: Function, handleEdit: Function }} handlers
 * @param {{ layout?: 'compact' | 'narrow' | 'medium' | 'full' }} options
 */
export function buildMatriculaTableColumns(handlers, { layout = 'full' } = {}) {
  const menuOnly = layout === 'compact';
  const actionsCol = buildActionsColumn(handlers, { menuOnly });

  /** 6 columnas: estudiante, carrera, historial, pago, gestión (+ tipo), acciones */
  const fullColumns = [
    { ...studentColumn, width: 280 },
    { ...careerColumn, width: 190 },
    historyColumn,
    pagoColumn,
    gestionColumn,
    actionsCol,
  ];

  const mediumColumns = [
    { ...studentColumn, width: 200, className: 'matricula-v2-table-col-student' },
    { ...careerColumn, width: 160 },
    { ...historyColumn, width: 140 },
    actionsCol,
  ];

  const narrowColumns = [
    { ...studentColumn, width: 220, className: 'matricula-v2-table-col-student' },
    { ...careerColumn, width: 180 },
    actionsCol,
  ];

  const compactColumns = [compactStudentColumn, actionsCol];

  const columnsByLayout = {
    full: fullColumns,
    medium: mediumColumns,
    narrow: narrowColumns,
    compact: compactColumns,
  };

  return {
    fullColumns,
    mediumColumns,
    narrowColumns,
    compactColumns,
    columns: columnsByLayout[layout] ?? fullColumns,
  };
}
