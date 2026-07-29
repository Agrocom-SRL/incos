/**
 * Registro del módulo Pasantías (TUT · práctica laboral)
 *
 * Orquesta el registro del módulo completo (patrón del módulo Tutorías):
 * 1. Repositorios propios (arquetipo A + view repo B) con tokens scoped
 *    PASANTIAS_TOKENS.* — diff mínimo: no se toca repositories.container.js
 *    ni repositorios.tokens.js compartidos.
 * 2. Servicios propios (generador PDF de informes).
 * 3. Recurso (use cases + controllers + router): pasantias.container.js.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Pasantías registrado
 */

import { PASANTIAS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerRepository, registerService } from '../../utils/container.helpers.js';
import { PasantiaRepository } from '../../../repositories/PasantiaRepository.js';
import { PasantiaEmpresaRepository } from '../../../repositories/PasantiaEmpresaRepository.js';
import { PasantiaInformeRepository } from '../../../repositories/PasantiaInformeRepository.js';
import { PasantiaSeguimientoRepository } from '../../../repositories/PasantiaSeguimientoRepository.js';
import { PasantiaViewRepository } from '../../../repositories/views/PasantiaViewRepository.js';
import { PasantiaInformePdfGenerator } from '../../../external/pdf/pasantias/PasantiaInformePdfGenerator.js';
import { registerPasantiasResource } from './pasantias.container.js';

export function registerPasantiasModule(container) {
  // ============================================
  // REPOSITORIOS (singletons del módulo)
  // ============================================
  registerRepository(container, PASANTIAS_TOKENS.pasantiaRepository, PasantiaRepository);
  registerRepository(
    container,
    PASANTIAS_TOKENS.pasantiaEmpresaRepository,
    PasantiaEmpresaRepository
  );
  registerRepository(
    container,
    PASANTIAS_TOKENS.pasantiaInformeRepository,
    PasantiaInformeRepository
  );
  registerRepository(
    container,
    PASANTIAS_TOKENS.pasantiaSeguimientoRepository,
    PasantiaSeguimientoRepository
  );
  registerRepository(container, PASANTIAS_TOKENS.pasantiaViewRepository, PasantiaViewRepository);

  // ============================================
  // SERVICIOS DEL MÓDULO
  // ============================================
  registerService(
    container,
    PASANTIAS_TOKENS.pasantiaInformePdfGenerator,
    (c) => new PasantiaInformePdfGenerator({ logger: c.resolve(SERVICIOS_TOKENS.logger) })
  );

  // ============================================
  // RECURSO (use cases + controllers + router)
  // ============================================
  registerPasantiasResource(container);

  return container;
}
