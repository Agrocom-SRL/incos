import { PARALELO_TURNOS } from './paraleloTurnoOptions';

export const createParaleloFormSections = () => ({
  datosParalelo: {
    title: 'Paralelo maestro',
    description:
      'Plantilla reutilizable por carrera, periodo del plan y turno. Se copia a paralelos de gestión en Oferta académica.',
    fields: [
      {
        name: 'periodo_id',
        label: 'Periodo del plan',
        type: 'pillSelect',
        pillVariant: 'paraleloPeriodo',
        required: true,
        span: 12,
        placeholder: 'Seleccione periodo',
        options: 'periodos',
        allowClear: false,
      },
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. PRIMERO-A',
        maxLength: 50,
      },
      {
        name: 'turno',
        label: 'Turno',
        type: 'pillSelect',
        pillVariant: 'paraleloTurno',
        required: true,
        span: 12,
        placeholder: 'Seleccione turno',
        options: PARALELO_TURNOS.map((t) => ({ value: t, label: t })),
        allowClear: false,
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 12,
        placeholder: 'Opcional — visible en el listado bajo el periodo',
        rows: 3,
      },
    ],
  },
});
