/**
 * Celda Persona del listado de Registro de ingresos (gemela de
 * `PagoEstudianteCell`): IdentidadCelda (código/CI + nombre) y, debajo, un pill
 * chico con el ORIGEN de la transacción (Aporte académico / Capacitación) —
 * distingue de qué proceso viene el ingreso sin necesitar columna propia.
 *
 * El nombre ya viene resuelto por el backend en orden APELLIDO_PATERNO
 * APELLIDO_MATERNO NOMBRES (`personaNombreCompleto`); aquí no se reordena.
 */

import IdentidadCelda from '@atoms/IdentidadCelda';
import StatusPill from '@atoms/StatusPill';
import {
  formatOrigenIngreso,
  getOrigenIngresoPillClass,
} from '@application-finanzas/utils/ingresosPills';

const IngresoPersonaCell = ({ codigo, nombre, origen }) => (
  <div className="pago-estudiante-cell">
    <IdentidadCelda codigo={codigo} nombre={(nombre || '—').toUpperCase()} />
    <StatusPill label={formatOrigenIngreso(origen)} className={getOrigenIngresoPillClass(origen)} />
  </div>
);

export default IngresoPersonaCell;
