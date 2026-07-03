/**
 * Resumen del Historial académico (FORM-SIE-ITT-04): carga horaria total,
 * asignaturas aprobadas (X/Y) y promedio de calificaciones. Se muestra ARRIBA
 * de la tabla transcript (los totales del documento oficial, como tiles).
 *
 * Recibe el resumen ya calculado por el backend. Solo composición + tokens.
 */

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
    </section>
  );
};

export default HistorialResumen;
