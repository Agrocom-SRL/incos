/**
 * Celda Estudiante de la planilla de cuentas por cobrar (gemela de
 * `LicenciaEstudianteCell`): IdentidadCelda (carnet + nombre completo) y, debajo
 * del nombre, el estado de cobranza como StatusPill teñido por color
 * (al día / próxima / vencida / sin compromiso).
 *
 * El nombre llega ya formateado por el backend (orden APELLIDOS NOMBRES,
 * incos-ui-system §4b); no se reordena aquí.
 */

import IdentidadCelda from '@atoms/IdentidadCelda';
import StatusPill from '@atoms/StatusPill';
import {
  formatEstadoCobranza,
  getEstadoCobranzaPillClass,
} from '@application-finanzas/utils/cuentasPorCobrarPills';

const CobranzaEstudianteCell = ({ carnet, nombreCompleto, estado }) => (
  <div className="cobranza-estudiante-cell">
    <IdentidadCelda codigo={carnet || null} nombre={nombreCompleto || '—'} />
    <span className="cobranza-estudiante-cell__estado">
      <StatusPill
        label={formatEstadoCobranza(estado)}
        className={getEstadoCobranzaPillClass(estado)}
      />
    </span>
  </div>
);

export default CobranzaEstudianteCell;
