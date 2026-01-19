/**
 * becasTableColumns - Configuración de columnas para la tabla de becas asignadas
 * 
 * Single Responsibility: Definir las columnas y su configuración para BecasTable
 * 
 * NOTA: Esta tabla muestra BECAS ASIGNADAS A ESTUDIANTES (estudiantes_becas),
 * no el catálogo de becas/descuentos (becas_descuentos).
 * Cada fila representa una beca asignada a un estudiante con datos enriquecidos.
 */

import { Tag } from 'antd';
import { DollarOutlined, PercentageOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de becas asignadas
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
                  Código: {student.codigoEstudiante}
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
      title: 'Gestión',
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
      render: (_, record) => {
        return (
          <TableCell actions align="right">
            <IconButton
              icon={<viewAction.icon />}
              variant={viewAction.variant}
              onClick={() => {
                // Ver detalle de la beca asignada o del estudiante
                if (record.studentId) {
                  navigate(`/estudiantes/${record.studentId}`);
                }
              }}
            />
            <IconButton
              icon={<editAction.icon />}
              variant={editAction.variant}
              onClick={() => {
                // TODO: Implementar edición de beca asignada
                console.log('Editar beca asignada:', record.id);
              }}
            />
            <IconButton
              icon={<deleteAction.icon />}
              variant={deleteAction.variant}
              onClick={() => {
                // TODO: Implementar lógica de eliminación
                console.log('Eliminar beca asignada:', record.id);
              }}
            />
          </TableCell>
        );
      },
    },
  ];
};
