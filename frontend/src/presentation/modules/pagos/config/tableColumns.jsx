/**
 * tableColumns - Configuración de columnas para la tabla de pagos
 * 
 * Single Responsibility: Definir las columnas y su configuración para PagosTable
 */

import { Tag, message } from 'antd';
import { DollarOutlined, UserOutlined, CalendarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Helper para asegurar que un valor sea primitivo (string, number, etc.)
 * Si es un objeto, intenta extraer un valor útil o retorna 'N/A'
 * 
 * @param {any} value - Valor a convertir
 * @param {string} fallback - Valor por defecto si no se puede convertir
 * @returns {string|number} Valor primitivo
 */
const ensurePrimitive = (value, fallback = 'N/A') => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'object') {
    // Si es un objeto, intentar extraer propiedades comunes
    if (value.nombre) return value.nombre;
    if (value.codigo) return value.codigo;
    if (value.nombreCompleto) return value.nombreCompleto;
    if (value.id) return String(value.id);
    return fallback;
  }
  return value;
};

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
      render: (numeroRecibo, record) => {
        // Manejar tanto numeroRecibo como receipt_number (del backend)
        // El backend retorna receipt_number desde el mapper
        const numero = ensurePrimitive(
          numeroRecibo || record.receipt_number || record.numeroRecibo || record.receiptNumber,
          'N/A'
        );
        return (
          <TableCell
            strong
            textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}
          >
            {numero}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const numA = a.receipt_number || a.numeroRecibo || a.receiptNumber || '';
        const numB = b.receipt_number || b.numeroRecibo || b.receiptNumber || '';
        return numA.localeCompare(numB, undefined, { numeric: true });
      },
    },
    {
      title: 'Estudiante',
      dataIndex: 'estudiante',
      ellipsis: true,
      render: (estudiante, record) => {
        // Manejar tanto objeto enriquecido como objeto anidado o ID
        const student = estudiante || record.student || record.estudiante;
        const nombre = typeof student === 'object' && student !== null
          ? (student.nombreCompleto || `${student.nombre || ''} ${student.apellidoPaterno || ''} ${student.apellidoMaterno || ''}`.trim() || 'Sin nombre')
          : 'Sin nombre';
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
        const nombreA = typeof studentA === 'object' && studentA !== null
          ? (studentA.nombreCompleto || `${studentA.nombre || ''} ${studentA.apellidoPaterno || ''} ${studentA.apellidoMaterno || ''}`.trim())
          : '';
        const nombreB = typeof studentB === 'object' && studentB !== null
          ? (studentB.nombreCompleto || `${studentB.nombre || ''} ${studentB.apellidoPaterno || ''} ${studentB.apellidoMaterno || ''}`.trim())
          : '';
        return nombreA.localeCompare(nombreB);
      },
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      ellipsis: true,
      render: (concepto, record) => {
        // Asegurar que concepto sea un valor primitivo
        const conceptoValue = ensurePrimitive(concepto || record.concepto || record.concept, 'N/A');
        return (
          <TableCell>
            {conceptoValue}
          </TableCell>
        );
      },
    },
    {
      title: 'Monto',
      dataIndex: 'montoTotal',
      width: 120,
      align: 'right',
      render: (montoTotal, record) => {
        // Manejar tanto montoTotal como total_amount (del backend)
        const monto = montoTotal || record.montoTotal || record.total_amount || 0;
        // Manejar tanto descuentoBeca como scholarship_discount (del backend)
        const descuento = record.descuentoBeca || record.scholarship_discount || record.descuentoBeca || 0;
        const montoFinal = monto - descuento;
        return (
          <TableCell icon={<DollarOutlined />} strong>
            Bs. {montoFinal.toFixed(2)}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const montoA = (a.montoTotal || a.total_amount || 0) - (a.descuentoBeca || a.scholarship_discount || 0);
        const montoB = (b.montoTotal || b.total_amount || 0) - (b.descuentoBeca || b.scholarship_discount || 0);
        return montoA - montoB;
      },
    },
    {
      title: 'Método de Pago',
      dataIndex: 'metodoPago',
      width: 150,
      render: (metodoPago, record) => {
        // Manejar tanto objeto enriquecido como string/ID
        const metodoPagoNombre = typeof metodoPago === 'object' && metodoPago !== null
          ? metodoPago.nombre || metodoPago.codigo || 'N/A'
          : metodoPago || record.paymentMethod || 'N/A';
        return (
          <TableCell icon={<CreditCardOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
            {metodoPagoNombre}
          </TableCell>
        );
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaPago',
      width: 120,
      render: (fechaPago, record) => {
        // Manejar tanto fechaPago como payment_date (del backend)
        const fecha = ensurePrimitive(
          fechaPago || record.fechaPago || record.payment_date,
          'N/A'
        );
        return (
          <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
            {fecha}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const fechaA = a.fechaPago || a.payment_date || '';
        const fechaB = b.fechaPago || b.payment_date || '';
        return new Date(fechaA) - new Date(fechaB);
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 100,
      render: (estado, record) => {
        // Asegurar que estado sea un valor primitivo
        const estadoValue = ensurePrimitive(estado || record.estado, 'N/A');
        const colorMap = {
          'APROBADO': 'success',
          'PENDIENTE': 'warning',
          'RECHAZADO': 'error',
        };
        return (
          <Tag color={colorMap[estadoValue] || 'default'}>
            {estadoValue}
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
              onClick={() => {
                message.info('La funcionalidad de edición está en construcción');
                // TODO: Implementar edición de pago
                console.log('Editar pago:', record.id);
              }}
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
