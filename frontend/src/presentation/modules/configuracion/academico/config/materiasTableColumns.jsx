/**
 * Columnas de la tabla de materias (tab Académico).
 */

import { Tooltip } from 'antd';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';
import { materiaEditarPath } from '@application-configuracion/academico/config/paths';

const getTipoTagColor = (tipo) => {
  const tipoMap = {
    TEORICA: 'blue',
    PRACTICA: 'success',
    TEORICA_PRACTICA: 'info',
  };
  return tipoMap[tipo] || 'default';
};

export const createMateriasTableColumns = (navigate) => {
  const editAction = getDataTableAction('edit');
  const viewAction = getDataTableAction('view');
  const deleteAction = getDataTableAction('delete');

  return [
    {
      title: 'Sigla',
      dataIndex: 'sigla',
      fixed: 'left',
      ellipsis: true,
      render: (sigla) => (
        <TableCell strong textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {sigla}
        </TableCell>
      ),
      sorter: (a, b) => (a.sigla || '').localeCompare(b.sigla || '', undefined, { numeric: true, sensitivity: 'base' }),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      ellipsis: true,
      render: (nombre, record) => (
        <TableCell
          strong
          fallback="Sin nombre"
          tag={record.tipo}
          tagColor={getTipoTagColor(record.tipo)}
          orientation="vertical"
        >
          {nombre}
        </TableCell>
      ),
      sorter: (a, b) => (a.nombre || 'Sin nombre').localeCompare(b.nombre || 'Sin nombre'),
    },
    {
      title: 'Clasificación',
      dataIndex: 'clasificacion',
      ellipsis: true,
      render: (clasificacion) => <TableCell>{clasificacion || '-'}</TableCell>,
      sorter: (a, b) => (a.clasificacion || '').localeCompare(b.clasificacion || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <TableCell actions align="right">
          <Tooltip title={`${editAction.tooltip} materia`}>
            <IconButton
              icon={<editAction.icon />}
              variant={editAction.variant}
              onClick={() => navigate(materiaEditarPath(record.id))}
            />
          </Tooltip>
          <Tooltip title={`${viewAction.tooltip} materia`}>
            <IconButton
              icon={<viewAction.icon />}
              variant={viewAction.variant}
              onClick={() => navigate(materiaEditarPath(record.id, { view: true }))}
            />
          </Tooltip>
          <Tooltip title={`${deleteAction.tooltip} materia`}>
            <IconButton
              icon={<deleteAction.icon />}
              variant={deleteAction.variant}
              onClick={() => {
                // TODO: Implementar lógica de eliminación
                console.log('Eliminar materia:', record.id);
              }}
            />
          </Tooltip>
        </TableCell>
      ),
    },
  ];
};
