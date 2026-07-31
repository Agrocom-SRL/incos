/**
 * Tokens de DI del módulo Titulación (TIT)
 *
 * Los repositorios del módulo se registran con tokens propios (scoped
 * 'titulacion.*') dentro de registerTitulacionModule — diff mínimo en los
 * índices compartidos (patrón del módulo Capacitación): solo se toca
 * tokens/index.js, modules/index.js y presentation/routes/index.js.
 *
 * Nota (2026-07-31): este archivo se llamó `tutorias.tokens.js`
 * (TUTORIAS_TOKENS, prefijo 'tutorias.') y también incluía el sub-grupo
 * Acompañamiento. Ese rename estuvo documentado como "el código no cambia" —
 * decisión REVERTIDA en esta fecha: el módulo pasa a TIT/'titulacion.' y las
 * claves de Acompañamiento (repos + use cases + controllers + router) se
 * fusionaron en ACADEMICO_TOKENS (`academico.tokens.js`).
 */
export const TITULACION_TOKENS = {
  // Repositorios (arquetipo A + arquetipo B de vistas)
  modalidadGradoRepository: 'titulacion.modalidadGradoRepository',
  proyectoGradoRepository: 'titulacion.proyectoGradoRepository',
  integranteProyectoRepository: 'titulacion.integranteProyectoRepository',
  avanceProyectoRepository: 'titulacion.avanceProyectoRepository',
  bitacoraProyectoRepository: 'titulacion.bitacoraProyectoRepository',
  dictamenProyectoRepository: 'titulacion.dictamenProyectoRepository',
  proyectoGradoListadoViewRepository: 'titulacion.proyectoGradoListadoViewRepository',

  // Use Cases — Titulación (proyectos de grado)
  listProyectosGradoUseCase: 'titulacion.listProyectosGradoUseCase',
  listModalidadesGradoUseCase: 'titulacion.listModalidadesGradoUseCase',
  listMisTutoradosUseCase: 'titulacion.listMisTutoradosUseCase',
  getMiProyectoGradoUseCase: 'titulacion.getMiProyectoGradoUseCase',
  exportBitacoraMensualTutorPdfUseCase: 'titulacion.exportBitacoraMensualTutorPdfUseCase',
  getProyectoGradoByIdUseCase: 'titulacion.getProyectoGradoByIdUseCase',
  createProyectoGradoUseCase: 'titulacion.createProyectoGradoUseCase',
  updateProyectoGradoUseCase: 'titulacion.updateProyectoGradoUseCase',
  deleteProyectoGradoUseCase: 'titulacion.deleteProyectoGradoUseCase',
  asignarTutorProyectoUseCase: 'titulacion.asignarTutorProyectoUseCase',
  aprobarEtapaProyectoUseCase: 'titulacion.aprobarEtapaProyectoUseCase',
  addIntegranteProyectoUseCase: 'titulacion.addIntegranteProyectoUseCase',
  updateIntegranteProyectoUseCase: 'titulacion.updateIntegranteProyectoUseCase',
  listBitacoraProyectoUseCase: 'titulacion.listBitacoraProyectoUseCase',
  createBitacoraEntradaUseCase: 'titulacion.createBitacoraEntradaUseCase',
  updateBitacoraEntradaUseCase: 'titulacion.updateBitacoraEntradaUseCase',
  confirmarBitacoraEstudianteUseCase: 'titulacion.confirmarBitacoraEstudianteUseCase',
  listAvancesProyectoUseCase: 'titulacion.listAvancesProyectoUseCase',
  getAvanceByIdUseCase: 'titulacion.getAvanceByIdUseCase',
  createAvanceProyectoUseCase: 'titulacion.createAvanceProyectoUseCase',
  downloadAvanceArchivoUseCase: 'titulacion.downloadAvanceArchivoUseCase',
  listDictamenesProyectoUseCase: 'titulacion.listDictamenesProyectoUseCase',
  exportDictamenPdfUseCase: 'titulacion.exportDictamenPdfUseCase',

  // Controllers — Titulación
  listProyectosGradoController: 'titulacion.listProyectosGradoController',
  listModalidadesGradoController: 'titulacion.listModalidadesGradoController',
  listMisTutoradosController: 'titulacion.listMisTutoradosController',
  getMiProyectoGradoController: 'titulacion.getMiProyectoGradoController',
  exportBitacoraMensualTutorController: 'titulacion.exportBitacoraMensualTutorController',
  getProyectoGradoByIdController: 'titulacion.getProyectoGradoByIdController',
  createProyectoGradoController: 'titulacion.createProyectoGradoController',
  updateProyectoGradoController: 'titulacion.updateProyectoGradoController',
  deleteProyectoGradoController: 'titulacion.deleteProyectoGradoController',
  asignarTutorProyectoController: 'titulacion.asignarTutorProyectoController',
  aprobarEtapaProyectoController: 'titulacion.aprobarEtapaProyectoController',
  addIntegranteProyectoController: 'titulacion.addIntegranteProyectoController',
  updateIntegranteProyectoController: 'titulacion.updateIntegranteProyectoController',
  listBitacoraProyectoController: 'titulacion.listBitacoraProyectoController',
  createBitacoraEntradaController: 'titulacion.createBitacoraEntradaController',
  updateBitacoraEntradaController: 'titulacion.updateBitacoraEntradaController',
  confirmarBitacoraEstudianteController: 'titulacion.confirmarBitacoraEstudianteController',
  listAvancesProyectoController: 'titulacion.listAvancesProyectoController',
  getAvanceByIdController: 'titulacion.getAvanceByIdController',
  createAvanceProyectoController: 'titulacion.createAvanceProyectoController',
  downloadAvanceArchivoController: 'titulacion.downloadAvanceArchivoController',
  listDictamenesProyectoController: 'titulacion.listDictamenesProyectoController',
  exportDictamenPdfController: 'titulacion.exportDictamenPdfController',

  // Router
  proyectosGradoRouter: 'titulacion.proyectosGradoRouter',
};
