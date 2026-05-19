/**
 * Columnas de la tabla de inscripciones (vista completa y compacta).
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
import { Button, Dropdown, Space, Tag, Tooltip } from 'antd';
import StatusPill from '../components/StatusPill';
import StudentCell from '../components/StudentCell';
import { mv2DropdownPopupProps, mv2TooltipProps } from '../theme/popupClass';

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

function buildActionsColumn(handlers, { menuOnly = false } = {}) {
  return {
    title: '',
    key: 'actions',
    width: menuOnly ? 52 : 72,
    align: 'right',
    render: (_, r) => {
      const menu = { items: rowActionMenuItems(r, handlers) };

      if (menuOnly) {
        return (
          <Dropdown {...mv2DropdownPopupProps} menu={menu} trigger={['click']}>
            <Button
              type="text"
              size="small"
              className="matricula-v2-action-icon--muted"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
              aria-label="Acciones"
            />
          </Dropdown>
        );
      }

      return (
        <Space size={2} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Ver detalle" {...mv2TooltipProps}>
            <Button
              type="text"
              size="small"
              className="matricula-v2-action-icon--info"
              icon={<EyeOutlined />}
              onClick={() => handlers.handleView(r)}
            />
          </Tooltip>
          <Tooltip title="Editar" {...mv2TooltipProps}>
            <Button
              type="text"
              size="small"
              className="matricula-v2-action-icon--warning"
              icon={<EditOutlined />}
              onClick={() => handlers.handleEdit(r)}
            />
          </Tooltip>
        </Space>
      );
    },
  };
}

/**
 * @param {{ handleView: Function, handleEdit: Function }} handlers
 * @param {{ menuOnly?: boolean }} options
 */
export function buildMatriculaTableColumns(handlers, { menuOnly = false } = {}) {
  const actionsCol = buildActionsColumn(handlers, { menuOnly });

  const fullColumns = [
    {
      title: 'Estudiante',
      key: 'student',
      width: 300,
      ellipsis: true,
      render: (_, r) => <StudentCell student={r} />,
    },
    {
      title: 'Carrera',
      key: 'career',
      width: 200,
      ellipsis: true,
      render: (_, r) => (
        <div>
          <div className="matricula-v2-table-career">
            <span
              className="matricula-v2-table-career__bar"
              style={{ background: r.career.color }}
              aria-hidden
            />
            {r.career.name}
          </div>
          <div className="matricula-v2-table-career__sub">
            {r.semestre}° semestre · {r.materias} materias
          </div>
        </div>
      ),
    },
    {
      title: 'Tipo',
      key: 'tipo',
      width: 100,
      render: (_, r) => (
        <Tag
          className="matricula-v2-table-tag"
          style={{
            background: r.isAntiguo ? 'var(--pill-warn-bg)' : 'var(--pill-ok-bg)',
            color: r.isAntiguo ? 'var(--pill-warn-fg)' : 'var(--pill-ok-fg)',
          }}
        >
          {r.tipo}
        </Tag>
      ),
    },
    {
      title: 'Historial',
      key: 'history',
      width: 160,
      render: (_, r) => <StatusPill statusKey={r.historial} label={r.historyState?.label} />,
    },
    {
      title: 'Pago',
      key: 'pago',
      width: 100,
      render: (_, r) => (
        <span
          className="matricula-v2-table-expand__pago"
          data-status={
            r.estadoPago === 'Al día' ? 'ok' : r.estadoPago === 'Pendiente' ? 'err' : 'info'
          }
        >
          {r.estadoPago}
        </span>
      ),
    },
    {
      title: 'Gestión',
      key: 'fecha',
      width: 120,
      render: (_, r) => (
        <div className="matricula-v2-table-gestion">
          <div className="matricula-v2-table-gestion__year">{r.gestion}</div>
          <div className="matricula-v2-table-gestion__date">{r.fechaMatricula}</div>
        </div>
      ),
    },
    actionsCol,
  ];

  const compactColumns = [
    {
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
    },
    actionsCol,
  ];

  return { fullColumns, compactColumns };
}
