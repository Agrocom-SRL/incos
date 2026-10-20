/**
 * tableColumns - Columnas de la tabla de inscripciones (matrículas).
 *
 * Lenguaje visual del prototipo de listado: `#` numérico + `IdentidadCelda` (estudiante) +
 * `InfoLinesCell` (celdas multi-línea), con las clases del design-system
 * (`styles/components/atoms/table-cells.css`). El tipo de inscripción conserva su chip de
 * color (reutiliza la paleta de admisión). Sin `Space orientation` (deprecado) ni estilos inline.
 */

import {
  CalendarOutlined, ApartmentOutlined, ReadOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, CarreraDotCell } from '@atoms';
import { TableActions } from '@molecules';
import { getAdmissionTypeTagStyle } from '@matricula/nuevo/config/admissionTypeColors';
import {
  isHistorialPrevioPendiente,
} from '@application-matricula/registro/utils/historialPrevioHelpers';

/**
 * Crea las columnas de la tabla de inscripciones
 *
 * @param {Function} navigate
 * @param {Function} refetch
 * @param {Function} deleteInscripcion
 * @param {Object} options - { isSmall: boolean }
 * @returns {Array}
 */
export const createInscripcionesTableColumns = (navigate, refetch = null, deleteInscripcion = null, options = {}) => {
  const { isSmall = false } = options;

  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    // Estudiante: identidad + historial previo pendiente como subestado bajo el nombre
    // (patrón PagoEstudianteCell — sin StatusPill)
    {
      title: 'Estudiante',
      dataIndex: 'estudiante',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (estudiante, record) => {
        const student = estudiante || record.student || record.enrollment?.student;
        const nombre = student?.nombreCompleto || student?.nombre || 'Sin nombre';
        const codigo = student?.codigoEstudiante ?? record.estudiante?.codigoEstudiante ?? record.codigo ?? record.enrollment?.codigo ?? (record.id ? `INS-${record.id}` : null);
        return (
          <div>
            <IdentidadCelda codigo={codigo} nombre={nombre.toUpperCase()} />
            {isHistorialPrevioPendiente(record) ? (
              <span className="cfg-identidad-substate cfg-identidad-substate--warning">
                <span className="cfg-identidad-substate__dot" aria-hidden />
                Historial previo pendiente
              </span>
            ) : null}
          </div>
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
    // Carrera (chip de color de la carrera)
    {
      title: 'Carrera',
      key: 'carrera',
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const carreraObj = record.carrera || record.enrollment?.carrera;
        return <CarreraDotCell nombre={carreraObj?.nombre} colorHex={carreraObj?.colorHex} />;
      },
      sorter: (a, b) => {
        const carreraA = (a.carrera || a.enrollment?.carrera)?.nombre || '';
        const carreraB = (b.carrera || b.enrollment?.carrera)?.nombre || '';
        return carreraA.localeCompare(carreraB);
      },
    },
    // Gestión y periodo
    {
      title: 'Gestión y periodo',
      key: 'gestionPeriodo',
      responsive: ['md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const periodoObj = record.periodo || record.enrollment?.periodo;
        const anioValue = record.gestion?.anio || record.anioCarrera || record.enrollment?.anioCarrera || null;
        return (
          <InfoLinesCell
            lines={[
              { icon: <CalendarOutlined />, label: anioValue ? `Gestión ${anioValue}` : null },
              { icon: <ReadOutlined />, label: periodoObj?.nombre || null },
            ]}
          />
        );
      },
    },
    // Paralelo y cantidad de materias
    {
      title: 'Paralelo y materias',
      key: 'paraleloMaterias',
      responsive: ['md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const paraleloObj = record.paralelo || record.enrollment?.paralelo;
        const paraleloLabel = paraleloObj?.nombre
          ? [paraleloObj.nombre, paraleloObj.turno].filter(Boolean).join(' · ')
          : null;
        const cantidad = record.cantidadMaterias ?? record.subjectEnrollments?.length ?? null;
        const materiasLabel =
          cantidad != null && cantidad !== ''
            ? Number(cantidad) === 1 ? '1 materia' : `${cantidad} materias`
            : null;
        return (
          <InfoLinesCell
            lines={[
              { icon: <ApartmentOutlined />, label: paraleloLabel ? `Paralelo ${paraleloLabel}` : null },
              { icon: <UnorderedListOutlined />, label: materiasLabel },
            ]}
          />
        );
      },
      sorter: (a, b) => {
        const countA = a.cantidadMaterias ?? a.subjectEnrollments?.length ?? 0;
        const countB = b.cantidadMaterias ?? b.subjectEnrollments?.length ?? 0;
        return countA - countB;
      },
    },
    // Tipo de inscripción (pill con look de Roles)
    {
      title: 'Tipo',
      key: 'tipo',
      width: 150,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const tipo = record.tipoInscripcion || record.enrollment?.tipoInscripcion || null;
        return tipo ? (
          <span className="cfg-materia-pill" style={getAdmissionTypeTagStyle(tipo)}>
            {tipo}
          </span>
        ) : (
          <span className="cfg-materia-pill cfg-materia-pill--default">—</span>
        );
      },
      sorter: (a, b) =>
        (a.tipoInscripcion || a.enrollment?.tipoInscripcion || '').localeCompare(
          b.tipoInscripcion || b.enrollment?.tipoInscripcion || '',
        ),
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

        const itemName = `la inscripción del estudiante ${estudianteNombre}`;
        const itemDetails = [
          { label: 'Estudiante', value: estudianteNombre },
          { label: 'Código', value: codigoEstudiante },
          { label: 'Carrera', value: carreraNombre },
          { label: 'Gestión', value: gestionAnio },
        ].filter(detail => detail.value && detail.value !== 'N/A' && detail.value !== 'Sin nombre');

        const historialPendiente = isHistorialPrevioPendiente(record);

        const handleEdit = () => {
          navigate(`/inscripciones/${inscripcionId}/editar`);
        };

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
            editTitle={historialPendiente ? 'Completar historial previo y editar' : 'Editar inscripción'}
            permisos={{
              ver: { codigo: 'matricula.inscribir', accion: 'DETALLE' },
              editar: { codigo: 'matricula.inscripcion.editar', accion: 'EDITAR' },
              eliminar: { codigo: 'matricula.inscripcion.editar', accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};

/**
 * Crea las columnas de la tabla de inscripciones para anular.
 * Reutiliza createInscripcionesTableColumns y reemplaza la columna de acciones.
 *
 * @param {Function} navigate
 * @param {Function} refetch
 * @param {Function} deleteInscripcion
 * @param {Object} options - { isSmall: boolean }
 * @returns {Array}
 */
export const createInscripcionesAnularTableColumns = (navigate, refetch = null, deleteInscripcion = null, options = {}) => {
  const baseColumns = createInscripcionesTableColumns(navigate, refetch, deleteInscripcion, options);

  // Reemplazar la columna de acciones con una versión específica para anular
  const accionesIndex = baseColumns.findIndex(col => col.key === 'acciones');

  if (accionesIndex !== -1) {
    baseColumns[accionesIndex] = {
      title: 'Acción',
      key: 'acciones',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const inscripcionId = record.id || record.enrollment?.id;

        const student = record.estudiante || record.student || record.enrollment?.student;
        const carrera = record.carrera || record.enrollment?.carrera;
        const gestion = record.gestion || record.enrollment?.gestion;

        const estudianteNombre = student?.nombreCompleto || student?.nombre || 'Sin nombre';
        const codigoEstudiante = student?.codigoEstudiante || student?.codigo || 'N/A';
        const carreraNombre = carrera?.nombre || 'N/A';
        const gestionAnio = gestion?.anio || gestion?.year || 'N/A';

        const itemName = `la inscripción del estudiante ${estudianteNombre}`;
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
            itemName={`anular ${itemName}`}
            itemDetails={itemDetails}
            viewPath={null}
            editPath={null}
            permisos={{
              eliminar: { codigo: 'matricula.inscripcion.editar', accion: 'ELIMINAR' },
            }}
          />
        );
      },
    };
  }

  return baseColumns;
};
