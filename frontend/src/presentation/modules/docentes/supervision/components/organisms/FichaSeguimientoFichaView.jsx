/**
 * Organismo: lectura campo a campo de la ficha de seguimiento en clase
 * (módulo DOC · Supervisión docente) — réplica del formulario físico «FICHA
 * DE SEGUIMIENTO EN LA CLASE PRESENCIAL».
 *
 * REUTILIZADO tanto por `FichaSeguimientoDetail` (módulo DOC, ficha completa
 * con permiso DETALLE) como por la tab "Supervisión" del portal del docente
 * (patrón "páginas gemelas": un organismo compartido + wrappers delgados, sin
 * duplicar el JSX de lectura). Solo lectura: no recibe `form` ni dispara
 * mutaciones.
 *
 * Degradación por contrato: el wrapper self del portal (`GET /mis-fichas`)
 * reutiliza la vista 174 (listado), que NO trae los 9 TEXT de observaciones
 * ni los 4 SI/NO de documentación (solo viven en la entidad raíz, expuesta
 * por `GET /:id`, DETALLE — sin permiso para DOCENTE). Se detecta por la
 * AUSENCIA de la clave (`undefined`, a diferencia de `null` = capturado vacío
 * en la ficha completa) y esas secciones simplemente no se muestran.
 */

import { CalendarOutlined, FileTextOutlined, SolutionOutlined, TeamOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';

const formatSiNo = (value) => (value === true ? 'Sí' : value === false ? 'No' : '—');

const OBSERVACIONES_ESTRUCTURA = [
  { key: 'obsAvanceAsignatura', label: 'Avance de la asignatura' },
  { key: 'obsPresentacionTema', label: 'Presentación del tema o continuidad de avance' },
  { key: 'obsRecursos', label: 'Recursos que utiliza' },
  { key: 'obsExposicion', label: 'Exposición del docente' },
  { key: 'obsParticipacion', label: 'Participación de estudiantes' },
  { key: 'obsActividadesPracticas', label: 'Actividades prácticas' },
  { key: 'obsActividadesEvaluacion', label: 'Actividades de evaluación' },
];

const FichaSeguimientoFichaView = ({ ficha }) => {
  if (!ficha) return null;

  // `undefined` = fila resumen (vista 174, sin los campos de la entidad raíz).
  const tieneDetalleCompleto = ficha.tieneCronogramaBimestral !== undefined;

  return (
    <div className="sd-tab-body">
      <DetailInfoCard title="Datos de la observación" icon={<CalendarOutlined />} cols={3}>
        <DetailField label="Fecha de seguimiento">{ficha.fechaLabel}</DetailField>
        <DetailField label="Docente">{ficha.docenteNombre}</DetailField>
        <DetailField label="Evaluador">{ficha.evaluadorNombre}</DetailField>
        <DetailField label="Asignatura">{ficha.asignaturaLabel || ficha.asignaturaNombre}</DetailField>
        <DetailField label="Carrera">{ficha.carreraNombre}</DetailField>
        <DetailField label="Curso · Paralelo">
          {[ficha.cursoParaleloLabel, ficha.paraleloTurno].filter(Boolean).join(' · ')}
        </DetailField>
      </DetailInfoCard>

      {tieneDetalleCompleto ? (
        <DetailInfoCard title="Documentación (lista de asistencia)" icon={<SolutionOutlined />} cols={2}>
          <DetailField label="Cronograma bimestral de asignatura">
            {formatSiNo(ficha.tieneCronogramaBimestral)}
          </DetailField>
          <DetailField label="Plan bimestral">{formatSiNo(ficha.tienePlanBimestral)}</DetailField>
          <DetailField label="Registro de asistencia">
            {formatSiNo(ficha.tieneRegistroAsistencia)}
          </DetailField>
          <DetailField label="Registro pedagógico y el consolidado">
            {formatSiNo(ficha.tieneRegistroPedagogico)}
          </DetailField>
          <DetailField label="Observaciones" span={2}>
            {ficha.obsDocumentacion}
          </DetailField>
        </DetailInfoCard>
      ) : null}

      <DetailInfoCard title="Cantidad de estudiantes" icon={<TeamOutlined />} cols={2}>
        <DetailField label="En planilla">{ficha.estudiantesEnPlanilla ?? '—'}</DetailField>
        <DetailField label="Asistentes">{ficha.estudiantesAsistentes ?? '—'}</DetailField>
      </DetailInfoCard>

      {tieneDetalleCompleto ? (
        <>
          <DetailInfoCard
            title="Estructura mínima de la clase — observaciones"
            icon={<FileTextOutlined />}
            cols={1}
          >
            {OBSERVACIONES_ESTRUCTURA.map(({ key, label }) => (
              <DetailField key={key} label={label}>
                {ficha[key]}
              </DetailField>
            ))}
          </DetailInfoCard>

          <DetailInfoCard title="Otras observaciones" icon={<FileTextOutlined />} cols={1}>
            <DetailField label="Otras observaciones">{ficha.otrasObservaciones}</DetailField>
          </DetailInfoCard>
        </>
      ) : null}
    </div>
  );
};

export default FichaSeguimientoFichaView;
