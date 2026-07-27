/**
 * Registro del módulo Tutorías y Acompañamiento Académico (TUT)
 *
 * Orquesta el registro del módulo completo (patrón del módulo Capacitación):
 * 1. Repositorios propios (arquetipo A + view repos B) con tokens scoped
 *    TUTORIAS_TOKENS.* — diff mínimo: no se toca repositories.container.js
 *    ni repositorios.tokens.js compartidos.
 * 2. Recursos (use cases + controllers + routers): proyectos-grado
 *    (titulación) y acompanamiento (riesgo + sesiones + panel).
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Tutorías registrado
 */

import { TUTORIAS_TOKENS } from '../../tokens/index.js';
import { registerRepository } from '../../utils/container.helpers.js';
import { ModalidadGradoRepository } from '../../../repositories/ModalidadGradoRepository.js';
import { ProyectoGradoRepository } from '../../../repositories/ProyectoGradoRepository.js';
import { IntegranteProyectoRepository } from '../../../repositories/IntegranteProyectoRepository.js';
import { AvanceProyectoRepository } from '../../../repositories/AvanceProyectoRepository.js';
import { BitacoraProyectoRepository } from '../../../repositories/BitacoraProyectoRepository.js';
import { DictamenProyectoRepository } from '../../../repositories/DictamenProyectoRepository.js';
import { SesionRefuerzoRepository } from '../../../repositories/SesionRefuerzoRepository.js';
import { SesionRefuerzoEstudianteRepository } from '../../../repositories/SesionRefuerzoEstudianteRepository.js';
import { ProyectoGradoListadoViewRepository } from '../../../repositories/views/ProyectoGradoListadoViewRepository.js';
import { RiesgoAcademicoViewRepository } from '../../../repositories/views/RiesgoAcademicoViewRepository.js';
import { AcompanamientoSesionViewRepository } from '../../../repositories/views/AcompanamientoSesionViewRepository.js';
import { registerProyectosGradoResource } from './proyectos-grado.container.js';
import { registerAcompanamientoResource } from './acompanamiento.container.js';

export function registerTutoriasModule(container) {
  // ============================================
  // REPOSITORIOS (singletons del módulo)
  // ============================================
  registerRepository(container, TUTORIAS_TOKENS.modalidadGradoRepository, ModalidadGradoRepository);
  registerRepository(container, TUTORIAS_TOKENS.proyectoGradoRepository, ProyectoGradoRepository);
  registerRepository(
    container,
    TUTORIAS_TOKENS.integranteProyectoRepository,
    IntegranteProyectoRepository
  );
  registerRepository(container, TUTORIAS_TOKENS.avanceProyectoRepository, AvanceProyectoRepository);
  registerRepository(
    container,
    TUTORIAS_TOKENS.bitacoraProyectoRepository,
    BitacoraProyectoRepository
  );
  registerRepository(
    container,
    TUTORIAS_TOKENS.dictamenProyectoRepository,
    DictamenProyectoRepository
  );
  registerRepository(
    container,
    TUTORIAS_TOKENS.sesionRefuerzoRepository,
    SesionRefuerzoRepository
  );
  registerRepository(
    container,
    TUTORIAS_TOKENS.sesionRefuerzoEstudianteRepository,
    SesionRefuerzoEstudianteRepository
  );
  registerRepository(
    container,
    TUTORIAS_TOKENS.proyectoGradoListadoViewRepository,
    ProyectoGradoListadoViewRepository
  );
  registerRepository(
    container,
    TUTORIAS_TOKENS.riesgoAcademicoViewRepository,
    RiesgoAcademicoViewRepository
  );
  registerRepository(
    container,
    TUTORIAS_TOKENS.acompanamientoSesionViewRepository,
    AcompanamientoSesionViewRepository
  );

  // ============================================
  // RECURSOS (use cases + controllers + routers)
  // ============================================
  registerProyectosGradoResource(container);
  registerAcompanamientoResource(container);

  return container;
}
