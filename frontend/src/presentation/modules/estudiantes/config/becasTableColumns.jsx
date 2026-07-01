/**
 * becasTableColumns - Columnas de la tabla de becas asignadas a estudiantes.
 *
 * Distribución: `#` · Estudiante · Beca (ícono + nombre + descripción, patrón
 * "Área y descripción" de Carreras) · Gestión y descuento (gestión + 2 pills: % y monto)
 * · Carrera (dot de color, patrón "Título otorgado") · Acciones.
 * El nombre del estudiante NO se tiñe por carrera. Sin pill de estado.
 *
 * NOTA: muestra BECAS ASIGNADAS A ESTUDIANTES (estudiantes_becas), no el catálogo.
 */

import { CalendarOutlined, GiftOutlined } from '@ant-design/icons';
import { IdentidadCelda, StatusPill, CarreraDotCell, IconTituloDescCell, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';

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
      width: 240,
      ellipsis: true,
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.student?.codigoEstudiante || null}
          nombre={(record.student?.nombreCompleto || 'Sin nombre').toUpperCase()}
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
      render: (_, record) => (
        <IconTituloDescCell
          icon={<GiftOutlined />}
          titulo={record.scholarship?.nombre || 'Sin beca'}
          descripcion={record.scholarship?.descripcion || record.observations || null}
        />
      ),
      sorter: (a, b) =>
        (a.scholarship?.nombre || '').localeCompare(b.scholarship?.nombre || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Gestión y descuento',
      dataIndex: ['management', 'codigo'],
      width: 200,
      render: (_, record) => {
        const m = record.management;
        const porcentaje = record.scholarship?.porcentaje;
        const ahorro = formatBs(record.impacto?.descuentoAplicado);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <InfoLinesCell
              lines={[{ icon: <CalendarOutlined />, label: m?.codigo || m?.nombre || m?.anio }]}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {porcentaje != null ? (
                <StatusPill label={`${porcentaje}%`} className="cfg-materia-pill cfg-materia-pill--info" />
              ) : null}
              {ahorro ? (
                <StatusPill label={ahorro} className="cfg-materia-pill cfg-materia-pill--success" />
              ) : null}
            </div>
          </div>
        );
      },
      sorter: (a, b) => (a.scholarship?.porcentaje || 0) - (b.scholarship?.porcentaje || 0),
    },
    {
      title: 'Carrera',
      key: 'carrera',
      width: 200,
      render: (_, record) => (
        <CarreraDotCell nombre={record.carrera?.nombre} colorHex={record.carrera?.colorHex} />
      ),
      sorter: (a, b) => (a.carrera?.nombre || '').localeCompare(b.carrera?.nombre || ''),
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
