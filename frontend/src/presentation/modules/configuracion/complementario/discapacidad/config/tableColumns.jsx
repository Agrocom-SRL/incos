/**
 * tableColumns - Configuración de columnas para la tabla de discapacidades
 * 
 * Single Responsibility: Definir las columnas y su configuración para DiscapacidadesTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Tooltip } from 'antd';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de discapacidades
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createDiscapacidadesTableColumns = (navigate) => {
  // Obtener configuraciones de acciones desde la configuración centralizada
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
        <TableCell
          strong
          fallback="Sin nombre"
        >
          {nombre}
        </TableCell>
      ),
      sorter: (a, b) => {
        const nombreA = a.nombre || 'Sin nombre';
        const nombreB = b.nombre || 'Sin nombre';
        return nombreA.localeCompare(nombreB);
      },
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      ellipsis: true,
      render: (descripcion) => (
        <TableCell>
          {descripcion || '-'}
        </TableCell>
      ),
      sorter: (a, b) => {
        const descA = a.descripcion || '';
        const descB = b.descripcion || '';
        return descA.localeCompare(descB);
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 140,
      align: 'right',
      render: (_, record) => {
        return (
          <TableCell
            actions
            align="right"
          >
            <Tooltip title={`${editAction.tooltip} tipo de discapacidad`}>
              <IconButton
                icon={<editAction.icon />}
                variant={editAction.variant}
                onClick={() => navigate(`/configuracion/datos-complementarios/discapacidad/editar?discapacidadId=${record.id}`)}
              />
            </Tooltip>
            <Tooltip title={`${viewAction.tooltip} tipo de discapacidad`}>
              <IconButton
                icon={<viewAction.icon />}
                variant={viewAction.variant}
                onClick={() => navigate(`/configuracion/datos-complementarios/discapacidad/editar?discapacidadId=${record.id}&view=true`)}
              />
            </Tooltip>
            <Tooltip title={`${deleteAction.tooltip} tipo de discapacidad`}>
              <IconButton
                icon={<deleteAction.icon />}
                variant={deleteAction.variant}
                onClick={() => {
                  // TODO: Implementar lógica de eliminación
                  console.log('Eliminar discapacidad:', record.id);
                }}
              />
            </Tooltip>
          </TableCell>
        );
      },
    },
  ];
};

