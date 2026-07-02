/**
 * Pie/resumen del Historial académico (FORM-SIE-ITT-04).
 *
 * Replica el pie del transcript: escala de valoración (61-100 APROBADO,
 * 0-60 REPROBADO, nota mínima 61), carga horaria total, asignaturas aprobadas
 * (X/Y) y promedio de calificaciones.
 *
 * Recibe el resumen ya calculado por el backend. Solo composición + tokens.
 */

import { Alert } from 'antd';

/** Muestra un valor numérico o "—" cuando está vacío. */
const dash = (value) => (value == null || value === '' ? '—' : value);

const HistorialResumen = ({ resumen }) => {
  const aprobadas = resumen?.asignaturasAprobadas;
  const total = resumen?.asignaturasTotal;
  const aprobadasLabel =
    aprobadas != null && total != null ? `${aprobadas} / ${total}` : dash(aprobadas ?? total);

  const tiles = [
    { label: 'Carga horaria total', value: dash(resumen?.totalCargaHoraria) },
    { label: 'Asignaturas aprobadas', value: aprobadasLabel },
    { label: 'Promedio de calificaciones', value: dash(resumen?.promedioGeneral), primary: true },
  ];

  return (
    <section className="historial-resumen" aria-label="Resumen del historial académico">
      <div className="historial-resumen__stats">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={`historial-resumen__tile${
              tile.primary ? ' historial-resumen__tile--primary' : ''
            }`}
          >
            <span className="historial-resumen__tile-label">{tile.label}</span>
            <span className="historial-resumen__tile-value">{tile.value}</span>
          </div>
        ))}
      </div>

      <Alert
        type="info"
        showIcon
        className="historial-resumen__escala"
        title="Escala de valoración"
        description="61 a 100: APROBADO · 0 a 60: REPROBADO · Nota mínima de aprobación: 61."
      />
    </section>
  );
};

export default HistorialResumen;
