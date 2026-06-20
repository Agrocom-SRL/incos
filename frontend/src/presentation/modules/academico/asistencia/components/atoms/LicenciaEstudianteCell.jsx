/**
 * Celda Estudiante de la lista de licencias (patrón CronogramaActividadCell):
 * IdentidadCelda (código académico + nombre) y, debajo, el estado de la solicitud
 * como dot + etiqueta teñidos por color (pendiente/aprobada/rechazada/cancelada).
 */

import IdentidadCelda from '@atoms/IdentidadCelda';
import {
  formatEstadoLicencia,
} from '@application-academico/asistencia/utils/licenciasEstados.js';
import { getEstadoTextClass } from '@application-academico/asistencia/utils/licenciaPills.js';

const LicenciaEstudianteCell = ({ nombre, codigo, estado }) => (
  <div className="licencia-estudiante-cell">
    <IdentidadCelda codigo={codigo} nombre={nombre || '—'} />
    <span className={`licencia-estudiante-cell__estado ${getEstadoTextClass(estado)}`}>
      <span className="licencia-estudiante-cell__dot" aria-hidden />
      {formatEstadoLicencia(estado)}
    </span>
  </div>
);

export default LicenciaEstudianteCell;
