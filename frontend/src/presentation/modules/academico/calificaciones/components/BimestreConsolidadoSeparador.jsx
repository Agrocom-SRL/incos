/**
 * Separador de la grilla consolidada (bimestre cerrado).
 */

import CuadernoBuscarEstudiantes from './CuadernoBuscarEstudiantes.jsx';

const BimestreConsolidadoSeparador = ({
  bimestreTitulo,
  busqueda = '',
  onBusquedaChange,
  totalEstudiantes = 0,
  filtrados = 0,
  evaluacionesCount = 0,
}) => (
  <div className="cal-cuaderno-separador cal-bimestre-consolidado-separador" role="separator">
    <div className="cal-cuaderno-separador__texto">
      <span className="cal-cuaderno-separador__titulo">Consolidado del bimestre</span>
      <span className="cal-cuaderno-separador__desc">
        {bimestreTitulo
          ? `${bimestreTitulo} cerrado: suma de ${evaluacionesCount} actividad(es). Las celdas vacías se consideran 0.`
          : 'Resumen teórico, práctico y total por estudiante.'}
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

export default BimestreConsolidadoSeparador;
