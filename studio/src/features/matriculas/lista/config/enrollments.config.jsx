/**
 * enrollments.config — configuración declarativa del listado de inscripciones.
 *
 * Es el ÚNICO archivo de "datos de pantalla" que consume el molde ListPage para
 * Matrículas: fetch+adapt, KPIs (selectores), faceta de carrera, search, filtros
 * (tipo + historial) y columnas. La parte específica de presentación (tarjeta,
 * acciones de fila, acciones de cabecera, barra masiva) entra por SLOTS en la page.
 *
 * Un segundo listado se crearía solo añadiendo otro *.config.js como este.
 */
import {
  TeamOutlined,
  RiseOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { fetchEnrollments } from '../data/enrollments.api';
import { adaptEnrollments } from '../model/adaptEnrollment';
import { buildColumns } from '../model/buildColumns';
import { HISTORY_FILTER_OPTIONS } from '../model/historyStates';

const ENROLLMENT_YEAR = 2026;

export const enrollmentsConfig = {
  // --- Cabecera ---
  breadcrumbs: (t) => [
    { title: <span><HomeOutlined /> {t('enrollments.breadcrumbHome')}</span> },
    { title: t('enrollments.breadcrumbEnrollment') },
    { title: t('enrollments.breadcrumbList') },
  ],
  titleKey: 'enrollments.title',
  subtitleKey: 'enrollments.subtitle',
  headerI18nParams: (t) => ({ term: t('topbar.term', { year: ENROLLMENT_YEAR }) }),

  // --- Datos ---
  fetch: fetchEnrollments,
  adapt: adaptEnrollments,
  getRowKey: (r) => r.id,

  // --- KPIs (selectores puros) ---
  kpis: [
    {
      key: 'total',
      labelKey: 'enrollments.kpi.totalEnrolled',
      icon: <TeamOutlined />,
      accent: 'var(--brand-600)',
      select: (rows) => rows.length,
      subKey: 'topbar.term',
      subParams: () => ({ year: ENROLLMENT_YEAR }),
    },
    {
      key: 'returning',
      labelKey: 'enrollments.kpi.returningStudents',
      icon: <RiseOutlined />,
      accent: 'var(--accent-gold)',
      select: (rows) => rows.filter((r) => r.isReturning).length,
      subKey: 'enrollments.kpi.ofTotal',
      subParams: (rows, value) => ({ pct: rows.length ? Math.round((value / rows.length) * 100) : 0 }),
    },
    {
      key: 'news',
      labelKey: 'enrollments.kpi.newEntries',
      icon: <UserAddOutlined />,
      accent: 'var(--accent-sky)',
      select: (rows) => rows.length - rows.filter((r) => r.isReturning).length,
      subKey: 'enrollments.kpi.firstTerm',
    },
    {
      key: 'pending',
      labelKey: 'enrollments.kpi.pendingRecords',
      icon: <ClockCircleOutlined />,
      accent: 'var(--accent-red)',
      select: (rows) => rows.filter((r) => r.record.tone === 'warn').length,
      subKey: 'enrollments.kpi.needReview',
    },
  ],

  // --- Faceta (chips de carrera) ---
  facets: {
    accessor: (r) => r.career,
    allLabelKey: 'enrollments.chips.all',
  },

  // --- Búsqueda (campos sobre los que filtra) ---
  search: {
    fields: [(r) => r.fullName, (r) => r.codigo, (r) => r.career.name],
    placeholderKey: 'topbar.searchPlaceholder',
  },

  // --- Filtros declarativos ---
  filters: [
    {
      key: 'tipo',
      type: 'segmented',
      defaultValue: 'todos',
      options: [
        { value: 'todos', labelKey: 'enrollments.filters.all' },
        { value: 'antiguos', labelKey: 'enrollments.filters.returning' },
        { value: 'nuevos', labelKey: 'enrollments.filters.news' },
      ],
      predicate: (r, v) => v === 'todos' || (v === 'antiguos' ? r.isAntiguo : !r.isAntiguo),
    },
    {
      key: 'history',
      type: 'select',
      defaultValue: null,
      placeholderKey: 'enrollments.filters.historyPlaceholder',
      allowClear: true,
      options: HISTORY_FILTER_OPTIONS.map((o) => ({ value: o.value, labelKey: o.labelKey })),
      predicate: (r, v) => !v || r.historialKey === v,
    },
  ],

  // --- Vistas + columnas ---
  views: ['table', 'card'],
  columns: buildColumns,

  // --- Etiquetas de estado / resultados ---
  resultsLabelKey: 'enrollments.filters.results',
  errorTitleKey: 'enrollments.states.errorTitle',
  emptyTitleKey: 'enrollments.states.emptyTitle',
  emptyHintKey: 'enrollments.states.emptyHint',
  clearFiltersLabelKey: 'enrollments.states.clearFilters',
  newLabelKey: 'enrollments.actions.newEnrollment',
};

export default enrollmentsConfig;
