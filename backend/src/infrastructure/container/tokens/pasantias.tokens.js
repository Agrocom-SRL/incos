/**
 * Tokens de DI del módulo Pasantías (TUT · práctica laboral)
 *
 * Los repositorios del módulo se registran con tokens propios (scoped
 * 'pasantias.*') dentro de registerPasantiasModule — diff mínimo en los
 * índices compartidos (patrón del módulo Tutorías): solo se toca
 * tokens/index.js, modules/index.js y presentation/routes/index.js.
 */
export const PASANTIAS_TOKENS = {
  // Repositorios (arquetipo A + arquetipo B de vistas)
  pasantiaRepository: 'pasantias.pasantiaRepository',
  pasantiaEmpresaRepository: 'pasantias.pasantiaEmpresaRepository',
  pasantiaInformeRepository: 'pasantias.pasantiaInformeRepository',
  pasantiaSeguimientoRepository: 'pasantias.pasantiaSeguimientoRepository',
  pasantiaViewRepository: 'pasantias.pasantiaViewRepository',

  // Servicios propios del módulo
  pasantiaInformePdfGenerator: 'pasantias.pasantiaInformePdfGenerator',

  // Use Cases — trámites
  listPasantiasUseCase: 'pasantias.listPasantiasUseCase',
  getPasantiaUseCase: 'pasantias.getPasantiaUseCase',
  createPasantiaUseCase: 'pasantias.createPasantiaUseCase',
  updatePasantiaUseCase: 'pasantias.updatePasantiaUseCase',
  deletePasantiaUseCase: 'pasantias.deletePasantiaUseCase',
  transicionarPasantiaUseCase: 'pasantias.transicionarPasantiaUseCase',

  // Use Cases — catálogo de empresas
  listPasantiasEmpresasUseCase: 'pasantias.listPasantiasEmpresasUseCase',
  getPasantiaEmpresaUseCase: 'pasantias.getPasantiaEmpresaUseCase',
  createPasantiaEmpresaUseCase: 'pasantias.createPasantiaEmpresaUseCase',
  updatePasantiaEmpresaUseCase: 'pasantias.updatePasantiaEmpresaUseCase',
  setEstadoPasantiaEmpresaUseCase: 'pasantias.setEstadoPasantiaEmpresaUseCase',
  deletePasantiaEmpresaUseCase: 'pasantias.deletePasantiaEmpresaUseCase',

  // Use Cases — portal por rol
  listMisPasantiasSupervisadasUseCase: 'pasantias.listMisPasantiasSupervisadasUseCase',
  getMiPasantiaUseCase: 'pasantias.getMiPasantiaUseCase',

  // Use Cases — informes y seguimientos
  listInformesPasantiaUseCase: 'pasantias.listInformesPasantiaUseCase',
  createInformePasantiaUseCase: 'pasantias.createInformePasantiaUseCase',
  updateInformePasantiaUseCase: 'pasantias.updateInformePasantiaUseCase',
  exportInformePasantiaPdfUseCase: 'pasantias.exportInformePasantiaPdfUseCase',
  listSeguimientosPasantiaUseCase: 'pasantias.listSeguimientosPasantiaUseCase',
  createSeguimientoPasantiaUseCase: 'pasantias.createSeguimientoPasantiaUseCase',
  updateSeguimientoPasantiaUseCase: 'pasantias.updateSeguimientoPasantiaUseCase',

  // Controllers — trámites
  listPasantiasController: 'pasantias.listPasantiasController',
  getPasantiaByIdController: 'pasantias.getPasantiaByIdController',
  createPasantiaController: 'pasantias.createPasantiaController',
  updatePasantiaController: 'pasantias.updatePasantiaController',
  deletePasantiaController: 'pasantias.deletePasantiaController',
  transicionarPasantiaController: 'pasantias.transicionarPasantiaController',

  // Controllers — catálogo de empresas
  listPasantiasEmpresasController: 'pasantias.listPasantiasEmpresasController',
  getPasantiaEmpresaController: 'pasantias.getPasantiaEmpresaController',
  createPasantiaEmpresaController: 'pasantias.createPasantiaEmpresaController',
  updatePasantiaEmpresaController: 'pasantias.updatePasantiaEmpresaController',
  setEstadoPasantiaEmpresaController: 'pasantias.setEstadoPasantiaEmpresaController',
  deletePasantiaEmpresaController: 'pasantias.deletePasantiaEmpresaController',

  // Controllers — portal por rol
  listMisPasantiasSupervisadasController: 'pasantias.listMisPasantiasSupervisadasController',
  getMiPasantiaController: 'pasantias.getMiPasantiaController',

  // Controllers — informes y seguimientos
  listInformesPasantiaController: 'pasantias.listInformesPasantiaController',
  createInformePasantiaController: 'pasantias.createInformePasantiaController',
  updateInformePasantiaController: 'pasantias.updateInformePasantiaController',
  exportInformePasantiaPdfController: 'pasantias.exportInformePasantiaPdfController',
  listSeguimientosPasantiaController: 'pasantias.listSeguimientosPasantiaController',
  createSeguimientoPasantiaController: 'pasantias.createSeguimientoPasantiaController',
  updateSeguimientoPasantiaController: 'pasantias.updateSeguimientoPasantiaController',

  // Routers
  pasantiasRouter: 'pasantias.router',
};
