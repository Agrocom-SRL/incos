/**
 * Registro del módulo Titulación (TIT)
 *
 * Orquesta el registro del módulo completo (patrón del módulo Capacitación):
 * 1. Repositorios propios (arquetipo A + view repo B) con tokens scoped
 *    TITULACION_TOKENS.* — diff mínimo: no se toca repositories.container.js
 *    ni repositorios.tokens.js compartidos.
 * 2. Recurso (use cases + controllers + router): proyectos-grado.
 *
 * Nota (2026-07-31): este módulo se llamaba `registerTutoriasModule` (TUT) y
 * también registraba el recurso Acompañamiento (riesgo + sesiones + panel).
 * Ese sub-grupo se reclasificó al dominio Académico — ver
 * `container/modules/academico/acompanamiento.container.js` y
 * `container/modules/academico/index.js`.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Titulación registrado
 */

import { TITULACION_TOKENS } from '../../tokens/index.js';
import { registerRepository } from '../../utils/container.helpers.js';
import { ModalidadGradoRepository } from '../../../repositories/ModalidadGradoRepository.js';
import { ProyectoGradoRepository } from '../../../repositories/ProyectoGradoRepository.js';
import { IntegranteProyectoRepository } from '../../../repositories/IntegranteProyectoRepository.js';
import { AvanceProyectoRepository } from '../../../repositories/AvanceProyectoRepository.js';
import { BitacoraProyectoRepository } from '../../../repositories/BitacoraProyectoRepository.js';
import { DictamenProyectoRepository } from '../../../repositories/DictamenProyectoRepository.js';
import { ProyectoGradoListadoViewRepository } from '../../../repositories/views/ProyectoGradoListadoViewRepository.js';
import { registerProyectosGradoResource } from './proyectos-grado.container.js';

export function registerTitulacionModule(container) {
  // ============================================
  // REPOSITORIOS (singletons del módulo)
  // ============================================
  registerRepository(
    container,
    TITULACION_TOKENS.modalidadGradoRepository,
    ModalidadGradoRepository
  );
  registerRepository(container, TITULACION_TOKENS.proyectoGradoRepository, ProyectoGradoRepository);
  registerRepository(
    container,
    TITULACION_TOKENS.integranteProyectoRepository,
    IntegranteProyectoRepository
  );
  registerRepository(
    container,
    TITULACION_TOKENS.avanceProyectoRepository,
    AvanceProyectoRepository
  );
  registerRepository(
    container,
    TITULACION_TOKENS.bitacoraProyectoRepository,
    BitacoraProyectoRepository
  );
  registerRepository(
    container,
    TITULACION_TOKENS.dictamenProyectoRepository,
    DictamenProyectoRepository
  );
  registerRepository(
    container,
    TITULACION_TOKENS.proyectoGradoListadoViewRepository,
    ProyectoGradoListadoViewRepository
  );

  // ============================================
  // RECURSO (use cases + controllers + router)
  // ============================================
  registerProyectosGradoResource(container);

  return container;
}
