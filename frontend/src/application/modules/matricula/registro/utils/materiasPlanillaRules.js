/**
 * Reglas de la planilla de materias del wizard de matrícula (paso «Periodo y
 * materias»). Helpers PUROS de la capa application: el organismo
 * MateriasPlanillaSelector solo pinta el modelo que se construye aquí.
 *
 * Espejo frontend de las reglas de negocio del backend
 * (enrollmentBusinessRules.validarReglasInscripcion, §2 y §4-C1 de
 * docs/plan/matricula-wizard-rediseno.md):
 * - NUEVO: solo el primer periodo, bloque completo (auto-marcado y bloqueado).
 * - esNuevoSistema + ANTIGUO: todos los periodos libres (plan vigente).
 * - TRASPASO: periodos ≤ anio_cursado deshabilitados («Convalidado por traspaso»).
 * - TRANSITABILIDAD: periodo 1 deshabilitado (se convalida vía historial previo).
 * - tieneHistorialSistema: aprobadas del kardex fijas, pendientes de periodos
 *   anteriores al que le toca PRE-MARCADAS como «a nivelar» (desmarcables),
 *   prerrequisitos no aprobados bloqueados y salto máximo
 *   (periodos numero > minPeriodoPendiente + 1 deshabilitados).
 * - Prerrequisito satisfecho si está APROBADO/CONVALIDADO en el kardex O si su
 *   periodo quedará convalidado/aprobado en el historial previo del propio
 *   wizard (periodos concluidos según computeConcludedPeriods, que es lo que
 *   viaja como prior_history al backend).
 */

/** Estados del kardex (vista 141) que cuentan como materia vencida. */
export const ESTADOS_KARDEX_APROBADO = ['APROBADO', 'CONVALIDADO'];

/** Estados de fila de la planilla (clases CSS materias-planilla__row--*). */
export const PLANILLA_ROW_ESTADOS = {
  APROBADA: 'aprobada',
  FIJA: 'fija',
  BLOQUEADA_PERIODO: 'bloqueada-periodo',
  BLOQUEADA_PRERREQUISITO: 'bloqueada-prerrequisito',
  SELECCIONADA: 'seleccionada',
  NORMAL: 'normal',
};

/**
 * Motivo del estado de un periodo completo. YA NO se pinta en la cabecera del
 * año de la planilla (2026-08-14): el periodo bloqueado se entiende por su
 * atenuación y por el tooltip de cada fila. El modelo lo sigue exponiendo en
 * `periodo.subtitulo` por si otra pantalla necesita explicarlo.
 */
export const PERIODO_SUBTITULOS = {
  ACTUAL: 'Su periodo actual',
  DISPONIBLE: 'Disponible',
  BLOQUEADO_SECUENCIA: 'Bloqueado: primero concluya periodos anteriores',
  CONVALIDADO_TRASPASO: 'Convalidado por traspaso',
  CONVALIDADO_TRANSITABILIDAD: 'Convalidado por transitabilidad',
};

const toNumberOrNull = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const esAprobadaKardex = (asignatura) =>
  ESTADOS_KARDEX_APROBADO.includes(String(asignatura?.estadoHistorial ?? '').toUpperCase());

/** Perfil normalizado desde el contexto (con fallbacks por si aún no llegó el dato). */
function resolverPerfil(contexto, overrides = {}) {
  const estudiante = contexto?.estudiante ?? {};
  const tipoAdmision = String(
    overrides.tipoAdmision ?? estudiante.tipoAdmision ?? ''
  ).toUpperCase();
  const esNuevoSistema =
    overrides.esNuevoSistema ?? (estudiante.esNuevoSistema != null ? !!estudiante.esNuevoSistema : null);
  const traspasoAnioCursado =
    overrides.traspasoAnioCursado ?? estudiante.traspasoAnioCursado ?? null;
  return {
    tipoAdmision,
    esNuevoSistema,
    tieneHistorialSistema: esNuevoSistema === false,
    traspasoAnioCursado,
  };
}

