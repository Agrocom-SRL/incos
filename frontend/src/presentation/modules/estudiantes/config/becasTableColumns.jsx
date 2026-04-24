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
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';

/**
 * Crea las columnas de la tabla de becas asignadas
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Function} refetch - Función para recargar los datos después de eliminar
 * @param {Function} deleteBeca - Función para eliminar una beca asignada
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createBecasTableColumns = (navigate, refetch = null, deleteBeca = null) => {

  return [
    {
      title: 'Estudiante',
      dataIndex: ['student', 'nombreCompleto'],
      ellipsis: true,
      render: (_, record) => {
        const student = record.student;
        // Los datos vienen del backend en formato de presentación (español)
        const nombreCompleto = student?.nombreCompleto || 'N/A';
        const ci = student?.ci || 'N/A';
        const expedicion = student?.expedicion || '';
        const codigoEstudiante = student?.codigoEstudiante || null;
        
        return (
          <TableCell>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {nombreCompleto}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                CI: {ci} {expedicion ? `(${expedicion})` : ''}
              </div>
              {codigoEstudiante && (
                <div style={{ fontSize: '11px', color: '#999' }}>
                  Código: {codigoEstudiante}
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
        // Los datos vienen del backend en formato de presentación (español)
        const nombre = scholarship?.nombre || 'N/A';
        const codigo = scholarship?.codigo || null;
        
        return (
          <TableCell>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {nombre}
              </div>
              {codigo && (
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {codigo}
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
        // Los datos vienen del backend en formato de presentación (español)
        const porcentaje = scholarship?.porcentaje;
        
        if (porcentaje != null && porcentaje !== undefined) {
          return (
            <TableCell icon={<PercentageOutlined />}>
              {porcentaje}%
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
        // Los datos vienen del backend en formato de presentación (español)
        const codigo = management?.codigo || null;
        const nombre = management?.nombre || null;
        const anio = management?.anio || null;
        const gestionDisplay = codigo || nombre || anio || 'N/A';
        
        return (
          <TableCell icon={<CalendarOutlined />}>
            {gestionDisplay}
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
        // Extraer información para el diálogo de confirmación
        const estudianteNombre = record.student?.nombreCompleto || 'N/A';
        const codigoEstudiante = record.student?.codigoEstudiante || 'N/A';
        const becaNombre = record.scholarship?.nombre || 'N/A';
        const becaPorcentaje = record.scholarship?.porcentaje ? `${record.scholarship.porcentaje}%` : 'N/A';
        const gestionAnio = record.management?.anio || record.management?.codigo || 'N/A';
        const estado = record.state || 'N/A';

        const itemName = `la beca ${becaNombre} del estudiante ${estudianteNombre}`;
        const itemDetails = [
          { label: 'Estudiante', value: estudianteNombre },
          { label: 'Código', value: codigoEstudiante },
          { label: 'Beca', value: becaNombre },
          { label: 'Descuento', value: becaPorcentaje },
          { label: 'Gestión', value: String(gestionAnio) },
          { label: 'Estado', value: estado },
        ].filter((d) => d.value && d.value !== 'N/A' && d.value !== 'Sin nombre');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            useCaseKey={deleteBeca ? null : 'eliminarBecaDescuento'}
            deleteFn={deleteBeca}
            itemName={itemName}
            itemDetails={itemDetails}
            viewPath={record.studentId ? `/estudiantes/:id` : null}
            editPath={null}
            onEdit={() => {
              if (!record?.studentId || !record?.id) return;
              navigate('/estudiantes/becas/asignar', {
                state: {
                  studentId: Number(record.studentId),
                  studentName: record.student?.nombreCompleto || null,
                  returnListPath: '/estudiantes/becas/listar',
                  editBecaAsignada: {
                    id: Number(record.id),
                    scholarshipId: record.scholarship?.id ? Number(record.scholarship.id) : null,
                    observations: record.observations || '',
                  },
                },
              });
            }}
            onView={() => {
              // Ver detalle del estudiante si hay studentId
              if (record.studentId) {
                navigate(`/estudiantes/${record.studentId}`);
              }
            }}
          />
        );
      },
    },
  ];
};
