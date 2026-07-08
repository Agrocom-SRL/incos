/**
 * Átomo: reglas de aplicación de una beca/descuento del catálogo maestro
 * (Config. de pagos · Finanzas). Gemela de `DocumentacionRequisitosCell`:
 * líneas apiladas `InfoLinesCell` con icono en lugar de pills sueltas.
 *   1. «Automática · promedio ≥ N» (tono primario, dato de `promedioMinimo`)
 *      o «Asignación manual» (neutra).
 *   2. «Requiere documentación» (solo si aplica).
 *   3. «Requiere aval de Rectorado» (solo si aplica).
 */

import {
  AuditOutlined,
  FileProtectOutlined,
  FormOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { InfoLinesCell } from '@atoms';

/** Etiqueta de la regla de asignación (automática por promedio vs manual). */
const reglaAsignacionLabel = ({ esAutomatica, promedioMinimo, tipoAutomatica }) => {
  if (!esAutomatica) return 'Asignación manual';
  if (promedioMinimo != null) return `Automática · promedio ≥ ${promedioMinimo}`;
  return tipoAutomatica ? `Automática · ${tipoAutomatica}` : 'Automática';
};

const BecaReglasCell = ({ esAutomatica, promedioMinimo, tipoAutomatica, requiereDocumentacion, requiereAprobacionRector }) => (
  <InfoLinesCell
    lines={[
      {
        key: 'asignacion',
        icon: esAutomatica ? <ThunderboltOutlined /> : <FormOutlined />,
        label: reglaAsignacionLabel({ esAutomatica, promedioMinimo, tipoAutomatica }),
        className: esAutomatica ? 'fin-beca-regla--automatica' : undefined,
      },
      requiereDocumentacion
        ? { key: 'doc', icon: <FileProtectOutlined />, label: 'Requiere documentación' }
        : null,
      requiereAprobacionRector
        ? { key: 'rector', icon: <AuditOutlined />, label: 'Requiere aval de Rectorado' }
        : null,
    ].filter(Boolean)}
  />
);

export default BecaReglasCell;
