/**
 * tableColumns - Columnas de la tabla de inscripciones (matrículas).
 *
 * Lenguaje visual del prototipo de listado: `#` numérico + `IdentidadCelda` (estudiante) +
 * `InfoLinesCell` (celdas multi-línea), con las clases del design-system
 * (`styles/components/atoms/table-cells.css`). El tipo de inscripción conserva su chip de
 * color (reutiliza la paleta de admisión). Sin `Space orientation` (deprecado) ni estilos inline.
 */

import { Flex, Tag } from 'antd';
import {
  CalendarOutlined, TagOutlined, ApartmentOutlined, ReadOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { getAdmissionTypeTagStyle } from '../../estudiantes/config/admissionTypeColors';
import {
  isHistorialPrevioPendiente,
} from '@application-inscripciones/utils/historialPrevioHelpers';

/** Mapear tipo de inscripción → tipo de admisión para reutilizar getAdmissionTypeTagStyle */
const mapEstadoToAdmissionType = (valor) => {
  const v = String(valor || '').toUpperCase();
  if (v === 'NUEVO' || v === 'ACTIVA') return 'NUEVO';
  if (v === 'ANTIGUO') return 'ANTIGUO';
  if (v === 'TRASPASO') return 'TRASPASO';
  if (v === 'TRANSITABILIDAD') return 'TRANSITABILIDAD';
  return null;
};

/** Punto de color (data-driven) para chip de carrera. */
const colorDot = (color) => (
  <span
    style={{
      width: 10, height: 10, borderRadius: 999,
      background: color || 'var(--border, #d1d5db)', display: 'inline-block',
    }}
  />
);

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
    {
      title: 'Estudiante',
      dataIndex: 'estudiante',
      fixed: 'left',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (estudiante, record) => {
        const student = estudiante || record.student || record.enrollment?.student;
        const carreraObj = record.carrera || record.enrollment?.carrera;
        const nombre = student?.nombreCompleto || student?.nombre || 'Sin nombre';
        const codigo = student?.codigoEstudiante ?? record.estudiante?.codigoEstudiante ?? record.codigo ?? record.enrollment?.codigo ?? (record.id ? `INS-${record.id}` : null);
        return <IdentidadCelda codigo={codigo} nombre={nombre.toUpperCase()} accentColor={carreraObj?.colorHex || undefined} />;
      },
      sorter: (a, b) => {
        const studentA = a.estudiante || a.student || a.enrollment?.student;
        const studentB = b.estudiante || b.student || b.enrollment?.student;
        const nombreA = studentA?.nombreCompleto || studentA?.nombre || '';
        const nombreB = studentB?.nombreCompleto || studentB?.nombre || '';
        return nombreA.localeCompare(nombreB);
      },
    },
    // Carrera + tipo de inscripción (chip de color)
    {
      title: 'Carrera',
      key: 'carrera',
      width: 220,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const carreraObj = record.carrera || record.enrollment?.carrera;
        const carreraNombre = carreraObj?.nombre || null;
        const carreraCodigo = carreraObj?.codigo || null;
        const tipo = record.tipoInscripcion || record.enrollment?.tipoInscripcion || null;
        const tagStyle = getAdmissionTypeTagStyle(mapEstadoToAdmissionType(tipo) ?? undefined);
        return (
          <InfoLinesCell
            lines={[
              {
                icon: colorDot(carreraObj?.colorHex),
                label: carreraNombre
                  ? `${carreraNombre}${carreraCodigo ? ` · ${carreraCodigo}` : ''}`
                  : null,
              },
              { icon: <TagOutlined />, label: tipo ? <Tag style={tagStyle}>{tipo}</Tag> : null },
            ]}
          />
        );
      },
      sorter: (a, b) => {
        const carreraA = (a.carrera || a.enrollment?.carrera)?.nombre || '';
        const carreraB = (b.carrera || b.enrollment?.carrera)?.nombre || '';
        return carreraA.localeCompare(carreraB);
      },
    },
    // Paralelo · Periodo · Gestión
    {
      title: 'Paralelo y periodo',
      key: 'paraleloPeriodo',
      width: 200,
      responsive: ['md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const paraleloObj = record.paralelo || record.enrollment?.paralelo;
        const periodoObj = record.periodo || record.enrollment?.periodo;
        const paraleloLabel = paraleloObj?.nombre
          ? [paraleloObj.nombre, paraleloObj.turno].filter(Boolean).join(' · ')
          : null;
        const anioValue = record.gestion?.anio || record.anioCarrera || record.enrollment?.anioCarrera || null;
        return (
          <InfoLinesCell
            lines={[
              { icon: <ApartmentOutlined />, label: paraleloLabel ? `Paralelo ${paraleloLabel}` : null },
              { icon: <ReadOutlined />, label: periodoObj?.nombre || null },
              { icon: <CalendarOutlined />, label: anioValue ? `Gestión ${anioValue}` : null },
            ]}
          />
        );
      },
    },
    // Materias + estado real (activo + historial previo)
    {
      title: 'Materias y estado',
      key: 'materiasEstado',
      width: 170,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const cantidad = record.cantidadMaterias ?? record.subjectEnrollments?.length ?? null;
        const historialPendiente = isHistorialPrevioPendiente(record);
        const activo = record.activo ?? record.enrollment?.activo ?? true;
        const materiasLabel =
          cantidad != null && cantidad !== ''
            ? Number(cantidad) === 1 ? '1 materia' : `${cantidad} materias`
            : null;

        return (
          <Flex vertical align="flex-start" gap={6}>
            <InfoLinesCell lines={[{ icon: <UnorderedListOutlined />, label: materiasLabel }]} />
            <StatusPill
              label={activo ? 'ACTIVA' : 'ANULADA'}
              className={`cfg-materia-pill ${activo ? 'cfg-materia-pill--success' : 'cfg-materia-pill--danger'}`}
            />
            {historialPendiente ? (
              <StatusPill label="Historial pendiente" className="cfg-materia-pill cfg-materia-pill--warning" />
            ) : null}
          </Flex>
        );
      },
      sorter: (a, b) => {
        const countA = a.cantidadMaterias ?? a.subjectEnrollments?.length ?? 0;
        const countB = b.cantidadMaterias ?? b.subjectEnrollments?.length ?? 0;
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
