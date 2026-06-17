/**
 * Separador entre la ficha del curso y la grilla (molécula, modelo del cuaderno de
 * Calificaciones `CuadernoGrillaSeparador`). Unifica el resumen del bimestre con la
 * navegación de semana en una sola banda:
 *  - Izquierda: título + semana activa (formato literal) + días de clase del horario.
 *  - Derecha: navegación de semana (flechas + rango + Hoy + ir a fecha) y KPIs.
 */
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import CabeceraSemanaAsistencia from './CabeceraSemanaAsistencia.jsx';
import { tituloSemana } from '@application-academico/asistencia/utils/asistenciaFechas.js';

/** KPIs de la ponderación de marcas (orden y tono semántico del resumen). */
const KPI_DEFS = [
  { key: 'presentes', label: 'Presentes', tono: 'success', icon: <CheckCircleOutlined aria-hidden /> },
  { key: 'atrasados', label: 'Atrasados', tono: 'warning', icon: <FieldTimeOutlined aria-hidden /> },
  { key: 'faltantes', label: 'Faltantes', tono: 'error', icon: <CloseCircleOutlined aria-hidden /> },
  { key: 'conLicencia', label: 'Con licencia', tono: 'info', icon: <SolutionOutlined aria-hidden /> },
];

const SeparadorSemanaAsistencia = ({
  rango,
  puedeAnterior,
  puedeSiguiente,
  onAnterior,
  onSiguiente,
  onIrAFecha,
  onHoy,
  esSemanaActual = false,
  anioGestion,
  resumen = null,
}) => {
  const titulo =
    rango?.desde && rango?.hasta ? tituloSemana(rango.desde, rango.hasta) : 'Semana vigente';

  return (
    <div className="asi-separador" role="separator">
      <div className="asi-separador__texto">
        <span className="asi-separador__titulo">Toma de asistencia</span>
        <span className="asi-separador__desc">
          <strong>{titulo}</strong>
          {resumen?.total != null ? `: ${resumen.total} marcas registradas` : ''}
        </span>
        {resumen ? (
          <div className="asi-resumen-cab__kpis">
            {KPI_DEFS.map(({ key, label, tono, icon }) => (
              <span
                key={key}
                className={`asi-resumen-cab__kpi asi-resumen-cab__kpi--${tono}`}
              >
                <span className="asi-resumen-cab__kpi-icono">{icon}</span>
                <span className="asi-resumen-cab__kpi-valor">{resumen[key] ?? 0}</span>
                <span className="asi-resumen-cab__kpi-label">{label}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="asi-separador__controles">
        <CabeceraSemanaAsistencia
          rango={rango}
          puedeAnterior={puedeAnterior}
          puedeSiguiente={puedeSiguiente}
          onAnterior={onAnterior}
          onSiguiente={onSiguiente}
          onIrAFecha={onIrAFecha}
          onHoy={onHoy}
          esSemanaActual={esSemanaActual}
          anioGestion={anioGestion}
        />
      </div>
    </div>
  );
};

export default SeparadorSemanaAsistencia;
