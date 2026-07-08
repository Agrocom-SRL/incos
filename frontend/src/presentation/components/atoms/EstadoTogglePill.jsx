/**
 * Átomo: celda de estado activo/inactivo con toggle rápido.
 *
 * Dos elementos separados (el switch NO vive dentro de la pill):
 * - `Switch` de AntD (size small, color primario del theme) para alternar el
 *   estado directo, sin confirmación; `loading` mientras el PATCH está en vuelo.
 * - Pill estática estilo `StatusPill` como etiqueta (clases globales
 *   `cfg-materia-pill--*` de `styles/components/atoms/table-cells.css`):
 *   ACTIVO → variante primaria institucional; INACTIVO → gris neutro (estado
 *   administrativo benigno, no un error — nada de rojo/magenta).
 * - Permisos: mismo mecanismo que `ActionButton` (`hasPermiso` de `useAuthContext`).
 *   Sin permiso ACTIVAR (o sin `onToggle`) se renderiza solo la pill, sin switch.
 */

import { useState } from 'react';
import { Switch } from 'antd';
import { useAuthContext } from '@application-auth';

/**
 * @param {Object} props
 * @param {boolean} props.activo - Estado actual del registro
 * @param {Function} [props.onToggle] - (nuevoActivo: boolean) => Promise; persiste el cambio.
 *   El feedback de error lo da quien provee onToggle (message/notification); aquí solo
 *   se gestiona el loading.
 * @param {string} [props.permiso] - Código de permiso requerido (ej. 'configuracion.complementario.idiomas')
 * @param {string} [props.accion='ACTIVAR'] - Acción RBAC requerida
 */
const EstadoTogglePill = ({ activo, onToggle, permiso, accion = 'ACTIVAR' }) => {
  const { hasPermiso } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const pill = (
    <span
      className={`cfg-materia-pill ${
        activo ? 'cfg-materia-pill--primary' : 'cfg-materia-pill--inactiva'
      }`}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );

  // Fail-closed (mismo criterio que ActionButton/TableActions): sin permiso
  // ACTIVAR o sin handler, solo la pill informativa.
  const interactiva = Boolean(onToggle) && (!permiso || hasPermiso(permiso, accion));
  if (!interactiva) {
    return pill;
  }

  const ejecutarToggle = async (nuevoActivo) => {
    setLoading(true);
    try {
      await onToggle(nuevoActivo);
    } catch {
      // El feedback de error ya lo dio quien provee onToggle.
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="estado-toggle-cell">
      <Switch
        size="small"
        checked={activo}
        loading={loading}
        onChange={ejecutarToggle}
        aria-label={activo ? 'Desactivar registro' : 'Activar registro'}
      />
      {pill}
    </span>
  );
};

export default EstadoTogglePill;
