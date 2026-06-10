/**
 * Átomo: celda de actividad del cronograma. Sigue el diseño de IdentidadCelda
 * (margen + código + nombre) y añade debajo un dot con el tipo de actividad.
 */

import IdentidadCelda from '@atoms/IdentidadCelda';
import {
  getActividadTipoLabel,
  getActividadTipoTextClass,
} from '@application-institucional/actual/config/actividadPill.js';

const CronogramaActividadCell = ({ nombre, codigo, tipo }) => (
  <div className="cronograma-actividad-cell">
    <IdentidadCelda
      className="cfg-materia-identidad"
      codigo={codigo}
      nombre={(nombre || 'Sin nombre').toUpperCase()}
    />
    <span className={`cronograma-actividad-cell__tipo ${getActividadTipoTextClass(tipo)}`}>
      <span className="cronograma-actividad-cell__dot" aria-hidden />
      {getActividadTipoLabel(tipo)}
    </span>
  </div>
);

export default CronogramaActividadCell;
