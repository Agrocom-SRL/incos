/**
 * Separador entre la ficha del curso y la grilla: texto + buscador de estudiantes.
 */

import CuadernoBuscarEstudiantes from './CuadernoBuscarEstudiantes.jsx';

const CuadernoGrillaSeparador = ({
  bimestreTitulo,
  busqueda = '',
  onBusquedaChange,
  totalEstudiantes = 0,
  filtrados = 0,
}) => (
  <div className="cal-cuaderno-separador" role="separator">
    <div className="cal-cuaderno-separador__texto">
      <span className="cal-cuaderno-separador__titulo">Carga de notas por evaluación</span>
      <span className="cal-cuaderno-separador__desc">
        {bimestreTitulo
          ? `Bimestre activo: ${bimestreTitulo}. Agregá evaluaciones con + y registrá la nota de cada estudiante en la grilla.`
          : 'Agregá evaluaciones y registrá las notas de cada estudiante.'}
      </span>
    </div>
    <CuadernoBuscarEstudiantes
      value={busqueda}
      onChange={onBusquedaChange}
      total={totalEstudiantes}
      filtrados={filtrados}
      className="cal-cuaderno-separador__buscar"
    />
  </div>
);

export default CuadernoGrillaSeparador;
