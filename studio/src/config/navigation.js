/**
 * Modelo de navegación del sidebar (datos, no UI).
 *
 * Responsabilidad ÚNICA: declarar QUÉ ítems existen, su icono, ruta y jerarquía.
 * Usa `labelKey` (clave i18n), no texto traducido — el Sidebar traduce al render.
 * Cuando se integre el backend, este modelo se filtrará por RBAC sin tocar la UI.
 */
import {
  DashboardOutlined,
  IdcardOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
  ReadOutlined,
  BookOutlined,
  CheckSquareOutlined,
  SolutionOutlined,
  HistoryOutlined,
  TeamOutlined,
  DollarOutlined,
  CreditCardOutlined,
  GiftOutlined,
  BarChartOutlined,
  BankOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  SafetyOutlined,
  UserSwitchOutlined,
  SettingOutlined,
} from '@ant-design/icons';

/** @typedef {{ key:string, labelKey:string, icon?:any, path?:string, defaultOpen?:boolean, children?:NavItem[] }} NavItem */

/** @type {{ sectionKey: string, items: NavItem[] }[]} */
export const navigationModel = [
  {
    sectionKey: 'nav.main',
    items: [
      { key: 'dashboard', labelKey: 'nav.dashboard', icon: DashboardOutlined, path: '/dashboard' },
      {
        key: 'enrollment',
        labelKey: 'nav.enrollment',
        icon: IdcardOutlined,
        defaultOpen: true,
        children: [
          { key: 'registrations', labelKey: 'nav.registrations', icon: UnorderedListOutlined, path: '/enrollments' },
          { key: 'new-registration', labelKey: 'nav.newRegistration', icon: UserAddOutlined, path: '/enrollments/new' },
        ],
      },
      {
        key: 'academic',
        labelKey: 'nav.academic',
        icon: ReadOutlined,
        children: [
          { key: 'subjects', labelKey: 'nav.subjects', icon: BookOutlined, path: '/academic/subjects' },
          { key: 'grades', labelKey: 'nav.grades', icon: SolutionOutlined, path: '/academic/grades' },
          { key: 'attendance', labelKey: 'nav.attendance', icon: CheckSquareOutlined, path: '/academic/attendance' },
          { key: 'academic-history', labelKey: 'nav.academicHistory', icon: HistoryOutlined, path: '/academic/history' },
        ],
      },
      {
        key: 'teachers',
        labelKey: 'nav.teachers',
        icon: TeamOutlined,
        children: [
          { key: 'teachers-list', labelKey: 'nav.teachersList', icon: UnorderedListOutlined, path: '/teachers' },
          { key: 'teachers-coordination', labelKey: 'nav.teachersCoordination', icon: ApartmentOutlined, path: '/teachers/coordination' },
        ],
      },
      {
        key: 'finance',
        labelKey: 'nav.finance',
        icon: DollarOutlined,
        children: [
          { key: 'payments', labelKey: 'nav.payments', icon: CreditCardOutlined, path: '/finance/payments' },
          { key: 'scholarships', labelKey: 'nav.scholarships', icon: GiftOutlined, path: '/finance/scholarships' },
          { key: 'finance-reports', labelKey: 'nav.financeReports', icon: BarChartOutlined, path: '/finance/reports' },
          { key: 'finance-settings', labelKey: 'nav.financeSettings', icon: SettingOutlined, path: '/finance/settings' },
        ],
      },
      {
        key: 'institutional',
        labelKey: 'nav.institutional',
        icon: BankOutlined,
        children: [
          { key: 'current-term', labelKey: 'nav.currentTerm', icon: CalendarOutlined, path: '/institutional/current-term' },
          { key: 'academic-offer', labelKey: 'nav.academicOffer', icon: ApartmentOutlined, path: '/institutional/offer' },
          { key: 'teacher-assignment', labelKey: 'nav.teacherAssignment', icon: UserSwitchOutlined, path: '/institutional/assignment' },
          { key: 'schedules', labelKey: 'nav.schedules', icon: ScheduleOutlined, path: '/institutional/schedules' },
        ],
      },
      { key: 'reports', labelKey: 'nav.reports', icon: BarChartOutlined, path: '/reports' },
      {
        key: 'security',
        labelKey: 'nav.security',
        icon: SafetyOutlined,
        children: [
          { key: 'users', labelKey: 'nav.users', icon: TeamOutlined, path: '/security/users' },
          { key: 'roles-permissions', labelKey: 'nav.rolesPermissions', icon: SafetyOutlined, path: '/security/roles' },
        ],
      },
      {
        key: 'settings',
        labelKey: 'nav.settings',
        icon: SettingOutlined,
        children: [
          { key: 'academic-config', labelKey: 'nav.academicConfig', icon: ReadOutlined, path: '/settings/academic' },
          { key: 'general-config', labelKey: 'nav.generalConfig', icon: SettingOutlined, path: '/settings/general' },
        ],
      },
    ],
  },
];

export default navigationModel;
