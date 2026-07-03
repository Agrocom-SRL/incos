/**
 * RolPill — pill del rol del usuario con el color por categoría del módulo de
 * Seguridad (roles.css), la misma composición que usan el header, "Mi perfil"
 * y la grilla de roles. ÚNICA fuente de esa composición (StatusPill + rolPillClass).
 *
 * Atomic Design: MOLÉCULA (átomo StatusPill + clase por categoría de rol).
 * Devuelve null si el rol no tiene nombre (el consumidor decide su fallback con
 * `rol?.nombre ? <RolPill/> : <fallback/>`).
 */

import { StatusPill } from '@atoms';
import { rolPillClass } from '@modules/seguridad/roles/components/atoms/rolColor.js';
import '@modules/seguridad/roles/styles/roles.css';

/**
 * @param {{ rol?: { nombre?: string, tipo?: string, is_system?: boolean } | null }} props
 */
const RolPill = ({ rol }) => {
  if (!rol?.nombre) return null;
  return <StatusPill label={rol.nombre} className={rolPillClass(rol.tipo, Boolean(rol.is_system))} />;
};

export default RolPill;
