/**
 * inscribirParticipanteWizardSteps - Configuración del wizard «Inscribir
 * participante» (CAP). Gemelo de `inscripcionNuevaWizardSteps` (Matrícula):
 * encabezados por paso (constantes `STEP_*_HEADER`) y un builder que arma los
 * pasos según el contexto.
 *
 * Pasos (`formTitle` propio y `{title, description}` por sección):
 * 1. Participante      → buscar uno existente o registrar uno nuevo
 * 2. Curso             → tarjetas de cursos
 * 3. Grupo y requisitos → grupo del curso y requisitos ya entregados
 * 4. Pago inicial      → opcional; SOLO si el curso cobra algo en el instituto (`ofrecePago`)
 * 5. Resumen           → (paso 4 si no hay pago) confirma lo elegido y si se registra pago
 *
 * `description` de paso/sección es texto plano (dato): el JSX (botón «Crear
 * nuevo participante») lo inyecta la página como `headerActions`.
 */

import { getStepBuscarParticipanteFields } from './steps/stepBuscarParticipante.jsx';

/** Modos del paso participante (espejo de `MODO_PARTICIPANTE` del hook; sin importarlo para evitar ciclo). */
const MODO_NUEVO = 'nuevo';

const STEP_PARTICIPANTE_HEADER = {
  title: 'Participante',
  formTitle: 'Datos del participante',
  sections: ['participante'],
};

const STEP_CURSO_HEADER = {
  title: 'Curso',
  formTitle: 'Curso de capacitación',
  description:
    'Elija el curso de capacitación al que se inscribe. El cupo es informativo: no bloquea la inscripción.',
  sections: ['curso'],
};

const STEP_GRUPO_HEADER = {
  title: 'Grupo y requisitos',
  formTitle: 'Grupo y requisitos',
  description:
    'Elija el grupo del participante (con sus horarios) y marque los requisitos que ya entrega. Puede inscribirlo con requisitos pendientes: quedará en estado «Pendiente».',
  sections: ['grupo', 'requisitos'],
};

const STEP_PAGO_HEADER = {
  title: 'Pago inicial',
  formTitle: 'Pago inicial',
  description:
    'Opcional. La matrícula se paga en secretaría del instituto y el costo del curso a la entidad certificadora; puede registrar un pago ahora o hacerlo después desde la ficha de la inscripción.',
  sections: ['pago'],
};

const STEP_RESUMEN_HEADER = {
  title: 'Resumen',
  formTitle: 'Resumen de la inscripción',
  description: 'Revise todo lo elegido, incluido el pago, y confirme la inscripción.',
  sections: ['resumen'],
};

/** Descripciones del paso 1 según el modo (existente por búsqueda / nuevo con datos mínimos). */
const PARTICIPANTE_COPY = {
  existente: {
    description:
      'Busque un participante ya registrado por CI, nombre o celular. Si no existe, podrá registrarlo desde aquí.',
    section: {
      title: 'Buscar participante',
      description:
        'Escriba al menos 2 caracteres y seleccione al participante en la lista. Al inicio se muestran los participantes sin inscripción vigente.',
    },
  },
  nuevo: {
    description:
      'Registre los datos mínimos del participante nuevo; se guardará junto con la inscripción.',
    section: {
      title: 'Participante nuevo',
      description: 'Complete la cédula de identidad, los nombres y el celular de contacto.',
    },
  },
};

const SECTIONS_COPY = {
  curso: {
    title: 'Cursos disponibles',
    description: 'Cada tarjeta muestra el costo, el cupo y las fechas del curso.',
  },
  grupo: {
    title: 'Grupo',
    description: 'Con dos o más grupos la elección es obligatoria; un único grupo se preselecciona.',
  },
  requisitos: {
    title: 'Requisitos entregados',
    description: 'Marque los requisitos que el participante entrega hoy.',
  },
  pago: {
    title: 'Pago inicial',
    description: 'Active el interruptor solo si el participante paga al inscribirse.',
  },
  resumen: {
    title: 'Resumen de la inscripción',
    description: 'Revise lo elegido antes de registrar la inscripción.',
  },
};

/**
 * @param {Object} params
 * @param {string} params.modoParticipante - 'existente' | 'nuevo'
 * @param {boolean} params.ofrecePago - el curso elegido cobra algo (existe el paso «Pago inicial»)
 * @returns {Array} pasos para `WizardForm`
 */
export const createInscribirParticipanteWizardSteps = ({ modoParticipante, ofrecePago }) => {
  const copyParticipante =
    modoParticipante === MODO_NUEVO ? PARTICIPANTE_COPY.nuevo : PARTICIPANTE_COPY.existente;

  const pasoParticipante = {
    ...STEP_PARTICIPANTE_HEADER,
    description: copyParticipante.description,
    config: {
      participante: {
        ...copyParticipante.section,
        // Campos declarativos solo en la búsqueda; el formulario nuevo es contenido custom.
        fields: modoParticipante === MODO_NUEVO ? [] : getStepBuscarParticipanteFields(),
      },
    },
  };

  const pasoCurso = { ...STEP_CURSO_HEADER, config: { curso: SECTIONS_COPY.curso } };

  const pasoGrupo = {
    ...STEP_GRUPO_HEADER,
    config: { grupo: SECTIONS_COPY.grupo, requisitos: SECTIONS_COPY.requisitos },
  };

  const pasoPago = { ...STEP_PAGO_HEADER, config: { pago: SECTIONS_COPY.pago } };

  const pasoResumen = { ...STEP_RESUMEN_HEADER, config: { resumen: SECTIONS_COPY.resumen } };

  return ofrecePago
    ? [pasoParticipante, pasoCurso, pasoGrupo, pasoPago, pasoResumen]
    : [pasoParticipante, pasoCurso, pasoGrupo, pasoResumen];
};
