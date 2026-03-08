/**
 * tableColumns - Configuración de columnas para la tabla de inscripciones
 *
 * Mismo diseño que lista de estudiantes: columnas con varios datos (Space vertical),
 * responsive y opciones (isSmall) para ancho de acciones.
 */

import { Tag, Space } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined, TagOutlined, IdcardOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';
import { getAdmissionTypeTagStyle } from '../../estudiantes/config/admissionTypeColors';

/** Mapear tipo de inscripción → tipo de admisión para reutilizar getAdmissionTypeTagStyle (mismos colores que estudiantes) */
const mapEstadoToAdmissionType = (valor) => {
  const v = String(valor || '').toUpperCase();
  if (v === 'NUEVO' || v === 'ACTIVA') return 'NUEVO';
  if (v === 'REINGRESO' || v === 'CONTINUIDAD') return 'ANTIGUO';
  if (v === 'TRASPASO') return 'TRASPASO';
  if (v === 'TRANSITABILIDAD') return 'TRANSITABILIDAD';
  return null;
};

/**
 * Crea las columnas de la tabla de inscripciones
 *
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Function} refetch - Función para recargar los datos después de eliminar
 * @param {Function} deleteInscripcion - Función personalizada para eliminar (opcional, viene del contexto)
 * @param {Object} options - Opciones de presentación (ej: { isSmall: boolean })
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createInscripcionesTableColumns = (navigate, refetch = null, deleteInscripcion = null, options = {}) => {
  const { isSmall = false } = options;

  return [
    {
      title: 'Gestión y fecha',
      key: 'gestionFecha',
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const anioValue = record.gestion?.anio || record.anioCarrera || record.enrollment?.anioCarrera || null;
        const fechaValue = record.fechaInscripcion || record.enrollment?.fechaInscripcion || null;
        let fechaFormateada = fechaValue;
        if (fechaValue) {
          try {
            const d = new Date(fechaValue);
            if (!isNaN(d.getTime())) {
              fechaFormateada = d.toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' });
            }
          } catch (e) {
            fechaFormateada = fechaValue;
          }
        }
        const hasAny = anioValue || fechaFormateada;
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            {anioValue && (
              <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
                Gestión {anioValue}
              </TableCell>
            )}
            {fechaFormateada && (
              <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
                {fechaFormateada}
              </TableCell>
            )}
            {!hasAny && (
              <TableCell icon={<CalendarOutlined />} fallback="—" textStyle={{ fontSize: 'var(--font-size-sm)' }}>
                —
              </TableCell>
            )}
          </Space>
        );
      },
      sorter: (a, b) => {
        const fechaA = a.fechaInscripcion || a.enrollment?.fechaInscripcion || '';
        const fechaB = b.fechaInscripcion || b.enrollment?.fechaInscripcion || '';
        return new Date(fechaA) - new Date(fechaB);
      },
    },
    {
      title: 'Estudiante',
      dataIndex: 'estudiante',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (estudiante, record) => {
        const student = estudiante || record.student || record.enrollment?.student;
        const nombre = student?.nombreCompleto || student?.nombre || 'Sin nombre';
        const codigo = student?.codigoEstudiante ?? record.estudiante?.codigoEstudiante ?? record.codigo ?? record.enrollment?.codigo ?? (record.id ? `INS-${record.id}` : null) ?? '—';
        const ci = student?.ci != null ? [student.ci, student.expedicion].filter(Boolean).join(' ') : '—';
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            <TableCell strong icon={<UserOutlined />} fallback="Sin estudiante" textStyle={{ fontSize: 'var(--font-size-md)' }} size="small">
              {nombre}
            </TableCell>
            {codigo && codigo !== '—' && (
              <TableCell icon={<IdcardOutlined />} textStyle={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }} size="small">
                {codigo}
              </TableCell>
            )}
            {ci && ci !== '—' && (
              <TableCell textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
                CI {ci}
              </TableCell>
            )}
          </Space>
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
      title: 'Datos de inscripción',
      key: 'datosInscripcion',
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const carreraObj = record.carrera || record.enrollment?.carrera;
        const carreraNombre = carreraObj?.nombre || null;
        const estadoValue = record.tipoInscripcion
          || record.enrollment?.tipoInscripcion
          || (record.activo ? 'ACTIVA' : 'INACTIVA')
          || record.enrollment?.estado
          || 'N/A';
        const admissionKey = mapEstadoToAdmissionType(estadoValue);
        const tagStyle = getAdmissionTypeTagStyle(admissionKey ?? undefined);

        const hasAny = carreraNombre || estadoValue;
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            {carreraNombre && (
              <TableCell
                strong
                icon={<BookOutlined />}
                textStyle={{ fontSize: 'var(--font-size-md)' }}
                size="small"
              >
                {carreraNombre}
              </TableCell>
            )}
            {estadoValue && (
              <TableCell
                icon={<TagOutlined />}
                fallback=""
                textStyle={{ fontSize: 'var(--font-size-sm)' }}
                size="small"
              >
                <Tag style={tagStyle}>{estadoValue}</Tag>
              </TableCell>
            )}
            {!hasAny && (
              <TableCell icon={<BookOutlined />} fallback="—" textStyle={{ fontSize: 'var(--font-size-sm)' }}>
                —
              </TableCell>
            )}
          </Space>
        );
      },
      sorter: (a, b) => {
        const carreraA = (a.carrera || a.enrollment?.carrera)?.nombre || '';
        const carreraB = (b.carrera || b.enrollment?.carrera)?.nombre || '';
        return carreraA.localeCompare(carreraB);
      },
    },
    {
      title: 'Materias',
      key: 'materias',
      width: 140,
      ellipsis: true,
      responsive: ['md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const cantidad = record.cantidadMaterias ?? record.enrollmentSubjects?.length ?? null;
        if (cantidad == null || cantidad === '') {
          return (
            <TableCell icon={<UnorderedListOutlined />} fallback="—" textStyle={{ fontSize: 'var(--font-size-sm)' }}>
              —
            </TableCell>
          );
        }
        const label = Number(cantidad) === 1 ? '1 materia' : `${cantidad} materias`;
        return (
          <TableCell icon={<UnorderedListOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
            {label}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const countA = a.cantidadMaterias ?? a.enrollmentSubjects?.length ?? 0;
        const countB = b.cantidadMaterias ?? b.enrollmentSubjects?.length ?? 0;
        return countA - countB;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: isSmall ? 140 : 180,
      align: 'right',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const inscripcionId = record.id || record.enrollment?.id;

        // Extraer información descriptiva de la inscripción para el diálogo
        const student = record.estudiante || record.student || record.enrollment?.student;
        const carrera = record.carrera || record.enrollment?.carrera;
        const gestion = record.gestion || record.enrollment?.gestion;

        const estudianteNombre = student?.nombreCompleto || student?.nombre || 'Sin nombre';
        const codigoEstudiante = student?.codigoEstudiante || student?.codigo || 'N/A';
        const carreraNombre = carrera?.nombre || 'N/A';
        const gestionAnio = gestion?.anio || gestion?.year || 'N/A';

        // Construir nombre descriptivo para el diálogo
        const itemName = `la inscripción del estudiante ${estudianteNombre}`;

        // Detalles para mostrar en el diálogo
        const itemDetails = [
          { label: 'Estudiante', value: estudianteNombre },
          { label: 'Código', value: codigoEstudiante },
          { label: 'Carrera', value: carreraNombre },
          { label: 'Gestión', value: gestionAnio },
        ].filter(detail => detail.value && detail.value !== 'N/A' && detail.value !== 'Sin nombre');

        // Permitir editar NUEVO (solo paralelo) y ANTIGUO - REINGRESO/CONTINUIDAD (periodo, materias, paralelo)
        // Estudiante y carrera no se editan aquí; se gestionan en registro de estudiantes
        const tipoInscripcion = record.tipoInscripcion
          || record.tipo_inscripcion
          || record.enrollment?.tipoInscripcion
          || record.enrollment?.tipo_inscripcion
          || record.enrollmentType
          || null;
        const canEdit = ['NUEVO', 'REINGRESO', 'CONTINUIDAD'].includes(tipoInscripcion);

        // Extraer datos necesarios para la edición
        const estudianteId = student?.id || record.estudianteId || record.enrollment?.estudianteId;
        const carreraId = carrera?.id || record.carreraId || record.enrollment?.carreraId;

        const handleEdit = () => {
          if (!canEdit) return;
          navigate(`/inscripciones/${inscripcionId}/editar`);
        };

        // Mostrar el botón de editar, deshabilitado si no se puede editar
        // Habilitar eliminar desde la lista (anular inscripción)
        return (
          <TableActions
            record={{ ...record, id: inscripcionId }}
            navigate={navigate}
            refetch={refetch}
            useCaseKey={deleteInscripcion ? null : "eliminarInscripcion"}
            deleteFn={deleteInscripcion}
            itemName={`anular ${itemName}`}
            itemDetails={itemDetails}
            viewPath="/inscripciones/:id"
            editPath={null}
            onEdit={handleEdit}
            editDisabled={!canEdit}
          />
        );
      },
    },
  ];
};

/**
 * Crea las columnas de la tabla de inscripciones para anular
 * Similar a createInscripcionesTableColumns pero enfocada solo en anular
 *
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Function} refetch - Función para recargar los datos después de anular
 * @param {Function} deleteInscripcion - Función personalizada para eliminar/anular (opcional, viene del contexto)
 * @param {Object} options - Opciones de presentación (ej: { isSmall: boolean })
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createInscripcionesAnularTableColumns = (navigate, refetch = null, deleteInscripcion = null, options = {}) => {
  const baseColumns = createInscripcionesTableColumns(navigate, refetch, deleteInscripcion, options);

  // Reemplazar la columna de acciones con una versión específica para anular
  const accionesIndex = baseColumns.findIndex(col => col.key === 'acciones');

  if (accionesIndex !== -1) {
    baseColumns[accionesIndex] = {
      title: 'Acción',
      key: 'acciones',
      fixed: 'right',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const inscripcionId = record.id || record.enrollment?.id;

        // Extraer información descriptiva de la inscripción para el diálogo
        const student = record.estudiante || record.student || record.enrollment?.student;
        const carrera = record.carrera || record.enrollment?.carrera;
        const gestion = record.gestion || record.enrollment?.gestion;

        const estudianteNombre = student?.nombreCompleto || student?.nombre || 'Sin nombre';
        const codigoEstudiante = student?.codigoEstudiante || student?.codigo || 'N/A';
        const carreraNombre = carrera?.nombre || 'N/A';
        const gestionAnio = gestion?.anio || gestion?.year || 'N/A';

        // Construir nombre descriptivo para el diálogo de anulación
        const itemName = `la inscripción del estudiante ${estudianteNombre}`;

        // Detalles para mostrar en el diálogo
        const itemDetails = [
          { label: 'Estudiante', value: estudianteNombre },
          { label: 'Código', value: codigoEstudiante },
          { label: 'Carrera', value: carreraNombre },
          { label: 'Gestión', value: gestionAnio },
        ].filter(detail => detail.value && detail.value !== 'N/A' && detail.value !== 'Sin nombre');

        return (
          <TableActions
            record={{ ...record, id: inscripcionId }}
            navigate={navigate}
            refetch={refetch}
            useCaseKey={deleteInscripcion ? null : "eliminarInscripcion"}
            deleteFn={deleteInscripcion}
            itemName={`anular ${itemName}`} // Personalizar el mensaje para indicar que es anulación
            itemDetails={itemDetails}
            viewPath={null} // No permitir ver en modo anular
            editPath={null} // No permitir editar en modo anular
          />
        );
      },
    };
  }

  return baseColumns;
};
