/**
 * Modelo de navegación del sidebar (datos, no UI).
 *
 * Responsabilidad ÚNICA: declarar QUÉ ítems existen, su icono, ruta y jerarquía,
 * agrupados por dominio en secciones. Usa `labelKey` (clave i18n), no texto
 * traducido — el Sidebar traduce al render. Cuando se integre el backend, este
 * modelo se filtrará por RBAC sin tocar la UI.
 */
import {
  DashboardOutlined,
  IdcardOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
  ReadOutlined,
  CheckSquareOutlined,
  SolutionOutlined,
  HistoryOutlined,
  RiseOutlined,
  SwapOutlined,
  NodeIndexOutlined,
  ExperimentOutlined,
  TeamOutlined,
  AuditOutlined,
  FileProtectOutlined,
  DollarOutlined,
  CreditCardOutlined,
  PlusCircleOutlined,
  GiftOutlined,
  BarChartOutlined,
  FallOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  BankOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  SettingOutlined,
  DatabaseOutlined,
  ShopOutlined,
  ProfileOutlined,
  UserOutlined,
} from '@ant-design/icons';

/** @typedef {{ key:string, labelKey:string, icon?:any, path?:string, defaultOpen?:boolean, children?:NavItem[] }} NavItem */

/** @type {{ sectionKey: string, items: NavItem[] }[]} */
export const navigationModel = [
  {
    sectionKey: 'nav.main',
    items: [
      { key: 'dashboard', labelKey: 'nav.dashboard', icon: DashboardOutlined, path: '/dashboard' },
    ],
  },
  {
    sectionKey: 'nav.academicMgmt',
    items: [
      {
        key: 'enrollment',
        labelKey: 'nav.enrollment',
        icon: IdcardOutlined,
        defaultOpen: true,
        children: [
          { key: 'new-student', labelKey: 'nav.newStudent', icon: UserAddOutlined, path: '/enrollments/new-student' },
          { key: 'admission', labelKey: 'nav.admission', icon: UserSwitchOutlined, path: '/enrollments/admission' },
          { key: 'registrations', labelKey: 'nav.registrations', icon: UnorderedListOutlined, path: '/enrollments' },
          { key: 'contributions', labelKey: 'nav.contributions', icon: DollarOutlined, path: '/enrollments/contributions' },
          { key: 'scholarships', labelKey: 'nav.scholarships', icon: GiftOutlined, path: '/enrollments/scholarships' },
          { key: 'internships', labelKey: 'nav.internships', icon: ExperimentOutlined, path: '/enrollments/internships' },
        ],
      },
      {
        key: 'academic',
        labelKey: 'nav.academic',
        icon: ReadOutlined,
        children: [
          { key: 'attendance', labelKey: 'nav.attendance', icon: CheckSquareOutlined, path: '/academic/attendance' },
          { key: 'grades', labelKey: 'nav.grades', icon: SolutionOutlined, path: '/academic/grades' },
          { key: 'leveling', labelKey: 'nav.leveling', icon: RiseOutlined, path: '/academic/leveling' },
          { key: 'transfers', labelKey: 'nav.transfers', icon: SwapOutlined, path: '/academic/transfers' },
          { key: 'transitability', labelKey: 'nav.transitability', icon: NodeIndexOutlined, path: '/academic/transitability' },
          { key: 'academic-history', labelKey: 'nav.academicHistory', icon: HistoryOutlined, path: '/academic/history' },
          { key: 'academic-progress', labelKey: 'nav.academicProgress', icon: BarChartOutlined, path: '/academic/progress' },
        ],
      },
      {
        key: 'teachers',
        labelKey: 'nav.teachers',
        icon: TeamOutlined,
        children: [
          { key: 'teachers-list', labelKey: 'nav.teachersList', icon: UnorderedListOutlined, path: '/teachers' },
          { key: 'teacher-leaves', labelKey: 'nav.teacherLeaves', icon: FileProtectOutlined, path: '/teachers/leaves' },
          { key: 'supervision', labelKey: 'nav.supervision', icon: AuditOutlined, path: '/teachers/supervision' },
          { key: 'teacher-internships', labelKey: 'nav.teacherInternships', icon: ExperimentOutlined, path: '/teachers/internships' },
        ],
      },
      {
        key: 'institutional',
        labelKey: 'nav.institutional',
        icon: BankOutlined,
        children: [
          { key: 'current-term', labelKey: 'nav.currentTerm', icon: CalendarOutlined, path: '/institutional/current-term' },
          { key: 'academic-offer', labelKey: 'nav.academicOffer', icon: ApartmentOutlined, path: '/institutional/offer' },
          { key: 'schedules', labelKey: 'nav.schedules', icon: ScheduleOutlined, path: '/institutional/schedules' },
          { key: 'past-terms', labelKey: 'nav.pastTerms', icon: ClockCircleOutlined, path: '/institutional/past-terms' },
        ],
      },
    ],
  },
  {
    sectionKey: 'nav.financeReports',
    items: [
      {
        key: 'finance',
        labelKey: 'nav.finance',
        icon: DollarOutlined,
        children: [
          { key: 'payments', labelKey: 'nav.payments', icon: CreditCardOutlined, path: '/finance/payments' },
          { key: 'additional-payments', labelKey: 'nav.additionalPayments', icon: PlusCircleOutlined, path: '/finance/additional' },
          { key: 'payment-reports', labelKey: 'nav.paymentReports', icon: BarChartOutlined, path: '/finance/reports' },
          { key: 'payment-settings', labelKey: 'nav.paymentSettings', icon: SettingOutlined, path: '/finance/settings' },
        ],
      },
      {
        key: 'reports',
        labelKey: 'nav.reports',
        icon: BarChartOutlined,
        children: [
          { key: 'report-progress', labelKey: 'nav.reportProgress', icon: RiseOutlined, path: '/reports/progress' },
          { key: 'report-attendance', labelKey: 'nav.reportAttendance', icon: CheckSquareOutlined, path: '/reports/attendance' },
          { key: 'report-dropout', labelKey: 'nav.reportDropout', icon: FallOutlined, path: '/reports/dropout' },
          { key: 'report-requests', labelKey: 'nav.reportRequests', icon: FileSearchOutlined, path: '/reports/requests' },
        ],
      },
    ],
  },
  {
    sectionKey: 'nav.system',
    items: [
      {
        key: 'settings',
        labelKey: 'nav.settings',
        icon: SettingOutlined,
        children: [
          { key: 'academic-config', labelKey: 'nav.academicConfig', icon: ReadOutlined, path: '/settings/academic' },
          { key: 'documentation', labelKey: 'nav.documentation', icon: FileTextOutlined, path: '/settings/documentation' },
          { key: 'complementary-data', labelKey: 'nav.complementaryData', icon: DatabaseOutlined, path: '/settings/complementary' },
          { key: 'companies-agreements', labelKey: 'nav.companiesAgreements', icon: ShopOutlined, path: '/settings/companies' },
          { key: 'activity-history', labelKey: 'nav.activityHistory', icon: ProfileOutlined, path: '/settings/activity-history' },
        ],
      },
      {
        key: 'security',
        labelKey: 'nav.security',
        icon: SafetyOutlined,
        children: [
          { key: 'users', labelKey: 'nav.users', icon: TeamOutlined, path: '/security/users' },
          { key: 'roles-permissions', labelKey: 'nav.rolesPermissions', icon: SafetyOutlined, path: '/security/roles' },
        ],
      },
      { key: 'my-profile', labelKey: 'nav.myProfile', icon: UserOutlined, path: '/profile' },
    ],
  },
];

export default navigationModel;
