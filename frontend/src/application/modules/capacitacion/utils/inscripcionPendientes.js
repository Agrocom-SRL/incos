/**
 * Qué le falta a una inscripción PENDIENTE para pasar a INSCRITO.
 *
 * Regla del negocio: INSCRITO exige matrícula cancelada, costo del curso
 * cancelado Y todos los requisitos obligatorios entregados. Esta función solo
 * explica la brecha en la UI; la transición real la decide el backend.
 */

import { formatBs } from '@application/utils/formatters';

/**
 * @param {Object|null} inscripcion - inscripción mapeada (saldos + requisitos)
 * @returns {Array<{key: string, label: string}>} vacío si no falta nada o no está PENDIENTE
 */
export const calcularPendientesInscripcion = (inscripcion) => {
  if (!inscripcion || inscripcion.estado !== 'PENDIENTE') return [];

  const pendientes = [];
  if (Number(inscripcion.saldoMatricula) > 0) {
    pendientes.push({
      key: 'matricula',
      label: `Matrícula (instituto): saldo Bs ${formatBs(inscripcion.saldoMatricula)}`,
    });
  }
  if (Number(inscripcion.saldoCurso) > 0) {
    pendientes.push({
      key: 'curso',
      label: `Costo del curso (entidad certificadora): saldo Bs ${formatBs(inscripcion.saldoCurso)}`,
    });
  }
  const requisitosFaltantes = (inscripcion.requisitos ?? []).filter(
    (r) => r.obligatorio && !r.entregado,
  );
  if (requisitosFaltantes.length > 0) {
    pendientes.push({
      key: 'requisitos',
      label: `Requisitos obligatorios sin entregar: ${requisitosFaltantes
        .map((r) => r.descripcion)
        .join(', ')}`,
    });
  }
  return pendientes;
};
