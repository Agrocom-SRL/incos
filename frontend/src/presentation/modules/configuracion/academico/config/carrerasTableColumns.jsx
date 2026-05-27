/**
 * Columnas de la tabla de carreras (tab Académico).
 */

import { Tooltip } from 'antd';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';
import { carreraEditarPath } from '@application-configuracion/academico/config/paths';

export const createCarrerasTableColumns = (navigate) => {
  const editAction = getDataTableAction('edit');
  const viewAction = getDataTableAction('view');
  const deleteAction = getDataTableAction('delete');

  return [
    {
      title: 'Código',
      dataIndex: 'codigo',
      fixed: 'left',
      ellipsis: true,
      render: (codigo) => (
        <TableCell strong textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {codigo}
        </TableCell>
      ),
      sorter: (a, b) => (a.codigo || '').localeCompare(b.codigo || '', undefined, { numeric: true, sensitivity: 'base' }),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      ellipsis: true,
      render: (nombre) => (
        <TableCell strong fallback="Sin nombre">
          {nombre}
        </TableCell>
      ),
      sorter: (a, b) => (a.nombre || 'Sin nombre').localeCompare(b.nombre || 'Sin nombre'),
    },
    {
      title: 'Área de Formación',
      dataIndex: 'areaFormacion',
      ellipsis: true,
      render: (areaFormacion) => <TableCell>{areaFormacion || '-'}</TableCell>,
      sorter: (a, b) => (a.areaFormacion || '').localeCompare(b.areaFormacion || ''),
    },
    {
      title: 'Título Otorgado',
      dataIndex: 'tituloOtorgado',
      ellipsis: true,
      render: (tituloOtorgado) => <TableCell>{tituloOtorgado || '-'}</TableCell>,
      sorter: (a, b) => (a.tituloOtorgado || '').localeCompare(b.tituloOtorgado || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <TableCell actions align="right">
          <Tooltip title={`${editAction.tooltip} carrera`}>
            <IconButton
              icon={<editAction.icon />}
              variant={editAction.variant}
              onClick={() => navigate(carreraEditarPath(record.id))}
            />
          </Tooltip>
          <Tooltip title={`${viewAction.tooltip} carrera`}>
            <IconButton
              icon={<viewAction.icon />}
              variant={viewAction.variant}
              onClick={() => navigate(carreraEditarPath(record.id, { view: true }))}
            />
          </Tooltip>
          <Tooltip title={`${deleteAction.tooltip} carrera`}>
            <IconButton
              icon={<deleteAction.icon />}
              variant={deleteAction.variant}
              onClick={() => {
                // TODO: Implementar lógica de eliminación
                console.log('Eliminar carrera:', record.id);
              }}
            />
          </Tooltip>
        </TableCell>
      ),
    },
  ];
};
