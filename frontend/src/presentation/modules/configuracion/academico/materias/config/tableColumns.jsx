/**
 * tableColumns - Configuración de columnas para la tabla de materias
 * 
 * Single Responsibility: Definir las columnas y su configuración para MateriasTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Tooltip } from 'antd';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de materias
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createMateriasTableColumns = (navigate) => {
  // Obtener configuraciones de acciones desde la configuración centralizada
  const editAction = getDataTableAction('edit');
  const viewAction = getDataTableAction('view');
  const deleteAction = getDataTableAction('delete');

  // Mapeo de tipos de materia a colores de tag
  const getTipoTagColor = (tipo) => {
    const tipoMap = {
      'TEORICA': 'blue',
      'PRACTICA': 'success',
      'TEORICA_PRACTICA': 'info',
    };
    return tipoMap[tipo] || 'default';
  };

  return [
    {
      title: 'Sigla',
      dataIndex: 'sigla',
      fixed: 'left',
      ellipsis: true,
      render: (sigla) => (
        <TableCell
          strong
          textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}
        >
          {sigla}
        </TableCell>
      ),
      sorter: (a, b) => {
        const siglaA = a.sigla || '';
        const siglaB = b.sigla || '';
        return siglaA.localeCompare(siglaB, undefined, { numeric: true, sensitivity: 'base' });
      },
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
      sorter: (a, b) => {
        const nombreA = a.nombre || 'Sin nombre';
        const nombreB = b.nombre || 'Sin nombre';
        return nombreA.localeCompare(nombreB);
      },
    },
    {
      title: 'Clasificación',
      dataIndex: 'clasificacion',
      ellipsis: true,
      render: (clasificacion) => (
        <TableCell>
          {clasificacion || '-'}
        </TableCell>
      ),
      sorter: (a, b) => {
        const clasificacionA = a.clasificacion || '';
        const clasificacionB = b.clasificacion || '';
        return clasificacionA.localeCompare(clasificacionB);
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
            <Tooltip title={`${editAction.tooltip} materia`}>
              <IconButton
                icon={<editAction.icon />}
                variant={editAction.variant}
                onClick={() => navigate(`/configuracion/academico/materias/editar?materiaId=${record.id}`)}
              />
            </Tooltip>
            <Tooltip title={`${viewAction.tooltip} materia`}>
              <IconButton
                icon={<viewAction.icon />}
                variant={viewAction.variant}
                onClick={() => navigate(`/configuracion/academico/materias/editar?materiaId=${record.id}&view=true`)}
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
        );
      },
    },
  ];
};

