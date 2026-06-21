/** Enrollments context (list) — English strings. */
export const enrollments = {
  title: 'Enrollment List',
  subtitle: '{term} · Manage active student enrollments.',
  breadcrumbHome: 'Home',
  breadcrumbEnrollment: 'Enrollment',
  breadcrumbList: 'Enrollments',

  kpi: {
    totalEnrolled: 'Total enrolled',
    returningStudents: 'Returning students',
    newEntries: 'New entries',
    pendingRecords: 'Pending records',
    ofTotal: '{pct}% of total',
    firstTerm: 'First year',
    needReview: 'Need review',
  },

  chips: {
    all: 'All',
  },

  type: {
    new: 'New',
    returning: 'Returning',
    transfer: 'Transfer',
    mobility: 'Mobility',
  },

  record: {
    recorded: 'Recorded',
    pending: 'Pending',
    notApplicable: 'N/A',
  },

  history: {
    pendiente: 'Pending record',
    completo: 'Complete record',
    observado: 'Flagged',
    revision: 'Under review',
    no_aplica: 'No prior record',
    // Secondary datum (context by enrollment type) below the status pill.
    firstEntry: 'First entry',
    previousSubjects: '{count} prior subjects',
    transferOrigin: 'Transfer · {carrera} ({anio})',
    mobilityOrigin: 'Mobility · {carrera} ({anio})',
  },

  shift: {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
  },

  payment: {
    upToDate: 'Up to date',
    pending: 'Pending',
  },

  actions: {
    newEnrollment: 'New Enrollment',
    export: 'Export',
    view: 'View detail',
    edit: 'Edit',
    more: 'More options',
    print: 'Print receipt',
    email: 'Send email',
    report: 'Generate report',
    delete: 'Delete',
    exportCareerPlaceholder: 'Career to export…',
  },

  table: {
    student: 'Student',
    program: 'Program',
    term: 'Term',
    record: 'Record',
    actions: 'Actions',
    careerSubtitle: 'Year {semestre} · {materias} subjects',
  },

  filters: {
    all: 'All',
    returning: 'Returning',
    news: 'New',
    historyPlaceholder: 'Record',
    results: '{count} results',
  },

  bulk: {
    selected: '{count} selected',
    notify: 'Notify',
    export: 'Export',
    delete: 'Delete',
    more: 'Selection actions',
  },

  card: {
    ci: 'ID',
    term: 'Term',
    enrolled: 'Enrolled',
    period: 'Period',
    payment: 'Payment',
    semester: 'Year',
    subjects: 'Subjects',
    average: 'Average',
    progress: 'Academic progress',
  },

  states: {
    loading: 'Loading enrollments…',
    emptyTitle: 'No enrollments',
    emptyHint: 'No students match the applied filters.',
    clearFilters: 'Clear filters',
    errorTitle: 'Could not load the list',
  },
};

export default enrollments;
