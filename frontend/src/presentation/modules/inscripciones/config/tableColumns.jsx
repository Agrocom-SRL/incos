/**
 * tableColumns - Configuración de columnas para la tabla de inscripciones
 * 
 * Single Responsibility: Definir las columnas y su configuración para InscripcionesTable
 */

import { Tag } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de inscripciones
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Function} refetch - Función para recargar los datos después de eliminar
 * @param {Function} deleteInscripcion - Función personalizada para eliminar (opcional, viene del contexto)
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createInscripcionesTableColumns = (navigate, refetch = null, deleteInscripcion = null) => {

  return [
    {
      title: 'Código',
      dataIndex: 'codigo',
      fixed: 'left',
      ellipsis: true,
      render: (codigo, record) => {
        // Priorizar código del estudiante o ID de inscripción como fallback
        const codigoValue = codigo
          || record.estudiante?.codigoEstudiante
          || record.enrollment?.codigo
          || `INS-${record.id}`
          || 'N/A';
        return (
          <TableCell
            strong
            textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}
          >
            {codigoValue}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const codigoA = a.codigo
          || a.estudiante?.codigoEstudiante
          || a.enrollment?.codigo
          || `INS-${a.id}`
          || '';
        const codigoB = b.codigo
          || b.estudiante?.codigoEstudiante
          || b.enrollment?.codigo
          || `INS-${b.id}`
          || '';
        return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' });
      },
    },
    {
      title: 'Estudiante',
      dataIndex: 'estudiante',
      ellipsis: true,
      render: (estudiante, record) => {
        // Priorizar el campo enriquecido del backend (estudiante con nombreCompleto)
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
        // Priorizar el campo enriquecido del backend (carrera con nombre)
        const carreraObj = carrera || record.carrera || record.enrollment?.carrera;
        const carreraNombre = carreraObj?.nombre || 'N/A';
        return (
          <TableCell icon={<BookOutlined />}>
            {carreraNombre}
          </TableCell>
        );
      },
      sorter: (a, b) => {
        const carreraA = (a.carrera || a.enrollment?.carrera)?.nombre || '';
        const carreraB = (b.carrera || b.enrollment?.carrera)?.nombre || '';
        return carreraA.localeCompare(carreraB);
      },
    },
    {
      title: 'Año',
      dataIndex: 'anio',
      width: 100,
      render: (anio, record) => {
        // Priorizar año de la gestión o año de carrera
        const anioValue = anio
          || record.gestion?.anio
          || record.anioCarrera
          || record.enrollment?.anioCarrera
          || 'N/A';
        return (
          <Tag color="blue">
            {anioValue}
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
        // Formatear fecha si es válida
        let fechaFormateada = fechaValue;
        if (fechaValue && fechaValue !== 'N/A') {
          try {
            const fechaObj = new Date(fechaValue);
            if (!isNaN(fechaObj.getTime())) {
              fechaFormateada = fechaObj.toLocaleDateString('es-BO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });
            }
          } catch (e) {
            // Si falla el formato, usar el valor original
          }
        }
        return (
          <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
            {fechaFormateada}
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
        // Priorizar tipoInscripcion como estado, o derivar de activo
        const estadoValue = estado
          || record.tipoInscripcion
          || record.enrollment?.tipoInscripcion
          || (record.activo ? 'ACTIVA' : 'INACTIVA')
          || record.enrollment?.estado
          || 'N/A';

        // Mapear tipos de inscripción a colores
        const getEstadoColor = (estado) => {
          if (estado === 'ACTIVA' || estado === 'NUEVO') return 'success';
          if (estado === 'INACTIVA' || estado === 'RETIRADO') return 'default';
          if (estado === 'CONTINUIDAD' || estado === 'REINGRESO') return 'blue';
          return 'default';
        };

        return (
          <Tag color={getEstadoColor(estadoValue)}>
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

        // Obtener periodoId y paraleloId del primer curso inscrito (para pre-seleccionar en edición)
        // Los cursos inscritos vienen en inscripcionesMaterias, materiasInscritas, o enrollmentSubjects
        // El curso tiene paraleloId que es el ID del paralelo
        const materiasInscritas = record.inscripcionesMaterias
          || record.materiasInscritas
          || record.enrollmentSubjects
          || record.enrollment?.inscripcionesMaterias
          || record.enrollment?.enrollmentSubjects
          || [];
        const primerMateria = materiasInscritas.length > 0 ? materiasInscritas[0] : null;

        // paraleloId y periodoId del primer curso inscrito (para pre-seleccionar en edición)
        let paraleloId = null;
        let periodoId = null;
        if (primerMateria) {
          const curso = primerMateria?.curso ?? primerMateria?.teacherAssignment?.course;
          paraleloId = curso?.paraleloId ?? curso?.paralelo_id ?? primerMateria?.paraleloId ?? primerMateria?.paralelo_id ?? null;
          periodoId = curso?.periodoId ?? curso?.periodo_id ?? primerMateria?.periodoId ?? primerMateria?.periodo_id ?? record.periodoId ?? record.enrollment?.periodoId ?? null;
        }

        const handleEdit = () => {
          if (!canEdit) return;
          navigate('/inscripciones/nueva', {
            state: {
              mode: 'editar',
              inscripcionId,
              studentId: estudianteId,
              carreraId,
              periodoId,
              paraleloId,
              tipoInscripcion, // NUEVO → solo paralelo editable; REINGRESO/CONTINUIDAD → periodo, materias, paralelo
            },
          });
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
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createInscripcionesAnularTableColumns = (navigate, refetch = null, deleteInscripcion = null) => {
  // Reutilizar las mismas columnas de visualización
  const baseColumns = createInscripcionesTableColumns(navigate, refetch, deleteInscripcion);

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
