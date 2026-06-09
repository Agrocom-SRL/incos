/**
 * Interpreta el payload de GET /calificaciones/gestion-bimestres para la
 * pantalla Institucional → Gestión actual.
 *
 * @param {Object|null} data - Payload de obtenerGestionBimestres()
 * @returns {{ iniciada: boolean, estadoLabel: string, estadoColor: string, matriculasCursando: number|null }}
 */
export function gestionActivacionStatus(data) {
  const iniciada = Boolean(data?.gestionIniciada);
  const matriculasCursando =
    data?.bimestres?.[0]?.matriculasTransicionadas ?? null;

  return {
    iniciada,
    estadoLabel: iniciada ? 'Cursado iniciado' : 'Cursado no iniciado',
    estadoColor: iniciada ? 'success' : 'default',
    matriculasCursando,
  };
}
