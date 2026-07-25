/**
 * Tokens de DI del módulo Tutorías y Acompañamiento Académico (TUT)
 *
 * Los repositorios del módulo se registran con tokens propios (scoped
 * 'tutorias.*') dentro de registerTutoriasModule — diff mínimo en los índices
 * compartidos (patrón del módulo Capacitación): solo se toca tokens/index.js,
 * modules/index.js y presentation/routes/index.js.
 */
export const TUTORIAS_TOKENS = {
  // Repositorios (arquetipo A + arquetipo B de vistas)
  modalidadGradoRepository: 'tutorias.modalidadGradoRepository',
  proyectoGradoRepository: 'tutorias.proyectoGradoRepository',
  tutoriaIntegranteRepository: 'tutorias.tutoriaIntegranteRepository',
  tutoriaAvanceRepository: 'tutorias.tutoriaAvanceRepository',
  tutoriaBitacoraRepository: 'tutorias.tutoriaBitacoraRepository',
  tutoriaDictamenRepository: 'tutorias.tutoriaDictamenRepository',
  sesionReforzamientoRepository: 'tutorias.sesionReforzamientoRepository',
  sesionReforzamientoParticipanteRepository: 'tutorias.sesionReforzamientoParticipanteRepository',
  proyectoGradoListadoViewRepository: 'tutorias.proyectoGradoListadoViewRepository',
  riesgoAcademicoViewRepository: 'tutorias.riesgoAcademicoViewRepository',
  acompanamientoSesionViewRepository: 'tutorias.acompanamientoSesionViewRepository',

  // Use Cases — Titulación (proyectos de grado)
  listProyectosGradoUseCase: 'tutorias.listProyectosGradoUseCase',
  listModalidadesGradoUseCase: 'tutorias.listModalidadesGradoUseCase',
  listMisTutoradosUseCase: 'tutorias.listMisTutoradosUseCase',
  getMiProyectoGradoUseCase: 'tutorias.getMiProyectoGradoUseCase',
  exportBitacoraMensualTutorPdfUseCase: 'tutorias.exportBitacoraMensualTutorPdfUseCase',
  getProyectoGradoByIdUseCase: 'tutorias.getProyectoGradoByIdUseCase',
  createProyectoGradoUseCase: 'tutorias.createProyectoGradoUseCase',
  updateProyectoGradoUseCase: 'tutorias.updateProyectoGradoUseCase',
  deleteProyectoGradoUseCase: 'tutorias.deleteProyectoGradoUseCase',
  asignarTutorProyectoUseCase: 'tutorias.asignarTutorProyectoUseCase',
  aprobarEtapaProyectoUseCase: 'tutorias.aprobarEtapaProyectoUseCase',
  addIntegranteProyectoUseCase: 'tutorias.addIntegranteProyectoUseCase',
  updateIntegranteProyectoUseCase: 'tutorias.updateIntegranteProyectoUseCase',
  listBitacoraProyectoUseCase: 'tutorias.listBitacoraProyectoUseCase',
  createBitacoraEntradaUseCase: 'tutorias.createBitacoraEntradaUseCase',
  updateBitacoraEntradaUseCase: 'tutorias.updateBitacoraEntradaUseCase',
  confirmarBitacoraEstudianteUseCase: 'tutorias.confirmarBitacoraEstudianteUseCase',
  listAvancesProyectoUseCase: 'tutorias.listAvancesProyectoUseCase',
  getAvanceByIdUseCase: 'tutorias.getAvanceByIdUseCase',
  createAvanceProyectoUseCase: 'tutorias.createAvanceProyectoUseCase',
  downloadAvanceArchivoUseCase: 'tutorias.downloadAvanceArchivoUseCase',
  listDictamenesProyectoUseCase: 'tutorias.listDictamenesProyectoUseCase',
  exportDictamenPdfUseCase: 'tutorias.exportDictamenPdfUseCase',

  // Use Cases — Acompañamiento
  listAlertasRiesgoUseCase: 'tutorias.listAlertasRiesgoUseCase',
  listMisAlertasRiesgoDocenteUseCase: 'tutorias.listMisAlertasRiesgoDocenteUseCase',
  getAlertaRiesgoEstudianteUseCase: 'tutorias.getAlertaRiesgoEstudianteUseCase',
  listSesionesReforzamientoUseCase: 'tutorias.listSesionesReforzamientoUseCase',
  getSesionReforzamientoByIdUseCase: 'tutorias.getSesionReforzamientoByIdUseCase',
  createSesionReforzamientoUseCase: 'tutorias.createSesionReforzamientoUseCase',
  updateSesionReforzamientoUseCase: 'tutorias.updateSesionReforzamientoUseCase',
  deleteSesionReforzamientoUseCase: 'tutorias.deleteSesionReforzamientoUseCase',
  registerAsistenciaSesionUseCase: 'tutorias.registerAsistenciaSesionUseCase',
  getPanelAcompanamientoUseCase: 'tutorias.getPanelAcompanamientoUseCase',
  exportPanelAcompanamientoPdfUseCase: 'tutorias.exportPanelAcompanamientoPdfUseCase',

  // Controllers — Titulación
  listProyectosGradoController: 'tutorias.listProyectosGradoController',
  listModalidadesGradoController: 'tutorias.listModalidadesGradoController',
  listMisTutoradosController: 'tutorias.listMisTutoradosController',
  getMiProyectoGradoController: 'tutorias.getMiProyectoGradoController',
  exportBitacoraMensualTutorController: 'tutorias.exportBitacoraMensualTutorController',
  getProyectoGradoByIdController: 'tutorias.getProyectoGradoByIdController',
  createProyectoGradoController: 'tutorias.createProyectoGradoController',
  updateProyectoGradoController: 'tutorias.updateProyectoGradoController',
  deleteProyectoGradoController: 'tutorias.deleteProyectoGradoController',
  asignarTutorProyectoController: 'tutorias.asignarTutorProyectoController',
  aprobarEtapaProyectoController: 'tutorias.aprobarEtapaProyectoController',
  addIntegranteProyectoController: 'tutorias.addIntegranteProyectoController',
  updateIntegranteProyectoController: 'tutorias.updateIntegranteProyectoController',
  listBitacoraProyectoController: 'tutorias.listBitacoraProyectoController',
  createBitacoraEntradaController: 'tutorias.createBitacoraEntradaController',
  updateBitacoraEntradaController: 'tutorias.updateBitacoraEntradaController',
  confirmarBitacoraEstudianteController: 'tutorias.confirmarBitacoraEstudianteController',
  listAvancesProyectoController: 'tutorias.listAvancesProyectoController',
  getAvanceByIdController: 'tutorias.getAvanceByIdController',
  createAvanceProyectoController: 'tutorias.createAvanceProyectoController',
  downloadAvanceArchivoController: 'tutorias.downloadAvanceArchivoController',
  listDictamenesProyectoController: 'tutorias.listDictamenesProyectoController',
  exportDictamenPdfController: 'tutorias.exportDictamenPdfController',

  // Controllers — Acompañamiento
  listAlertasRiesgoController: 'tutorias.listAlertasRiesgoController',
  listMisAlertasRiesgoDocenteController: 'tutorias.listMisAlertasRiesgoDocenteController',
  getAlertaRiesgoEstudianteController: 'tutorias.getAlertaRiesgoEstudianteController',
  listSesionesReforzamientoController: 'tutorias.listSesionesReforzamientoController',
  getSesionReforzamientoByIdController: 'tutorias.getSesionReforzamientoByIdController',
  createSesionReforzamientoController: 'tutorias.createSesionReforzamientoController',
  updateSesionReforzamientoController: 'tutorias.updateSesionReforzamientoController',
  deleteSesionReforzamientoController: 'tutorias.deleteSesionReforzamientoController',
  registerAsistenciaSesionController: 'tutorias.registerAsistenciaSesionController',
  getPanelAcompanamientoController: 'tutorias.getPanelAcompanamientoController',
  exportPanelAcompanamientoController: 'tutorias.exportPanelAcompanamientoController',

  // Routers
  proyectosGradoRouter: 'tutorias.proyectosGradoRouter',
  acompanamientoRouter: 'tutorias.acompanamientoRouter',
};
