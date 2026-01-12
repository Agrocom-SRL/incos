/**
 * tableColumns - Configuración de columnas para la tabla de carreras
 * 
 * Single Responsibility: Definir las columnas y su configuración para CarrerasTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Tooltip } from 'antd';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de carreras
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createCarrerasTableColumns = (navigate) => {
  // Obtener configuraciones de acciones desde la configuración centralizada
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
        <TableCell
          strong
          textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}
        >
          {codigo}
        </TableCell>
      ),
      sorter: (a, b) => {
        const codigoA = a.codigo || '';
        const codigoB = b.codigo || '';
        return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' });
      },
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
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
    },
    {
      title: 'Área de Formación',
      dataIndex: 'areaFormacion',
      ellipsis: true,
      render: (areaFormacion) => (
        <TableCell>
          {areaFormacion || '-'}
        </TableCell>
      ),
      sorter: (a, b) => {
        const areaA = a.areaFormacion || '';
        const areaB = b.areaFormacion || '';
        return areaA.localeCompare(areaB);
      },
    },
    {
      title: 'Título Otorgado',
      dataIndex: 'tituloOtorgado',
      ellipsis: true,
      render: (tituloOtorgado) => (
        <TableCell>
          {tituloOtorgado || '-'}
        </TableCell>
      ),
      sorter: (a, b) => {
        const tituloA = a.tituloOtorgado || '';
        const tituloB = b.tituloOtorgado || '';
        return tituloA.localeCompare(tituloB);
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
            <Tooltip title={`${editAction.tooltip} carrera`}>
              <IconButton
                icon={<editAction.icon />}
                variant={editAction.variant}
                onClick={() => navigate(`/configuracion/academico/carreras/editar?carreraId=${record.id}`)}
              />
            </Tooltip>
            <Tooltip title={`${viewAction.tooltip} carrera`}>
              <IconButton
                icon={<viewAction.icon />}
                variant={viewAction.variant}
                onClick={() => navigate(`/configuracion/academico/carreras/editar?carreraId=${record.id}&view=true`)}
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
        );
      },
    },
  ];
};

