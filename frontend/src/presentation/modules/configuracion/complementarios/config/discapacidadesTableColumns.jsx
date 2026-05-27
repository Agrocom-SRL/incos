import { Tooltip } from 'antd';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';
import { discapacidadEditarPath } from '@application-configuracion/complementarios/config/paths';

export const createDiscapacidadesTableColumns = (navigate) => {
  const editAction = getDataTableAction('edit');
  const viewAction = getDataTableAction('view');
  const deleteAction = getDataTableAction('delete');

  return [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      fixed: 'left',
      ellipsis: true,
      render: (nombre) => (
        <TableCell strong fallback="Sin nombre">
          {nombre}
        </TableCell>
      ),
      sorter: (a, b) => (a.nombre || 'Sin nombre').localeCompare(b.nombre || 'Sin nombre'),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      ellipsis: true,
      render: (descripcion) => <TableCell>{descripcion || '-'}</TableCell>,
      sorter: (a, b) => (a.descripcion || '').localeCompare(b.descripcion || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <TableCell actions align="right">
          <Tooltip title={`${editAction.tooltip} tipo de discapacidad`}>
            <IconButton
              icon={<editAction.icon />}
              variant={editAction.variant}
              onClick={() => navigate(discapacidadEditarPath(record.id))}
            />
          </Tooltip>
          <Tooltip title={`${viewAction.tooltip} tipo de discapacidad`}>
            <IconButton
              icon={<viewAction.icon />}
              variant={viewAction.variant}
              onClick={() => navigate(discapacidadEditarPath(record.id, { view: true }))}
            />
          </Tooltip>
          <Tooltip title={`${deleteAction.tooltip} tipo de discapacidad`}>
            <IconButton
              icon={<deleteAction.icon />}
              variant={deleteAction.variant}
              onClick={() => {
                console.log('Eliminar discapacidad:', record.id);
              }}
            />
          </Tooltip>
        </TableCell>
      ),
    },
  ];
};
