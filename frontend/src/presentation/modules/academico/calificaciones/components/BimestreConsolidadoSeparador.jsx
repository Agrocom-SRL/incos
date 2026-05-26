/**
 * Separador de la grilla consolidada (bimestre cerrado).
 */

import { useMemo } from 'react';
import { formatearFechaCalendario } from '@application-academico/calificaciones/utils/bimestrePlazoUtils.js';
import CuadernoBuscarEstudiantes from './CuadernoBuscarEstudiantes.jsx';

const BimestreConsolidadoSeparador = ({
  bimestreTitulo,
  fechaInicio,
  fechaFin,
  busqueda = '',
  onBusquedaChange,
  totalEstudiantes = 0,
  filtrados = 0,
}) => {
  const descripcion = useMemo(() => {
    const titulo = bimestreTitulo ?? 'Bimestre';
    const ini = formatearFechaCalendario(fechaInicio);
    const fin = formatearFechaCalendario(fechaFin);

    if (ini && fin) {
      return (
        <>
          <strong>{titulo}</strong> cerrado · periodo del <strong>{ini}</strong> al{' '}
          <strong>{fin}</strong>. Resumen teórico, práctico y total por estudiante.
        </>
      );
    }
    if (fin) {
      return (
        <>
          <strong>{titulo}</strong> cerrado · finalizó el <strong>{fin}</strong>. Resumen teórico,
          práctico y total por estudiante.
        </>
      );
    }
    return (
      <>
        <strong>{titulo}</strong> cerrado. Resumen teórico, práctico y total por estudiante.
      </>
    );
  }, [bimestreTitulo, fechaInicio, fechaFin]);

  return (
    <div className="cal-cuaderno-separador cal-bimestre-consolidado-separador" role="separator">
      <div className="cal-cuaderno-separador__texto">
        <span className="cal-cuaderno-separador__titulo">Consolidado del bimestre</span>
        <span className="cal-cuaderno-separador__desc">{descripcion}</span>
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
};

export default BimestreConsolidadoSeparador;
