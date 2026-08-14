/**
 * step4Paralelo - Paso «Paralelo» del wizard de inscripción.
 *
 * Dos secciones (§4-C2 del plan matricula-wizard-rediseno):
 * - resumen: panel compacto de la selección (InscripcionSeleccionResumen vía
 *   renderSectionContent) — sin el field-Alert histórico.
 * - paralelos: cards de paralelo por periodo (un solo encabezado de sección;
 *   el enricher de paralelos aporta items/loading/onSelect).
 */

export const getStep4Fields = () => {
  return {
    resumen: {
      title: 'Resumen de la selección',
      description:
        'Verifique las materias marcadas por periodo antes de elegir el paralelo.',
      fields: [],
    },
    paralelos: {
      title: 'Paralelos por periodo',
      description:
        'Revise el resumen por periodo y elija un paralelo —turno— para cada uno; cada tarjeta muestra la cantidad de inscritos.',
      fields: [
        {
          name: 'listaParalelos',
          type: 'cards',
          label: '',
          span: 24,
          required: false,
          emptyMessage: 'No hay paralelos en este periodo.',
        },
      ],
    },
  };
};
