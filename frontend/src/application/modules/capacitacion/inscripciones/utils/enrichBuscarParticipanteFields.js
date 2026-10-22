/**
 * Enricher del paso «Participante» de Inscribir participante (CAP): inyecta en
 * los campos declarativos `search` + `list` (config `stepBuscarParticipante`)
 * los datos y callbacks del hook, igual que `studentEnrichers` de Matrícula
 * pero sin contexto global: es una función pura que el organismo del paso
 * llama con las props que ya recibió.
 *
 * Dos fuentes de datos según haya búsqueda activa (`searchAttempted`):
 * - Sin búsqueda → landing con hasta 10 sugeridos sin inscripción vigente.
 * - Con búsqueda (≥2 caracteres) → resultados de `GET /participantes?search=`.
 */

export const CAMPO_BUSCAR_PARTICIPANTE = 'buscarParticipante';
export const CAMPO_RESULTADOS_PARTICIPANTES = 'resultadosParticipantes';

const pluralizar = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

/**
 * La pill «Nuevo» solo aporta en una búsqueda (donde conviven participantes con
 * y sin inscripción vigente); en las sugerencias la cabecera ya lo dice.
 */
const decorarItems = ({ items, mostrandoSugeridos }) =>
  items.map((participante) => ({
    ...participante,
    yaInscrito: participante.cursoActualId != null,
    destacarNuevo: !mostrandoSugeridos && participante.cursoActualId == null,
  }));

const buildHeaderExtra = ({ total, yaInscritos, mostrandoSugeridos }) => {
  if (total === 0) return null;
  if (mostrandoSugeridos) return { count: total, hint: 'Registro más reciente primero' };
  const hint =
    yaInscritos > 0
      ? `${pluralizar(yaInscritos, 'ya inscrito', 'ya inscritos')} en un curso vigente`
      : null;
  return { count: total, hint };
};

/** Estado vacío / error explicado: qué pasó y qué hacer a continuación. */
const buildEmptyState = ({ error, mostrandoSugeridos, searchText, fallbackMessage }) => {
  if (error) {
    return {
      emptyTitle: 'No se pudieron buscar los participantes',
      emptyMessage: error,
      status: 'error',
    };
  }
  if (mostrandoSugeridos) {
    return {
      emptyTitle: 'No hay participantes sin inscripción vigente',
      emptyMessage: 'Busque por CI, nombre o celular para encontrar a cualquier participante.',
      status: 'default',
    };
  }
  return {
    emptyTitle: searchText ? `Sin resultados para «${searchText}»` : 'Sin resultados',
    emptyMessage:
      fallbackMessage ||
      'No se encontraron participantes con esos datos. Use «Crear nuevo participante» para registrarlo.',
    status: 'default',
  };
};

/**
 * @param {Array} fields - campos declarativos del paso (`getStepBuscarParticipanteFields`)
 * @param {Object} ctx
 * @param {boolean} ctx.searchAttempted - hay búsqueda activa (≥2 caracteres)
 * @param {string} ctx.searchText
 * @param {Array} ctx.participantes - resultados de la búsqueda
 * @param {boolean} ctx.loadingBusqueda
 * @param {string|null} ctx.errorBusqueda
 * @param {Array} ctx.sugeridos
 * @param {boolean} ctx.loadingSugeridos
 * @param {Object|null} ctx.participanteSeleccionado
 * @param {Function} ctx.onBuscar - (texto) => void
 * @param {Function} ctx.onSeleccionar - (participante) => void
 * @returns {Array} campos enriquecidos (los desconocidos se devuelven intactos)
 */
export const enrichBuscarParticipanteFields = (fields = [], ctx = {}) => {
  const {
    searchAttempted = false,
    searchText = '',
    participantes = [],
    loadingBusqueda = false,
    errorBusqueda = null,
    sugeridos = [],
    loadingSugeridos = false,
    participanteSeleccionado = null,
    onBuscar,
    onSeleccionar,
  } = ctx;
  const mostrandoSugeridos = !searchAttempted;

  return fields.map((field) => {
    if (field.name === CAMPO_BUSCAR_PARTICIPANTE && field.type === 'search') {
      return { ...field, onSearch: (value) => onBuscar?.(value ?? '') };
    }

    if (field.name === CAMPO_RESULTADOS_PARTICIPANTES && field.type === 'list') {
      const items = decorarItems({
        items: mostrandoSugeridos ? sugeridos : participantes,
        mostrandoSugeridos,
      });
      const total = items.length;
      const yaInscritos = items.filter((p) => p.yaInscrito).length;
      const error = searchAttempted ? errorBusqueda : null;

      return {
        ...field,
        items,
        loading: searchAttempted ? loadingBusqueda : loadingSugeridos,
        loadingText: searchAttempted ? 'Buscando participantes…' : 'Cargando sugerencias…',
        header:
          total > 0
            ? mostrandoSugeridos
              ? 'Participantes sin inscripción vigente'
              : 'Resultados de la búsqueda'
            : null,
        headerExtra: buildHeaderExtra({ total, yaInscritos, mostrandoSugeridos }),
        ...buildEmptyState({
          error,
          mostrandoSugeridos,
          searchText,
          fallbackMessage: field.emptyMessage,
        }),
        onSelect: onSeleccionar ?? null,
        selectedItem: participanteSeleccionado,
      };
    }

    return field;
  });
};