/** TRASPASO: número máximo de periodo ya cursado en la institución de origen. */
function traspasoBloqueadoHasta(traspasoAnioCursado) {
  const v = String(traspasoAnioCursado ?? '').toUpperCase();
  if (v === 'PRIMERO') return 1;
  if (v === 'SEGUNDO') return 2;
  return null;
}

/**
 * Periodo «que le toca» a un estudiante con historial digital: primer periodo
 * sin cursar (todas sus asignaturas sin estadoHistorial), acotado por el salto
 * máximo del backend (minPeriodoPendiente + 1). null sin historial/pendientes.
 */
export function computePeriodoQueLeToca({ periodos = [], minPeriodoPendiente = null } = {}) {
  if (minPeriodoPendiente == null) return null;
  const cap = Number(minPeriodoPendiente) + 1;

  let primerNoCursado = null;
  for (const periodo of periodos) {
    const asignaturas = periodo?.asignaturas ?? [];
    if (!asignaturas.length) continue;
    const sinCursar = asignaturas.every((a) => a?.estadoHistorial == null);
    const numero = Number(periodo?.numero ?? 0) || 0;
    if (sinCursar && numero > 0 && (primerNoCursado == null || numero < primerNoCursado)) {
      primerNoCursado = numero;
    }
  }

  if (primerNoCursado == null) return Number(minPeriodoPendiente);
  return Math.min(primerNoCursado, cap);
}

/**
 * ¿El periodo `prereqNumero` quedará cubierto por el historial previo del
 * propio wizard? Espejo de computeConcludedPeriods (historialPrevioHelpers):
 * - TRASPASO: periodos ≤ anio_cursado (bloqueados) + periodos < mínimo
 *   seleccionado (unión §4-C4).
 * - ANTIGUO/TRANSITABILIDAD (esNuevoSistema): periodos < mínimo periodo con
 *   materias seleccionadas; al evaluar una fila se considera también su propio
 *   periodo como hipotéticamente seleccionado (regla en vivo).
 * - tieneHistorialSistema/NUEVO: nunca (sin historial previo en el wizard).
 */
function prereqCubiertoPorWizard({
  perfil,
  prereqNumero,
  materiaNumero,
  minSelectedNumero,
}) {
  if (perfil.esNuevoSistema !== true) return false;
  const hipoteticoMin = Math.min(minSelectedNumero ?? materiaNumero, materiaNumero);
  if (perfil.tipoAdmision === 'TRASPASO') {
    const hasta = traspasoBloqueadoHasta(perfil.traspasoAnioCursado);
    return (hasta != null && prereqNumero <= hasta) || prereqNumero < hipoteticoMin;
  }
  if (perfil.tipoAdmision === 'ANTIGUO' || perfil.tipoAdmision === 'TRANSITABILIDAD') {
    return prereqNumero < hipoteticoMin;
  }
  return false;
}

/** Normaliza la selección { periodoId: materiaIds[] } a Maps de números. */
function normalizarSeleccion(seleccion = {}) {
  const porPeriodo = new Map();
  for (const [periodoKey, ids] of Object.entries(seleccion ?? {})) {
    const periodoId = toNumberOrNull(periodoKey);
    if (periodoId == null || !Array.isArray(ids) || ids.length === 0) continue;
    porPeriodo.set(periodoId, new Set(ids.map(Number).filter(Number.isFinite)));
  }
  return porPeriodo;
}

/**
 * Construye el modelo de la planilla: periodos con subtítulo/estado y filas con
 * estado, tooltip, tags y seleccionabilidad. Devuelve null sin contexto.
 *
 * @param {Object} params
 * @param {Object|null} params.contexto - contexto-matricula (§3-A3)
 * @param {Object} [params.seleccion] - { [periodoId]: materiaIds[] }
 * @param {boolean} [params.readOnly] - Edición NUEVO: planilla solo lectura
 * @param {string|null} [params.tipoAdmision] - Fallback si el contexto no lo trae
 * @param {boolean|null} [params.esNuevoSistema] - Fallback ídem
 * @param {string|null} [params.traspasoAnioCursado] - Fallback ídem
 */
