/**
 * Registro de acciones en modo impersonación (coordinación → cuaderno docente).
 */

import { fakeDatabase } from './fakeDatabase.js';

export const registrarAuditoriaSiImpersona = (accion, detalle = {}) => {
  const imp = fakeDatabase.impersonacion;
  if (!imp?.activa) return;

  fakeDatabase.auditoriaAdmin.unshift({
    at: new Date().toISOString(),
    adminId: imp.adminId,
    adminNombre: imp.adminNombre,
    docenteId: imp.docenteId,
    docenteNombre: imp.docenteNombre,
    accion,
    detalle,
  });

  if (fakeDatabase.auditoriaAdmin.length > 50) {
    fakeDatabase.auditoriaAdmin.length = 50;
  }
};

export const obtenerContextoImpersonacion = () => ({
  ...fakeDatabase.impersonacion,
});
