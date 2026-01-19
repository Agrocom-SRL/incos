/**
 * tableColumns - Configuración de columnas para la tabla de pagos
 * 
 * Single Responsibility: Definir las columnas y su configuración para PagosTable
 */

import { Tag } from 'antd';
import { DollarOutlined, UserOutlined, CalendarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de pagos
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createPagosTableColumns = (navigate) => {
  const viewAction = getDataTableAction('view');
  const editAction = getDataTableAction('edit');
  const deleteAction = getDataTableAction('delete');

  return [
    {
      title: 'Número de Recibo',
      dataIndex: 'numeroRecibo',
      fixed: 'left',
      ellipsis: true,
      render: (numeroRecibo) => (
        <TableCell
          strong
          textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}
        >
          {numeroRecibo || 'N/A'}
        </TableCell>
      ),
      sorter: (a, b) => (a.numeroRecibo || '').localeCompare(b.numeroRecibo || '', undefined, { numeric: true }),
    },
    {
      title: 'Estudiante',
      dataIndex: 'estudiante',
      ellipsis: true,
      render: (estudiante, record) => {
        const student = estudiante || record.student;
        const nombre = student?.nombreCompleto || student?.nombre || 'Sin nombre';
        return (
          <TableCell
            strong
            icon={<UserOutlined />}
            fallback="Sin estudiante"
          >
            {nombre}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const studentA = a.estudiante || a.student;
        const studentB = b.estudiante || b.student;
        const nombreA = studentA?.nombreCompleto || studentA?.nombre || '';
        const nombreB = studentB?.nombreCompleto || studentB?.nombre || '';
        return nombreA.localeCompare(nombreB);
      },
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      ellipsis: true,
      render: (concepto) => (
        <TableCell>
          {concepto || 'N/A'}
        </TableCell>
      ),
    },
    {
      title: 'Monto',
      dataIndex: 'montoTotal',
      width: 120,
      align: 'right',
      render: (montoTotal, record) => {
        const monto = montoTotal || record.montoTotal || 0;
        const descuento = record.descuentoBeca || 0;
        const montoFinal = monto - descuento;
        return (
          <TableCell icon={<DollarOutlined />} strong>
            Bs. {montoFinal.toFixed(2)}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const montoA = (a.montoTotal || 0) - (a.descuentoBeca || 0);
        const montoB = (b.montoTotal || 0) - (b.descuentoBeca || 0);
        return montoA - montoB;
      },
    },
    {
      title: 'Método de Pago',
      dataIndex: 'metodoPago',
      width: 150,
      render: (metodoPago) => (
        <TableCell icon={<CreditCardOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
          {metodoPago || 'N/A'}
        </TableCell>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaPago',
      width: 120,
      render: (fechaPago) => (
        <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
          {fechaPago || 'N/A'}
        </TableCell>
      ),
      sorter: (a, b) => {
        const fechaA = a.fechaPago || '';
        const fechaB = b.fechaPago || '';
        return new Date(fechaA) - new Date(fechaB);
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 100,
      render: (estado) => {
        const colorMap = {
          'APROBADO': 'success',
          'PENDIENTE': 'warning',
          'RECHAZADO': 'error',
        };
        return (
          <Tag color={colorMap[estado] || 'default'}>
            {estado || 'N/A'}
          </Tag>
        );
      },
      sorter: (a, b) => (a.estado || '').localeCompare(b.estado || ''),
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
              onClick={() => navigate(`/pagos/${record.id}`)}
            />
            <IconButton
              icon={<editAction.icon />}
              variant={editAction.variant}
              onClick={() => navigate(`/pagos/${record.id}/editar`)}
            />
            <IconButton
              icon={<deleteAction.icon />}
              variant={deleteAction.variant}
              onClick={() => {
                // TODO: Implementar lógica de eliminación
                console.log('Eliminar pago:', record.id);
              }}
            />
          </TableCell>
        );
      },
    },
  ];
};
