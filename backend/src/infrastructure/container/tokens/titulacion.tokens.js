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
  // Acta de defensa de grado (extensión 2026-08-01)
  actaDefensaRepository: 'titulacion.actaDefensaRepository',
  proyectoGradoListadoViewRepository: 'titulacion.proyectoGradoListadoViewRepository',
  // Vistas 178/179/181 — extensión 2026-07-31 (formulario de modalidad,
  // reporte de avance por carrera, planilla "10 en 10"). Aislado del repo de
  // arriba (SRP): ver ITutoriaAvanceViewRepository.
  tutoriaAvanceViewRepository: 'titulacion.tutoriaAvanceViewRepository',

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

  // Use Cases — acta de defensa de grado (extensión 2026-08-01; anulación P8 agregada 2026-08-02)
  registrarActaDefensaUseCase: 'titulacion.registrarActaDefensaUseCase',
  listActasDefensaProyectoUseCase: 'titulacion.listActasDefensaProyectoUseCase',
  exportActaDefensaPdfUseCase: 'titulacion.exportActaDefensaPdfUseCase',
  anularActaDefensaUseCase: 'titulacion.anularActaDefensaUseCase',

  // Use Cases — extensión 2026-07-31 (formulario de modalidad de graduación,
  // reporte de avance por carrera)
  listEstudiantesElegiblesModalidadGradoUseCase:
    'titulacion.listEstudiantesElegiblesModalidadGradoUseCase',
  exportFormularioModalidadGradoPdfUseCase: 'titulacion.exportFormularioModalidadGradoPdfUseCase',
  getAvanceTutoriaCarreraUseCase: 'titulacion.getAvanceTutoriaCarreraUseCase',
  exportAvanceTutoriaCarreraPdfUseCase: 'titulacion.exportAvanceTutoriaCarreraPdfUseCase',

  // Use Cases — extensión 2026-08-10: Seguimiento de tutorías a docentes
  // (reemplaza la planilla de avance "10 en 10" de 3er año). El use case
  // por docente alimenta el tablero en pantalla; el de por carrera (mismo
  // mes, agrupado por carrera en vez de por docente) es exclusivo del Excel.
  getSeguimientoTutoriaDocentesUseCase: 'titulacion.getSeguimientoTutoriaDocentesUseCase',
  getSeguimientoTutoriaDocentesPorCarreraUseCase:
    'titulacion.getSeguimientoTutoriaDocentesPorCarreraUseCase',
  exportSeguimientoTutoriaDocentesExcelUseCase:
    'titulacion.exportSeguimientoTutoriaDocentesExcelUseCase',

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

  // Controllers — acta de defensa de grado (extensión 2026-08-01; anulación P8 agregada 2026-08-02)
  registrarActaDefensaController: 'titulacion.registrarActaDefensaController',
  listActasDefensaController: 'titulacion.listActasDefensaController',
  exportActaDefensaPdfController: 'titulacion.exportActaDefensaPdfController',
  anularActaDefensaController: 'titulacion.anularActaDefensaController',

  // Controllers — extensión 2026-07-31
  listEstudiantesElegiblesModalidadGradoController:
    'titulacion.listEstudiantesElegiblesModalidadGradoController',
  exportFormularioModalidadGradoPdfController:
    'titulacion.exportFormularioModalidadGradoPdfController',
  getAvanceTutoriaCarreraController: 'titulacion.getAvanceTutoriaCarreraController',
  exportAvanceTutoriaCarreraPdfController: 'titulacion.exportAvanceTutoriaCarreraPdfController',

  // Controllers — extensión 2026-08-10: Seguimiento de tutorías a docentes
  getSeguimientoTutoriaDocentesController: 'titulacion.getSeguimientoTutoriaDocentesController',
  exportSeguimientoTutoriaDocentesExcelController:
    'titulacion.exportSeguimientoTutoriaDocentesExcelController',

  // Router
  proyectosGradoRouter: 'titulacion.proyectosGradoRouter',
};
