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
  TeamOutlined,
  DollarOutlined,
  BankOutlined,
  BarChartOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';

/** @typedef {{ key:string, labelKey:string, icon?:any, path?:string, children?:NavItem[] }} NavItem */

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
          {
            key: 'enrollments',
            labelKey: 'nav.enrollments',
            icon: UnorderedListOutlined,
            path: '/enrollments',
          },
          {
            key: 'new-enrollment',
            labelKey: 'nav.newEnrollment',
            icon: UserAddOutlined,
            path: '/enrollments/new',
          },
        ],
      },
      {
        key: 'academic',
        labelKey: 'nav.academic',
        icon: ReadOutlined,
        children: [
          { key: 'subjects', labelKey: 'nav.subjects', icon: UnorderedListOutlined, path: '/subjects' },
        ],
      },
      { key: 'teachers', labelKey: 'nav.teachers', icon: TeamOutlined, path: '/teachers' },
      { key: 'finance', labelKey: 'nav.finance', icon: DollarOutlined, path: '/finance' },
      { key: 'institutional', labelKey: 'nav.institutional', icon: BankOutlined, path: '/institutional' },
      { key: 'reports', labelKey: 'nav.reports', icon: BarChartOutlined, path: '/reports' },
      { key: 'security', labelKey: 'nav.security', icon: SafetyOutlined, path: '/security' },
      { key: 'settings', labelKey: 'nav.settings', icon: SettingOutlined, path: '/settings' },
    ],
  },
];

export default navigationModel;
