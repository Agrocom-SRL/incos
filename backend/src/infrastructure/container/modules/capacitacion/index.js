/**
 * Registro del módulo Capacitación (CAP)
 *
 * Orquesta el registro del módulo completo:
 * 1. Repositorios propios (arquetipo A + view repo B) con tokens scoped
 *    CAPACITACION_TOKENS.* — diff mínimo: no se toca repositories.container.js
 *    ni repositorios.tokens.js compartidos.
 * 2. Recursos (use cases + controllers + routers): cursos-capacitacion,
 *    participantes, pagos-capacitacion (antes que inscripciones: el create de
 *    inscripciones compone el use case de pago), inscripciones-capacitacion.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Capacitación registrado
 */

import { CAPACITACION_TOKENS } from '../../tokens/index.js';
import { registerRepository } from '../../utils/container.helpers.js';
import { ParticipanteRepository } from '../../../repositories/ParticipanteRepository.js';
import { CursoCapacitacionRepository } from '../../../repositories/CursoCapacitacionRepository.js';
import { InscripcionCapacitacionRepository } from '../../../repositories/InscripcionCapacitacionRepository.js';
import { PagoCapacitacionRepository } from '../../../repositories/PagoCapacitacionRepository.js';
import { GrupoCapacitacionRepository } from '../../../repositories/GrupoCapacitacionRepository.js';
import { BloqueCapacitacionRepository } from '../../../repositories/BloqueCapacitacionRepository.js';
import { CapacitacionRequisitoRepository } from '../../../repositories/CapacitacionRequisitoRepository.js';
import { CapacitacionInscritoRequisitoRepository } from '../../../repositories/CapacitacionInscritoRequisitoRepository.js';
import { CapacitacionCompromisoRepository } from '../../../repositories/CapacitacionCompromisoRepository.js';
import { GrupoCapacitacionListadoViewRepository } from '../../../repositories/views/GrupoCapacitacionListadoViewRepository.js';
import { CursoCapacitacionFichaViewRepository } from '../../../repositories/views/CursoCapacitacionFichaViewRepository.js';
import { registerCursosCapacitacionResource } from './cursos-capacitacion.container.js';
import { registerParticipantesResource } from './participantes.container.js';
import { registerPagosCapacitacionResource } from './pagos-capacitacion.container.js';
import { registerInscripcionesCapacitacionResource } from './inscripciones-capacitacion.container.js';

export function registerCapacitacionModule(container) {
    // ============================================
    // REPOSITORIOS (singletons del módulo)
    // ============================================
    registerRepository(
        container,
        CAPACITACION_TOKENS.participanteRepository,
        ParticipanteRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.cursoCapacitacionRepository,
        CursoCapacitacionRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.inscripcionCapacitacionRepository,
        InscripcionCapacitacionRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.pagoCapacitacionRepository,
        PagoCapacitacionRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.capacitacionCompromisoRepository,
        CapacitacionCompromisoRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.grupoCapacitacionRepository,
        GrupoCapacitacionRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.bloqueCapacitacionRepository,
        BloqueCapacitacionRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.capacitacionRequisitoRepository,
        CapacitacionRequisitoRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.capacitacionInscritoRequisitoRepository,
        CapacitacionInscritoRequisitoRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.grupoCapacitacionListadoViewRepository,
        GrupoCapacitacionListadoViewRepository
    );
    registerRepository(
        container,
        CAPACITACION_TOKENS.cursoCapacitacionFichaViewRepository,
        CursoCapacitacionFichaViewRepository
    );

    // ============================================
    // RECURSOS (use cases + controllers + routers)
    // ============================================
    registerCursosCapacitacionResource(container);
    registerParticipantesResource(container);
    // Pagos antes que Inscripciones: CreateInscripcionCapacitacionUseCase
    // compone registerPagoCapacitacionUseCase (pago inicial en la transacción)
    registerPagosCapacitacionResource(container);
    registerInscripcionesCapacitacionResource(container);

    return container;
}
