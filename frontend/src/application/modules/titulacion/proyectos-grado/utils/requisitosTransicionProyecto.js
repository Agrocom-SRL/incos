/**
 * Requisitos de negocio por transición del proyecto de grado (T11, consumido
 * por `AprobarEtapaModal`). El backend (`AprobarEtapaProyectoUseCase`) solo
 * valida la máquina de estados (TRANSICIONES_PROYECTO_GRADO); esta capa es
 * una guía en frontend para evitar transiciones "a ciegas" — pedido explícito
 * del usuario: "no solo presionar y cambiar el estado".
 *
 * Dos tipos de requisito por estado destino:
 *   - `automaticos`: verificables con datos ya cargados en la ficha (tutor,
 *     % de avance, entradas de bitácora). Si alguno no se cumple, el modal
 *     bloquea el botón "Registrar transición".
 *   - `manuales`: pasos que el sistema NO puede verificar (p. ej. una firma
 *     física del postulante). Se muestran como checklist informativo y el
 *     modal exige una confirmación explícita del usuario antes de continuar.
 */

const REQUISITOS_TRANSICION = {
  APROBADO_PERFIL: {
    manuales: [
      'Descargue el formulario de modalidad de graduación (FMDG-1) y verifique que esté firmado por el postulante.',
    ],
  },
  DESARROLLO: {
    automaticos: [
      {
        descripcion: 'Asignar al menos un tutor al proyecto',
        cumplido: (ctx) => ctx.proyecto?.tutorId != null,
      },
    ],
  },
  PREDEFENSA: {
    automaticos: [
      {
        descripcion: 'Registrar al menos una entrada del cronograma de progreso',
        cumplido: (ctx) => (ctx.bitacoraCount ?? 0) > 0,
      },
    ],
  },
  APROBADO_PREDEFENSA: {
    manuales: ['Verifique que el tribunal haya evaluado la predefensa conforme al reglamento.'],
  },
  DEFENSA: {
    automaticos: [
      {
        descripcion: 'Registrar el avance del proyecto al 100%',
        cumplido: (ctx) => Number(ctx.proyecto?.porcentajeAvance ?? 0) >= 100,
      },
    ],
  },
};

/**
 * @param {string} destino - Estado destino de la transición.
 * @param {{proyecto: Object, bitacoraCount: number}} ctx
 * @returns {{automaticos: Array<{descripcion, cumplido: boolean}>, manuales: string[]}}
 */
export const getRequisitosTransicion = (destino, ctx) => {
  const config = REQUISITOS_TRANSICION[destino];
  if (!config) return { automaticos: [], manuales: [] };
  const automaticos = (config.automaticos ?? []).map((r) => ({
    descripcion: r.descripcion,
    cumplido: r.cumplido(ctx),
  }));
  return { automaticos, manuales: config.manuales ?? [] };
};

export default getRequisitosTransicion;