export function buildMateriasPlanillaModel({
  contexto = null,
  seleccion = {},
  readOnly = false,
  tipoAdmision = null,
  esNuevoSistema = null,
  traspasoAnioCursado = null,
} = {}) {
  const periodosRaw = contexto?.periodos ?? [];
  if (!periodosRaw.length) return null;

  const perfil = resolverPerfil(contexto, { tipoAdmision, esNuevoSistema, traspasoAnioCursado });
  const seleccionPorPeriodo = normalizarSeleccion(seleccion);

  const periodosOrdenados = [...periodosRaw].sort(
    (a, b) => (Number(a?.numero) || 0) - (Number(b?.numero) || 0)
  );

  // Índices para resolver el prerrequisito (por asignaturaPlanId / materiaId / sigla).
  const porPlanId = new Map();
  const porMateriaId = new Map();
  const porSigla = new Map();
  for (const periodo of periodosOrdenados) {
    const numero = Number(periodo?.numero ?? 0) || 0;
    for (const asig of periodo?.asignaturas ?? []) {
      const entry = { asig, numero };
      const planId = toNumberOrNull(asig?.asignaturaPlanId);
      const materiaId = toNumberOrNull(asig?.materiaId);
      const sigla = String(asig?.sigla ?? '').trim().toUpperCase();
      if (planId != null) porPlanId.set(planId, entry);
      if (materiaId != null && !porMateriaId.has(materiaId)) porMateriaId.set(materiaId, entry);
      if (sigla && !porSigla.has(sigla)) porSigla.set(sigla, entry);
    }
  }

  const resolverPrereq = (prereq) => {
    if (!prereq) return null;
    const planId = toNumberOrNull(prereq.asignaturaPlanId);
    if (planId != null && porPlanId.has(planId)) return porPlanId.get(planId);
    const materiaId = toNumberOrNull(prereq.materiaId);
    if (materiaId != null && porMateriaId.has(materiaId)) return porMateriaId.get(materiaId);
    const sigla = String(prereq.sigla ?? '').trim().toUpperCase();
    return sigla ? (porSigla.get(sigla) ?? null) : null;
  };

  // Números de periodo con selección (para arrastre, salto en vivo y nivelación).
  const numeroByPeriodoId = new Map(
    periodosOrdenados.map((p) => [Number(p.id), Number(p?.numero ?? 0) || 0])
  );
  const numerosSeleccionados = [...seleccionPorPeriodo.keys()]
    .map((pid) => numeroByPeriodoId.get(pid) ?? 0)
    .filter((n) => n > 0);
  const minSelectedNumero = numerosSeleccionados.length ? Math.min(...numerosSeleccionados) : null;
  const maxSelectedNumero = numerosSeleccionados.length ? Math.max(...numerosSeleccionados) : null;

  const minPeriodoPendiente = perfil.tieneHistorialSistema
    ? (contexto?.resumenHistorial?.minPeriodoPendiente ?? null)
    : null;
  const saltoMaximoNumero = minPeriodoPendiente != null ? minPeriodoPendiente + 1 : null;
  const queLeTocaNumero = perfil.tieneHistorialSistema
    ? computePeriodoQueLeToca({ periodos: periodosOrdenados, minPeriodoPendiente })
    : null;
  const traspasoHasta =
    perfil.esNuevoSistema === true && perfil.tipoAdmision === 'TRASPASO'
      ? traspasoBloqueadoHasta(perfil.traspasoAnioCursado)
      : null;

  /** Estado del periodo completo según el tipo de admisión (§2). */
  const estadoPeriodo = (numero) => {
    if (perfil.esNuevoSistema === true) {
      if (perfil.tipoAdmision === 'NUEVO') {
        return numero === 1
          ? { disabled: false, fijo: true, subtitulo: PERIODO_SUBTITULOS.ACTUAL }
          : { disabled: true, fijo: false, subtitulo: PERIODO_SUBTITULOS.BLOQUEADO_SECUENCIA };
      }
      if (perfil.tipoAdmision === 'TRASPASO' && traspasoHasta != null && numero <= traspasoHasta) {
        return { disabled: true, fijo: false, subtitulo: PERIODO_SUBTITULOS.CONVALIDADO_TRASPASO };
      }
      if (perfil.tipoAdmision === 'TRANSITABILIDAD' && numero === 1) {
        return {
          disabled: true,
          fijo: false,
          subtitulo: PERIODO_SUBTITULOS.CONVALIDADO_TRANSITABILIDAD,
        };
      }
      return { disabled: false, fijo: false, subtitulo: PERIODO_SUBTITULOS.DISPONIBLE };
    }
    if (perfil.tieneHistorialSistema) {
      if (saltoMaximoNumero != null && numero > saltoMaximoNumero) {
        return { disabled: true, fijo: false, subtitulo: PERIODO_SUBTITULOS.BLOQUEADO_SECUENCIA };
      }
      if (queLeTocaNumero != null && numero === queLeTocaNumero) {
        return { disabled: false, fijo: false, subtitulo: PERIODO_SUBTITULOS.ACTUAL };
      }
      return { disabled: false, fijo: false, subtitulo: PERIODO_SUBTITULOS.DISPONIBLE };
    }
    // Dato esNuevoSistema aún no disponible: planilla libre sin subtítulos.
    return { disabled: false, fijo: false, subtitulo: null };
  };

  const premarcadasNivelar = [];
  let totalSeleccionadas = 0;

  const periodosModel = periodosOrdenados.map((periodo) => {
    const periodoId = Number(periodo.id);
    const numero = Number(periodo?.numero ?? 0) || 0;
    const { disabled, fijo, subtitulo } = estadoPeriodo(numero);
    const seleccionadasSet = seleccionPorPeriodo.get(periodoId) ?? new Set();

    const rows = (periodo?.asignaturas ?? []).map((asig) => {
      const materiaId = toNumberOrNull(asig?.materiaId);
      const aprobada = esAprobadaKardex(asig);
      const seleccionada = materiaId != null && seleccionadasSet.has(materiaId);

      let estado = PLANILLA_ROW_ESTADOS.NORMAL;
      let seleccionable = false;
      let tooltip = null;
      let tag = null;

      if (aprobada) {
        estado = PLANILLA_ROW_ESTADOS.APROBADA;
        const convalidada = String(asig.estadoHistorial).toUpperCase() === 'CONVALIDADO';
        tooltip = convalidada
          ? 'Convalidada en su historial académico'
          : `Aprobada en su historial académico${asig.notaFinal != null ? ` (nota ${asig.notaFinal})` : ''}`;
      } else if (disabled) {
        estado = PLANILLA_ROW_ESTADOS.BLOQUEADA_PERIODO;
      } else if (fijo) {
        // NUEVO: bloque completo del primer periodo, marcado y no desmarcable.
        estado = PLANILLA_ROW_ESTADOS.FIJA;
      } else {
        const prereqEntry = asig?.prerrequisito ? resolverPrereq(asig.prerrequisito) : null;
        const prereqAprobado =
          asig?.prerrequisito == null ||
          (prereqEntry
            ? esAprobadaKardex(prereqEntry.asig) ||
              prereqCubiertoPorWizard({
                perfil,
                prereqNumero: prereqEntry.numero,
                materiaNumero: numero,
                minSelectedNumero,
              })
            : true); // prerrequisito fuera del plan cargado: no se puede verificar aquí
        if (!prereqAprobado) {
          estado = PLANILLA_ROW_ESTADOS.BLOQUEADA_PRERREQUISITO;
          tooltip = `Requiere ${asig.prerrequisito?.sigla ?? 'el prerrequisito'} aprobada`;
        } else {
          seleccionable = !readOnly;
          estado = seleccionada
            ? PLANILLA_ROW_ESTADOS.SELECCIONADA
            : PLANILLA_ROW_ESTADOS.NORMAL;
        }
      }

      const esNivelar =
        perfil.tieneHistorialSistema &&
        queLeTocaNumero != null &&
        numero < queLeTocaNumero &&
        !aprobada &&
        estado !== PLANILLA_ROW_ESTADOS.BLOQUEADA_PERIODO &&
        estado !== PLANILLA_ROW_ESTADOS.BLOQUEADA_PRERREQUISITO;
      if (esNivelar) {
        premarcadasNivelar.push({ periodoId, materiaId, sigla: asig?.sigla ?? null });
        if (seleccionada) tag = 'nivelar';
      }
      if (
        !tag &&
        seleccionada &&
        maxSelectedNumero != null &&
        numero < maxSelectedNumero &&
        estado !== PLANILLA_ROW_ESTADOS.FIJA
      ) {
        tag = 'arrastre';
      }

      const marcada =
        seleccionada || estado === PLANILLA_ROW_ESTADOS.FIJA || aprobada;
      if (seleccionada || estado === PLANILLA_ROW_ESTADOS.FIJA) totalSeleccionadas += 1;

      return {
        key: `${periodoId}:${materiaId ?? asig?.asignaturaPlanId}`,
        periodoId,
        materiaId,
        asignaturaPlanId: toNumberOrNull(asig?.asignaturaPlanId),
        sigla: asig?.sigla ?? null,
        nombre: asig?.nombre ?? null,
        horasSemanales: asig?.horasSemanales ?? null,
        prerrequisitoSigla: asig?.prerrequisito?.sigla ?? null,
        notaFinal: asig?.notaFinal ?? null,
        estado,
        seleccionable,
        seleccionada,
        marcada,
        esNivelar,
        tag,
        tooltip,
      };
    });

    const seleccionables = rows.filter((r) => r.seleccionable);
    const seleccionadasCount = seleccionables.filter((r) => r.seleccionada).length;

    return {
      id: periodoId,
      numero,
      nombre: periodo?.nombre ?? `Periodo ${numero}`,
      subtitulo,
      disabled,
      fijo,
      rows,
      seleccionablesCount: seleccionables.length,
      seleccionadasCount,
      todasSeleccionadas: seleccionables.length > 0 && seleccionadasCount === seleccionables.length,
      algunaSeleccionada: seleccionadasCount > 0,
    };
  });

  // Pendientes a nivelar pre-marcadas que el usuario desmarcó (advertencia discreta).
  const desmarcadasNivelar = premarcadasNivelar.filter(({ periodoId, materiaId }) => {
    const set = seleccionPorPeriodo.get(periodoId);
    return materiaId != null && !(set && set.has(materiaId));
  });

  return {
    perfil,
    periodos: periodosModel,
    flags: {
      readOnly,
      multiPeriodo: numerosSeleccionados.length > 1,
      minSelectedNumero,
      maxSelectedNumero,
      queLeTocaNumero,
      saltoMaximoNumero,
      totalSeleccionadas,
      premarcadasNivelar,
      desmarcadasNivelar,
    },
  };
}

