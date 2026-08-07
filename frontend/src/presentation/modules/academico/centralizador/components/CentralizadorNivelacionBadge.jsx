/**
 * Badge NIVELACIÓN del Centralizador anual (P2) — cruce de dominio con
 * Nivelación (schema 16 · `academico.nivelacion.ver`). Sentido inverso de
 * `CentralizadorLibroBadge.jsx`: un pill compacto "N pendientes de
 * nivelación" cuando el paralelo tiene materias arrastradas sin resolver, un
 * texto secundario "Sin pendientes" cuando no.
 */

import { ActionButton, StatusPill } from '@atoms';
import { NIVELACION_PERMISOS } from '@application-academico/nivelaciones/utils/nivelacionPermisos';

/**
 * @param {Object} props
 * @param {number} props.totalPendientes
 * @param {() => void} [props.onAbrirNivelacion] navega a la grilla de nivelación del paralelo
 */
const CentralizadorNivelacionBadge = ({ totalPendientes = 0, onAbrirNivelacion }) => {
  if (totalPendientes > 0) {
    return (
      <span className="cal-centralizador-nivelacion-badge">
        <StatusPill
          label={`${totalPendientes} pendiente${totalPendientes === 1 ? '' : 's'} de nivelación`}
          className="cfg-materia-pill cfg-materia-pill--warning"
        />
        {onAbrirNivelacion ? (
          <ActionButton
            permiso={NIVELACION_PERMISOS.ver}
            accion="LISTAR"
            type="link"
            size="small"
            onClick={onAbrirNivelacion}
          >
            Ver en Nivelación
          </ActionButton>
        ) : null}
      </span>
    );
  }

  return <span className="cal-centralizador-libro-vacio">Sin pendientes de nivelación</span>;
};

export default CentralizadorNivelacionBadge;
