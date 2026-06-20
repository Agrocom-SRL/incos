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
    firstTerm: 'Primer semestre',
    needReview: 'Requieren revisión',
  },

  chips: {
    all: 'Todas',
  },

  table: {
    student: 'Estudiante',
    program: 'Carrera',
    term: 'Gestión',
    type: 'Tipo',
    record: 'Historial',
    subjects: 'Materias',
    actions: 'Acciones',
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

  actions: {
    newEnrollment: 'Nueva Inscripción',
    export: 'Exportar',
    view: 'Ver detalle',
    edit: 'Editar',
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
