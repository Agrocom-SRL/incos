/**
 * becasTableColumns - Configuraci?n de columnas para la tabla de becas asignadas
 * 
 * Single Responsibility: Definir las columnas y su configuraci?n para BecasTable
 * 
 * NOTA: Esta tabla muestra BECAS ASIGNADAS A ESTUDIANTES (estudiantes_becas),
 * no el cat?logo de becas/descuentos (becas_descuentos).
 * Cada fila representa una beca asignada a un estudiante con datos enriquecidos.
 */

import { Tag } from 'antd';
import { DollarOutlined, PercentageOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';

/**
 * Crea las columnas de la tabla de becas asignadas
 * 
 * @param {Function} navigate - Funci?n de navegaci?n de react-router
 * @param {Function} refetch - Funci?n para recargar los datos despu?s de eliminar
 * @returns {Array} Array de configuraci?n de columnas para Ant Design Table
 */
export const createBecasTableColumns = (navigate, refetch = null) => {

  return [
    {
      title: 'Estudiante',
      dataIndex: ['student', 'nombreCompleto'],
      ellipsis: true,
      render: (_, record) => {
        const student = record.student;
        return (
          <TableCell>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {student?.nombreCompleto || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                CI: {student?.ci || 'N/A'} {student?.expedicion ? `(${student.expedicion})` : ''}
              </div>
              {student?.codigoEstudiante && (
                <div style={{ fontSize: '11px', color: '#999' }}>
                  C?digo: {student.codigoEstudiante}
                </div>
              )}
            </div>
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const nameA = a.student?.nombreCompleto || '';
        const nameB = b.student?.nombreCompleto || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Tipo de Beca',
      dataIndex: ['scholarship', 'nombre'],
      ellipsis: true,
      render: (_, record) => {
        const scholarship = record.scholarship;
        return (
          <TableCell>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {scholarship?.nombre || 'N/A'}
              </div>
              {scholarship?.codigo && (
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {scholarship.codigo}
                </div>
              )}
            </div>
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const nameA = a.scholarship?.nombre || '';
        const nameB = b.scholarship?.nombre || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Descuento',
      dataIndex: ['scholarship', 'porcentaje'],
      ellipsis: true,
      render: (_, record) => {
        const scholarship = record.scholarship;
        if (scholarship?.porcentaje) {
          return (
            <TableCell icon={<PercentageOutlined />}>
              {scholarship.porcentaje}%
            </TableCell>
          );
        }
        return <TableCell>N/A</TableCell>;
      },
      sorter: (a, b) => {
        const percentA = a.scholarship?.porcentaje || 0;
        const percentB = b.scholarship?.porcentaje || 0;
        return percentA - percentB;
      },
    },
    {
      title: 'Gesti?n',
      dataIndex: ['management', 'codigo'],
      ellipsis: true,
      render: (_, record) => {
        const management = record.management;
        return (
          <TableCell icon={<CalendarOutlined />}>
            {management?.codigo || management?.nombre || management?.anio || 'N/A'}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const codeA = a.management?.codigo || '';
        const codeB = b.management?.codigo || '';
        return codeA.localeCompare(codeB);
      },
    },
    {
      title: 'Fecha Solicitud',
      dataIndex: 'requestDate',
      ellipsis: true,
      render: (fecha) => {
        if (!fecha) return <TableCell>N/A</TableCell>;
        const date = new Date(fecha);
        const formatted = date.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        return <TableCell>{formatted}</TableCell>;
      },
      sorter: (a, b) => {
        const dateA = new Date(a.requestDate || 0);
        const dateB = new Date(b.requestDate || 0);
        return dateA - dateB;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      width: 120,
      render: (estado) => {
        let color = 'default';
        let text = estado || 'N/A';
        
        if (estado === 'ACTIVA') {
          color = 'success';
        } else if (estado === 'PENDIENTE') {
          color = 'warning';
        } else if (estado === 'RECHAZADA' || estado === 'ANULADA') {
          color = 'error';
        }
        
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
      sorter: (a, b) => {
        const stateA = a.state || '';
        const stateB = b.state || '';
        return stateA.localeCompare(stateB);
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          navigate={navigate}
          refetch={refetch}
          useCaseKey="eliminarBecaDescuento"
          itemName={`la beca ${record.scholarship?.nombre || record.id}`}
          viewPath={record.studentId ? `/estudiantes/:id` : null}
          editPath={null}
          onEdit={() => {
            // TODO: Implementar edici?n de beca asignada
            console.log('Editar beca asignada:', record.id);
          }}
          onView={() => {
            // Ver detalle del estudiante si hay studentId
            if (record.studentId) {
              navigate(`/estudiantes/${record.studentId}`);
            }
          }}
        />
      ),
    },
  ];
};