/**
 * Selección inicial al cargar el contexto (solo modo crear; en edición siembra
 * editData.materiaIdsByPeriod):
 * - NUEVO: todas las materias del primer periodo (bloque completo).
 * - tieneHistorialSistema: pendientes a nivelar pre-marcadas (§2, sugerencia
 *   «sí o sí en esta gestión»; desmarcarlas no bloquea el submit).
 * - Resto: selección vacía.
 */
export function computeInitialSelection({
  contexto = null,
  tipoAdmision = null,
  esNuevoSistema = null,
  traspasoAnioCursado = null,
} = {}) {
  const model = buildMateriasPlanillaModel({
    contexto,
    seleccion: {},
    tipoAdmision,
    esNuevoSistema,
    traspasoAnioCursado,
  });
  if (!model) return {};

  const seleccion = {};
  if (model.perfil.esNuevoSistema === true && model.perfil.tipoAdmision === 'NUEVO') {
    const primero = model.periodos.find((p) => p.fijo);
    if (primero) {
      const ids = primero.rows
        .filter((r) => r.estado === PLANILLA_ROW_ESTADOS.FIJA && r.materiaId != null)
        .map((r) => r.materiaId);
      if (ids.length) seleccion[primero.id] = ids;
    }
    return seleccion;
  }

  for (const { periodoId, materiaId } of model.flags.premarcadasNivelar) {
    if (materiaId == null) continue;
    if (!seleccion[periodoId]) seleccion[periodoId] = [];
    seleccion[periodoId].push(materiaId);
  }
  return seleccion;
}

