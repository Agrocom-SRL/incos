/**
 * Interfaz de Repositorio (solo lectura): IHistorialAcademicoRepository
 *
 * Contrato del repositorio que lee el historial académico (kardex / transcript
 * FORM-SIE-ITT-04) de un estudiante desde la vista base 138
 * (vista_base_historial_academico_estudiante_fila), en formato LARGO: una fila
 * por (estudiante × asignatura × gestión), a través de todas las gestiones, más
 * las filas de arrastre/convalidación (origen = PREVIO).
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA sobre vistas, no CRUD.
 * Devuelve filas planas de la vista (DTO), no entidades de dominio. La cabecera
 * del estudiante se lee aparte (obtenerCabeceraEstudiante); el resumen y el
 * armado del contrato los hace el use case.
 */
export class IHistorialAcademicoRepository {
  /**
   * Filas del historial académico de un estudiante (formato largo, multi-gestión).
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarFilasHistorialPorEstudiante(estudianteId) {
    throw new Error('Method listarFilasHistorialPorEstudiante() must be implemented');
  }

  /**
   * Cabecera del estudiante para el transcript (matrícula, CI, nombre, carrera,
   * plan vigente de la carrera, gestión de ingreso, promedio).
   * @param {number} estudianteId
   * @returns {Promise<Object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async obtenerCabeceraEstudiante(estudianteId) {
    throw new Error('Method obtenerCabeceraEstudiante() must be implemented');
  }
}
