/**
 * tableColumns - Configuración de columnas para la tabla de inscripciones
 * 
 * Single Responsibility: Definir las columnas y su configuración para InscripcionesTable
 */

import { Tag, message } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de inscripciones
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createInscripcionesTableColumns = (navigate) => {
  const viewAction = getDataTableAction('view');
  const editAction = getDataTableAction('edit');
  const deleteAction = getDataTableAction('delete');

  return [
    {
      title: 'Código',
      dataIndex: 'codigo',
      fixed: 'left',
      ellipsis: true,
      render: (codigo, record) => (
        <TableCell
          strong
          textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}
        >
          {codigo || record.enrollment?.codigo || 'N/A'}
        </TableCell>
      ),
      sorter: (a, b) => {
        const codigoA = a.codigo || a.enrollment?.codigo || '';
        const codigoB = b.codigo || b.enrollment?.codigo || '';
        return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' });
      },
    },
    {
      title: 'Estudiante',
      dataIndex: 'estudiante',
      ellipsis: true,
      render: (estudiante, record) => {
        const student = estudiante || record.student || record.enrollment?.student;
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
        const studentA = a.estudiante || a.student || a.enrollment?.student;
        const studentB = b.estudiante || b.student || b.enrollment?.student;
        const nombreA = studentA?.nombreCompleto || studentA?.nombre || '';
        const nombreB = studentB?.nombreCompleto || studentB?.nombre || '';
        return nombreA.localeCompare(nombreB);
      },
    },
    {
      title: 'Carrera',
      dataIndex: 'carrera',
      ellipsis: true,
      render: (carrera, record) => {
        const carreraNombre = carrera || record.carrera?.nombre || record.enrollment?.carrera?.nombre || 'N/A';
        return (
          <TableCell icon={<BookOutlined />}>
            {carreraNombre}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const carreraA = a.carrera?.nombre || a.enrollment?.carrera?.nombre || '';
        const carreraB = b.carrera?.nombre || b.enrollment?.carrera?.nombre || '';
        return carreraA.localeCompare(carreraB);
      },
    },
    {
      title: 'Año',
      dataIndex: 'anio',
      width: 100,
      render: (anio, record) => {
        const anioValue = anio || record.anioCarrera || record.enrollment?.anioCarrera || 'N/A';
        return (
          <Tag color="blue">
            {anioValue}
          </Tag>
        );
      },
    },
    {
      title: 'Paralelo',
      dataIndex: 'paralelo',
      width: 100,
      render: (paralelo, record) => {
        const paraleloValue = paralelo || record.paralelo?.nombre || record.enrollment?.paralelo?.nombre || 'N/A';
        return (
          <Tag color="green">
            {paraleloValue}
          </Tag>
        );
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaInscripcion',
      width: 120,
      render: (fecha, record) => {
        const fechaValue = fecha || record.fechaInscripcion || record.enrollment?.fechaInscripcion || 'N/A';
        return (
          <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
            {fechaValue}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const fechaA = a.fechaInscripcion || a.enrollment?.fechaInscripcion || '';
        const fechaB = b.fechaInscripcion || b.enrollment?.fechaInscripcion || '';
        return new Date(fechaA) - new Date(fechaB);
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 100,
      render: (estado, record) => {
        const estadoValue = estado || record.estado || record.enrollment?.estado || 'N/A';
        return (
          <Tag color={estadoValue === 'ACTIVA' ? 'success' : 'default'}>
            {estadoValue}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 150,
      align: 'right',
      render: (_, record) => {
        const inscripcionId = record.id || record.enrollment?.id;
        return (
          <TableCell actions align="right">
            <IconButton
              icon={<viewAction.icon />}
              variant={viewAction.variant}
              onClick={() => navigate(`/inscripciones/${inscripcionId}`)}
            />
            <IconButton
              icon={<editAction.icon />}
              variant={editAction.variant}
              onClick={() => {
                message.info('La funcionalidad de edición está en construcción');
                // TODO: Implementar edición de inscripción
                console.log('Editar inscripción:', inscripcionId);
              }}
            />
            <IconButton
              icon={<deleteAction.icon />}
              variant={deleteAction.variant}
              onClick={() => {
                // TODO: Implementar lógica de eliminación
                console.log('Eliminar inscripción:', inscripcionId);
              }}
            />
          </TableCell>
        );
      },
    },
  ];
};