/**
 * Poda la selección que dejó de ser válida según las reglas en vivo (materias
 * aprobadas, de periodos deshabilitados o con prerrequisito descubierto).
 * Devuelve la MISMA referencia si no hay cambios; itera hasta estabilizar
 * (quitar una materia puede re-cubrir prerrequisitos de otras).
 */
export function pruneSeleccionInvalida({
  contexto = null,
  seleccion = {},
  tipoAdmision = null,
  esNuevoSistema = null,
  traspasoAnioCursado = null,
} = {}) {
  let actual = seleccion ?? {};
  for (let i = 0; i < 5; i += 1) {
    const model = buildMateriasPlanillaModel({
      contexto,
      seleccion: actual,
      tipoAdmision,
      esNuevoSistema,
      traspasoAnioCursado,
    });
    if (!model) return seleccion;

    const validasPorPeriodo = new Map();
    for (const periodo of model.periodos) {
      const validas = new Set(
        periodo.rows
          .filter((r) => r.materiaId != null && (r.seleccionable || r.estado === PLANILLA_ROW_ESTADOS.FIJA))
          .map((r) => r.materiaId)
      );
      validasPorPeriodo.set(periodo.id, validas);
    }

    let cambio = false;
    const siguiente = {};
    for (const [periodoKey, ids] of Object.entries(actual)) {
      if (!Array.isArray(ids) || ids.length === 0) continue;
      const periodoId = Number(periodoKey);
      const validas = validasPorPeriodo.get(periodoId) ?? new Set();
      const filtradas = ids.map(Number).filter((id) => validas.has(id));
      if (filtradas.length !== ids.length) cambio = true;
      if (filtradas.length > 0) siguiente[periodoKey] = filtradas;
      else if (ids.length > 0) cambio = true;
    }

    if (!cambio) return actual;
    actual = siguiente;
  }
  return actual;
}

