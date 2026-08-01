/**
 * Interfaz de Repositorio (solo lectura): ICalificacionCentralizadorRepository
 *
 * Contrato del repositorio que lee el centralizador de calificaciones por
 * paralelo desde la vista base 135 (vista_base_calificacion_centralizador_paralelo_fila),
 * en formato LARGO (una fila por estudiante × oferta_curso).
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA sobre vistas, no CRUD.
 * Devuelve filas de la vista (DTO plano), no entidades de dominio. El pivote a
 * matriz (estudiantes × asignaturas) lo hace el use case.
 */
export class ICalificacionCentralizadorRepository {
  /**
   * Filas del centralizador de un paralelo en gestión (formato largo).
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarFilasCentralizadorPorParaleloGestion(paraleloGestionId) {
    throw new Error('Method listarFilasCentralizadorPorParaleloGestion() must be implemented');
  }

  /**
   * Filas del boletín de UN estudiante (mismas columnas de la vista 135, filtrando
   * por estudiante). La vista ya está acotada a la asignación vigente/activa
   * (gestión vigente), por lo que devuelve las asignaturas del estudiante en curso.
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarFilasCentralizadorPorEstudiante(estudianteId) {
    throw new Error('Method listarFilasCentralizadorPorEstudiante() must be implemented');
  }

  /**
   * Desglose TEÓRICO/PRÁCTICO de UN bimestre para las asignaturas de UN
   * estudiante del paralelo (boletín bimestral). Reutiliza la vista 119
   * (vista_base_calificacion_resumen_curso_bimestre_fila) unida a la 135 por
   * matricula_materia_id — sin vistas nuevas. Una fila por oferta_curso con
   * nota_teorico/nota_practico (consolidadas), cuaderno_teorico/cuaderno_practico
   * (bimestre abierto), nota_efectiva, estado_bimestre y tiene_registro.
   * @param {number} paraleloGestionId
   * @param {number} estudianteId
   * @param {number} bimestre - 1..4
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarDesgloseBimestrePorEstudiante(paraleloGestionId, estudianteId, bimestre) {
    throw new Error('Method listarDesgloseBimestrePorEstudiante() must be implemented');
  }
}
