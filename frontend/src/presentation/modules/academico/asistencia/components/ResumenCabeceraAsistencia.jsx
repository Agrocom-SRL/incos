/**
 * Resumen compacto del bimestre para la cabecera de la planilla (molécula).
 *
 * Va DEBAJO de la ficha del curso, en dos columnas:
 *  - Días de clase (horario semanal del curso).
 *  - Ponderación de marcas (KPIs presentes / atrasados / faltantes / con licencia).
 * Mismos datos que el resumen del calendario, pero embebidos en la cabecera.
 */
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  ScheduleOutlined,
  SolutionOutlined,
} from '@ant-design/icons';

/** KPIs de la ponderación de marcas (orden y tono semántico del resumen del calendario). */
const KPI_DEFS = [
  {
    key: 'presentes',
    label: 'Presentes',
    tono: 'success',
    icon: <CheckCircleOutlined aria-hidden />,
  },
  {
    key: 'atrasados',
    label: 'Atrasados',
    tono: 'warning',
    icon: <FieldTimeOutlined aria-hidden />,
  },
  {
    key: 'faltantes',
    label: 'Faltantes',
    tono: 'error',
    icon: <CloseCircleOutlined aria-hidden />,
  },
  {
    key: 'conLicencia',
    label: 'Con licencia',
    tono: 'info',
    icon: <SolutionOutlined aria-hidden />,
  },
];

const ResumenCabeceraAsistencia = ({ resumen = null, horario = [] }) => {
  if (!resumen && !horario?.length) return null;

  return (
    <div className="asi-resumen-cab">
      <section className="asi-resumen-cab__panel">
        <span className="asi-resumen-cab__label">Días de clase</span>
        {horario?.length ? (
          <ul className="asi-resumen-cab__horario">
            {horario.map((d) => (
              <li key={d.dia} className="asi-resumen-cab__horario-item">
                <ScheduleOutlined aria-hidden />
                <span className="asi-resumen-cab__horario-dia">
                  {d.diaLabel}
                </span>
                <span className="asi-resumen-cab__horario-horas">
                  {d.bloques?.map((b) => `${b.inicio}–${b.fin}`).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="asi-resumen-cab__vacio">
            Sin días de clase en el horario.
          </span>
        )}
      </section>

      <section className="asi-resumen-cab__panel">
        <span className="asi-resumen-cab__label">
          Ponderación de marcas
          {resumen?.total != null ? ` · ${resumen.total} en total` : ''}
        </span>
        {resumen ? (
          <div className="asi-resumen-cab__kpis">
            {KPI_DEFS.map(({ key, label, tono, icon }) => (
              <span
                key={key}
                className={`asi-resumen-cab__kpi asi-resumen-cab__kpi--${tono}`}
              >
                <span className="asi-resumen-cab__kpi-icono">{icon}</span>
                <span className="asi-resumen-cab__kpi-valor">
                  {resumen[key] ?? 0}
                </span>
                <span className="asi-resumen-cab__kpi-label">{label}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="asi-resumen-cab__vacio">
            Sin marcas registradas aún.
          </span>
        )}
      </section>
    </div>
  );
};

export default ResumenCabeceraAsistencia;
