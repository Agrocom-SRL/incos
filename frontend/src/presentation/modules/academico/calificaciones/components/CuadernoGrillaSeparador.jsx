/**
 * Separador entre la ficha del curso y la grilla de notas del cuaderno.
 */

const CuadernoGrillaSeparador = ({ bimestreTitulo }) => (
  <div className="cal-cuaderno-separador" role="separator">
    <span className="cal-cuaderno-separador__titulo">Carga de notas por evaluación</span>
    <span className="cal-cuaderno-separador__desc">
      {bimestreTitulo
        ? `Bimestre activo: ${bimestreTitulo}. Agregá evaluaciones con + y registrá la nota de cada estudiante en la grilla.`
        : 'Agregá evaluaciones y registrá las notas de cada estudiante.'}
    </span>
  </div>
);

export default CuadernoGrillaSeparador;
