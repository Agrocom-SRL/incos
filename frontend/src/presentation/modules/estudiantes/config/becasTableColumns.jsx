/**
 * becasTableColumns - Columnas de la tabla de becas asignadas a estudiantes.
 *
 * Lenguaje visual del prototipo de listado: `#` numérico + `IdentidadCelda` (estudiante),
 * celda de beca con estilo de descripción (patrón Carreras `cfg-carrera-area-desc`) y
 * `StatusPill` (estado) con el enum REAL del schema (PENDIENTE/ACTIVA/FINALIZADA/RECHAZADA).
 * Consolidado: tipo+% en una celda; estado+gestión juntos; sin columna de fecha de solicitud
 * (dato de trámite → detalle).
 *
 * NOTA: muestra BECAS ASIGNADAS A ESTUDIANTES (estudiantes_becas), no el catálogo.
 */

import { CalendarOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';

/** Estado de la beca → clase de pill semántica (enum real: PENDIENTE/ACTIVA/FINALIZADA/RECHAZADA). */
const ESTADO_BECA_PILL = {
  ACTIVA: 'cfg-materia-pill cfg-materia-pill--success',
  PENDIENTE: 'cfg-materia-pill cfg-materia-pill--warning',
  FINALIZADA: 'cfg-materia-pill cfg-materia-pill--info',
  RECHAZADA: 'cfg-materia-pill cfg-materia-pill--danger',
};
const getEstadoBecaPillClass = (estado) =>
  ESTADO_BECA_PILL[String(estado || '').toUpperCase()] || 'cfg-materia-pill cfg-materia-pill--default';

/** Punto de color (data-driven) para chip de carrera. */
const colorDot = (color) => (
  <span
    style={{
      width: 10, height: 10, borderRadius: 999,
      background: color || 'var(--border, #d1d5db)', display: 'inline-block',
    }}
  />
);

/** Monto Bs con 2 decimales o null. */
const formatBs = (v) => (v == null || Number.isNaN(Number(v)) ? null : `Bs. ${Number(v).toFixed(2)}`);

/**
 * Crea las columnas de la tabla de becas asignadas.
 *
 * @param {Function} navigate
 * @param {Function} refetch
 * @param {Function} deleteBeca
 * @param {Object} [options]
 * @param {Object} [options.viewNavigateState]
 * @returns {Array}
 */
export const createBecasTableColumns = (navigate, refetch = null, deleteBeca = null, options = {}) => {
  const { viewNavigateState } = options;
  const returnListPath = viewNavigateState?.returnListPath || '/estudiantes/becas/listar';

  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Estudiante',
      dataIndex: ['student', 'nombreCompleto'],
      fixed: 'left',
      ellipsis: true,
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.student?.codigoEstudiante || null}
          nombre={(record.student?.nombreCompleto || 'Sin nombre').toUpperCase()}
          accentColor={record.carrera?.colorHex || undefined}
        />
      ),
      sorter: (a, b) =>
        (a.student?.nombreCompleto || '').localeCompare(b.student?.nombreCompleto || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Beca',
      dataIndex: ['scholarship', 'nombre'],
      width: 320,
      render: (_, record) => {
        const nombre = record.scholarship?.nombre || 'Sin beca';
        const porcentaje = record.scholarship?.porcentaje;
        const descripcion = record.scholarship?.descripcion || record.observations || null;
        const ahorro = formatBs(record.impacto?.descuentoAplicado);
        return (
          <div className="cfg-carrera-area-desc">
            <div className="cfg-carrera-area-desc__area" style={{ flexWrap: 'wrap', gap: 6 }}>
              <span>{nombre}</span>
              {porcentaje != null ? (
                <StatusPill
                  label={`${porcentaje}%`}
                  className="cfg-materia-pill cfg-materia-pill--info"
                />
              ) : null}
              {ahorro ? (
                <StatusPill label={`Ahorro ${ahorro}`} className="cfg-materia-pill cfg-materia-pill--success" />
              ) : null}
            </div>
            {descripcion ? (
              <p className="cfg-carrera-area-desc__texto" title={descripcion}>
                {descripcion}
              </p>
            ) : (
              <p className="cfg-carrera-area-desc__texto cfg-carrera-area-desc__texto--empty">—</p>
            )}
          </div>
        );
      },
      sorter: (a, b) =>
        (a.scholarship?.nombre || '').localeCompare(b.scholarship?.nombre || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Carrera y estado',
      dataIndex: 'state',
      width: 220,
      render: (_, record) => {
        const m = record.management;
        const carrera = record.carrera;
        const carreraLabel = carrera?.nombre
          ? `${carrera.nombre}${carrera.codigo ? ` · ${carrera.codigo}` : ''}`
          : null;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <StatusPill label={record.state || '—'} className={getEstadoBecaPillClass(record.state)} />
            <InfoLinesCell
              lines={[
                { icon: colorDot(carrera?.colorHex), label: carreraLabel },
                { icon: <CalendarOutlined />, label: m?.codigo || m?.nombre || m?.anio },
              ]}
            />
          </div>
        );
      },
      sorter: (a, b) => (a.state || '').localeCompare(b.state || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
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
            viewPath={record?.id ? `/estudiantes/becas/asignacion/:id` : null}
            viewNavigateState={viewNavigateState}
            editPath={null}
            permisos={{
              ver: { codigo: 'matricula.beca.ver', accion: 'DETALLE' },
              editar: [
                { codigo: 'matricula.beca.asignar', accion: 'CREAR' },
                { codigo: 'matricula.beca.asignar', accion: 'EDITAR' },
              ],
              eliminar: { codigo: 'matricula.beca.asignar', accion: 'ELIMINAR' },
            }}
            onEdit={() => {
              if (!record?.studentId || !record?.id) return;
              navigate('/estudiantes/becas/asignar', {
                state: {
                  studentId: Number(record.studentId),
                  studentName: record.student?.nombreCompleto || null,
                  returnListPath,
                  editBecaAsignada: {
                    id: Number(record.id),
                    scholarshipId: record.scholarship?.id ? Number(record.scholarship.id) : null,
                    observations: record.observations || '',
                  },
                },
              });
            }}
          />
        );
      },
    },
  ];
};
