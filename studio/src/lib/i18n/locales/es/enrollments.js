/** Contexto Matrículas (listado) — textos en español. */
export const enrollments = {
  title: 'Lista de Inscripciones',
  subtitle: '{term} · Administra las matrículas de estudiantes activos del instituto.',
  breadcrumbHome: 'Inicio',
  breadcrumbEnrollment: 'Matrícula',
  breadcrumbList: 'Inscripciones',

  kpi: {
    totalEnrolled: 'Total inscritos',
    returningStudents: 'Estudiantes antiguos',
    newEntries: 'Nuevos ingresos',
    pendingRecords: 'Historiales pendientes',
    ofTotal: '{pct}% del total',
    firstTerm: 'Primer año',
    needReview: 'Requieren revisión',
  },

  chips: {
    all: 'Todas',
  },

  table: {
    student: 'Estudiante',
    program: 'Carrera',
    term: 'Gestión',
    record: 'Historial',
    actions: 'Acciones',
    careerSubtitle: '{semestre}° año · {materias} materias',
  },

  filters: {
    all: 'Todos',
    returning: 'Antiguos',
    news: 'Nuevos',
    historyPlaceholder: 'Historial',
    results: '{count} resultados',
  },

  bulk: {
    selected: '{count} seleccionados',
    notify: 'Notificar',
    export: 'Exportar',
    delete: 'Eliminar',
    more: 'Acciones de selección',
  },

  card: {
    ci: 'CI',
    term: 'Gestión',
    enrolled: 'Inscripción',
    period: 'Periodo',
    semester: 'Año',
    subjects: 'Materias',
    average: 'Promedio',
    progress: 'Progreso académico',
  },

  type: {
    new: 'Nuevo',
    returning: 'Antiguo',
    transfer: 'Traspaso',
    mobility: 'Transitabilidad',
  },

  record: {
    recorded: 'Registrado',
    pending: 'Pendiente',
    notApplicable: 'No aplica',
  },

  history: {
    pendiente: 'Historial pendiente',
    completo: 'Historial completo',
    observado: 'Observado',
    revision: 'En revisión',
    no_aplica: 'Sin historial previo',
    // Segundo dato (contexto por tipo de inscripción) bajo la píldora de estado.
    firstEntry: 'Primer ingreso',
    previousSubjects: '{count} materias previas',
    transferOrigin: 'Traspaso · {carrera} ({anio})',
    mobilityOrigin: 'Transitabilidad · {carrera} ({anio})',
  },

  shift: {
    morning: 'Mañana',
    afternoon: 'Tarde',
    evening: 'Noche',
  },

  actions: {
    newEnrollment: 'Nueva Inscripción',
    export: 'Exportar',
    view: 'Ver detalle',
    edit: 'Editar',
    more: 'Más opciones',
    print: 'Imprimir comprobante',
    email: 'Enviar correo',
    report: 'Generar reporte',
    delete: 'Eliminar',
    exportCareerPlaceholder: 'Carrera para exportar…',
  },

  states: {
    loading: 'Cargando inscripciones…',
    emptyTitle: 'Sin inscripciones',
    emptyHint: 'No hay estudiantes que coincidan con los filtros aplicados.',
    clearFilters: 'Limpiar filtros',
    errorTitle: 'No se pudo cargar la lista',
  },
};

export default enrollments;
