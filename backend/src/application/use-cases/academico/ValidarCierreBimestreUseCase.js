/**
 * Validaciones previas al cierre de un bimestre.
 */
export class ValidarCierreBimestreUseCase {
  constructor({ gestionBimestresRepository, calificacionContextoRepository }) {
    this.gestionBimestresRepository = gestionBimestresRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
  }

  async execute({ numeroBimestre }) {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      const err = new Error('No hay gestión académica vigente');
      err.statusCode = 404;
      throw err;
    }
    return this.gestionBimestresRepository.validarCierreBimestre(
      numeroBimestre,
      Number(ctx.gestion_id),
    );
  }
}
