/**
 * PagoEstadoAporteSection - Organism del paso "Estado del aporte"
 *
 * Single Responsibility: Verificación previa al registro — estado del aporte
 * académico del estudiante (monto base, beca, cuotas registradas, saldo).
 *
 * Atomic Design: Organism
 * - Panel único a ancho completo (.resumen-panel, mismo lenguaje que la
 *   confirmación). Sin panel de estudiante: la identidad ya está en el título
 *   de la página y en el resumen del paso Confirmación (evita redundancia).
 * - Solo lectura: el monto de la cuota se captura en el paso "Datos del pago".
 *
 * @param {Object} configuracionAporte - Configuración de aporte activa
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {Object} estadoActualAporte - Estado actual del aporte (saldo, cuotas)
 * @param {string} error - Error al cargar la configuración del aporte
 */

import { WalletOutlined } from '@ant-design/icons';
import ContributionDetailSummary from './ContributionDetailSummary';

const PagoEstadoAporteSection = ({
  configuracionAporte,
  becaActiva,
  estadoActualAporte,
  error = null,
}) => (
  <div className="resumen-panel">
    <span className="resumen-panel__label">
      <WalletOutlined /> Estado del aporte
    </span>
    <ContributionDetailSummary
      configuracionAporte={configuracionAporte}
      becaActiva={becaActiva}
      estadoActualAporte={estadoActualAporte}
      error={error}
    />
  </div>
);

export default PagoEstadoAporteSection;