/**
 * Resumen de la selección para el paso Paralelo (§4-C2): por periodo con
 * materias marcadas → n.º de materias, horas semanales y tags; más los avisos
 * de nivelación (multi-periodo) y de pendientes a nivelar desmarcadas.
 */
export function buildSeleccionResumen(model) {
  if (!model) return { porPeriodo: [], multiPeriodo: false, desmarcadasNivelar: [] };

  const porPeriodo = model.periodos
    .map((periodo) => {
      const marcadas = periodo.rows.filter(
        (r) => r.seleccionada || r.estado === PLANILLA_ROW_ESTADOS.FIJA
      );
      if (!marcadas.length) return null;
      return {
        periodoId: periodo.id,
        numero: periodo.numero,
        nombre: periodo.nombre,
        totalMaterias: marcadas.length,
        totalHoras: marcadas.reduce((acc, r) => acc + (Number(r.horasSemanales) || 0), 0),
        tieneArrastre: marcadas.some((r) => r.tag === 'arrastre'),
        tieneNivelar: marcadas.some((r) => r.tag === 'nivelar'),
      };
    })
    .filter(Boolean);

  return {
    porPeriodo,
    multiPeriodo: model.flags.multiPeriodo,
    desmarcadasNivelar: model.flags.desmarcadasNivelar,
  };
}
