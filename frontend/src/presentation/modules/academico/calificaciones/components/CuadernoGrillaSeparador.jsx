/**
 * Separador entre la ficha del curso y la grilla: texto + buscador de estudiantes.
 */

import { useMemo } from 'react';
import {
  calcularPlazoCuaderno,
  formatearFechaCalendario,
} from '@application-academico/calificaciones/utils/bimestrePlazoUtils.js';
import { PlusOutlined } from '@ant-design/icons';
import BimestrePlazoCountdown from './BimestrePlazoCountdown.jsx';
import CuadernoBuscarEstudiantes from './CuadernoBuscarEstudiantes.jsx';

const CuadernoGrillaSeparador = ({
  bimestreTitulo,
  bimestreNum,
  fechaInicio,
  fechaFin,
  gestionFechaFin,
  mostrarPlazo = false,
  busqueda = '',
  onBusquedaChange,
  totalEstudiantes = 0,
  filtrados = 0,
}) => {
  const rangoFechas = useMemo(() => {
    const plazo = calcularPlazoCuaderno({
      bimestreNum,
      fechaInicio,
      fechaFin,
      gestionFechaFin,
    });
    if (plazo.fechaInicioFmt && plazo.fechaFinFmt) {
      return (
        <>
          {' '}
          (<strong>{plazo.fechaInicioFmt}</strong> – <strong>{plazo.fechaFinFmt}</strong>)
        </>
      );
    }
    const ini = formatearFechaCalendario(fechaInicio);
    const fin = formatearFechaCalendario(fechaFin);
    if (ini && fin) {
      return (
        <>
          {' '}
          (<strong>{ini}</strong> – <strong>{fin}</strong>)
        </>
      );
    }
    return null;
  }, [bimestreNum, fechaInicio, fechaFin, gestionFechaFin]);

  return (
    <div className="cal-cuaderno-separador" role="separator">
      <div className="cal-cuaderno-separador__texto">
        <span className="cal-cuaderno-separador__titulo">Carga de notas por evaluación</span>
        <span className="cal-cuaderno-separador__desc">
          {bimestreTitulo ? (
            <>
              <strong>{bimestreTitulo}</strong> activo
              {rangoFechas}.
            </>
          ) : (
            'Agregá evaluaciones y registrá las notas de cada estudiante.'
          )}
        </span>
        <BimestrePlazoCountdown
          bimestreNum={bimestreNum}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          gestionFechaFin={gestionFechaFin}
          mostrar={mostrarPlazo}
        />
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

export default CuadernoGrillaSeparador;
