/**
 * Step 0 (Buscar estudiante) con estudiante PRE-SELECCIONADO desde el connector
 * (entrada por detalle del estudiante o modo edición): el buscador no aplica y
 * el paso muestra únicamente al estudiante como fila ya seleccionada (misma
 * fila y estilos del paso Buscar: avatar, metadatos y check de selección),
 * sin campo de búsqueda ni sugerencias. Mientras el estudiante carga por ID se
 * muestra el skeleton de la lista; la fila no es clickeable (onSelect null).
 */
export const step0EnrichmentStrategy = (step, stepIndex, _enrichers, context) => {
  if (stepIndex !== 0 || !context?.hasPreselectedStudent) return null;

  const selectedStudent = context?.studentSearch?.selectedStudent ?? null;
  const isEditMode = context?.isEditMode === true;

  const title = isEditMode ? 'Estudiante de la inscripción' : 'Estudiante a inscribir';
  const description = isEditMode
    ? 'La inscripción pertenece a este estudiante y no puede transferirse a otro. Verifique sus datos y continúe con los pasos siguientes para ajustar la matrícula.'
    : 'El estudiante ya está seleccionado; verifique sus datos y continúe con la inscripción.';

  // Reutiliza el campo `list` del paso Buscar (renderItem, clases y estados de
  // step1BuscarEstudiante) con una única fila: el estudiante ya seleccionado.
  const listField = (step?.config?.buscarEstudiante?.fields ?? []).find(
    (field) => field.type === 'list',
  );
  const fields = listField
    ? [
        {
          ...listField,
          items: selectedStudent?.id ? [selectedStudent] : [],
          // Sin estudiante todavía: skeleton mientras la carga por ID no falle
          // (al montar, el efecto que dispara getStudentById aún no corrió y
          // `loading` sigue en false — sin esta condición el vacío parpadea).
          loading: !selectedStudent?.id && !context?.studentSearch?.error,
          loadingText: 'Cargando datos del estudiante…',
          selectedItem: selectedStudent,
          onSelect: null,
          header: null,
          headerExtra: null,
          emptyTitle: 'No se pudieron cargar los datos del estudiante',
          emptyMessage: 'Vuelva a la lista de inscripciones e intente nuevamente.',
        },
      ]
    : [];

  return {
    ...step,
    title,
    formTitle: title,
    description,
    config: {
      buscarEstudiante: {
        title,
        description,
        fields,
      },
    },
  };
};
