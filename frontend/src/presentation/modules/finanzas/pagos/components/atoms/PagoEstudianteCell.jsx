/**
 * Celda Estudiante del listado de pagos (gemela de LicenciaEstudianteCell):
 * IdentidadCelda (código del estudiante + nombre) y, debajo, el ESTADO del pago
 * (PENDIENTE/PARCIAL/CANCELADO) como dot + etiqueta teñidos por color — el estado
 * NO va en columna propia, vive bajo el nombre.
 *
 * El nombre ya viene resuelto del mapper en orden APELLIDO_PATERNO APELLIDO_MATERNO
 * NOMBRES (vía buildFullName); aquí no se reordena.
 */

import IdentidadCelda from '@atoms/IdentidadCelda';
import {
  formatEstadoPago,
  getEstadoPagoTextClass,
} from '@application-finanzas/utils/pagosPills';

const PagoEstudianteCell = ({ nombre, codigo, estado }) => (
  <div className="pago-estudiante-cell">
    <IdentidadCelda codigo={codigo} nombre={(nombre || '—').toUpperCase()} />
    <span className={`pago-estudiante-cell__estado ${getEstadoPagoTextClass(estado)}`}>
      <span className="pago-estudiante-cell__dot" aria-hidden />
      {formatEstadoPago(estado)}
    </span>
  </div>
);

export default PagoEstudianteCell;
