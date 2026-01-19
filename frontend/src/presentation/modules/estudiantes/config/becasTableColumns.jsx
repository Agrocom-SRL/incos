/**
 * becasTableColumns - Configuración de columnas para la tabla de becas
 * 
 * Single Responsibility: Definir las columnas y su configuración para BecasTable
 */

import { Tag } from 'antd';
import { DollarOutlined, PercentageOutlined } from '@ant-design/icons';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de becas
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createBecasTableColumns = (navigate) => {
  const viewAction = getDataTableAction('view');
  const editAction = getDataTableAction('edit');
  const deleteAction = getDataTableAction('delete');

  return [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      ellipsis: true,
      render: (nombre) => (
        <TableCell strong>
          {nombre || 'Sin nombre'}
        </TableCell>
      ),
      sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      ellipsis: true,
      render: (tipo) => (
        <Tag color={tipo === 'BECA' ? 'blue' : 'green'}>
          {tipo || 'N/A'}
        </Tag>
      ),
      sorter: (a, b) => (a.tipo || '').localeCompare(b.tipo || ''),
    },
    {
      title: 'Descuento',
      dataIndex: 'descuento',
      ellipsis: true,
      render: (_, record) => {
        if (record.porcentajeDescuento) {
          return (
            <TableCell icon={<PercentageOutlined />}>
              {record.porcentajeDescuento}%
            </TableCell>
          );
        }
        if (record.montoDescuento) {
          return (
            <TableCell icon={<DollarOutlined />}>
              Bs. {record.montoDescuento.toFixed(2)}
            </TableCell>
          );
        }
        return <TableCell>N/A</TableCell>;
      },
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      ellipsis: true,
      render: (descripcion) => (
        <TableCell textStyle={{ fontSize: 'var(--font-size-sm)' }}>
          {descripcion || 'Sin descripción'}
        </TableCell>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      width: 100,
      render: (activo) => (
        <Tag color={activo ? 'success' : 'default'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
      sorter: (a, b) => (a.activo ? 1 : 0) - (b.activo ? 1 : 0),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 150,
      align: 'right',
      render: (_, record) => {
        return (
          <TableCell actions align="right">
            <IconButton
              icon={<viewAction.icon />}
              variant={viewAction.variant}
              onClick={() => navigate(`/estudiantes/becas/${record.id}`)}
            />
            <IconButton
              icon={<editAction.icon />}
              variant={editAction.variant}
              onClick={() => navigate(`/estudiantes/becas/${record.id}/editar`)}
            />
            <IconButton
              icon={<deleteAction.icon />}
              variant={deleteAction.variant}
              onClick={() => {
                // TODO: Implementar lógica de eliminación
                console.log('Eliminar beca:', record.id);
              }}
            />
          </TableCell>
        );
      },
    },
  ];
};
