/**
 * Mapea el nombre de icono del catálogo `actividades` (columna `icono`, estilo
 * lucide: 'user-plus', 'calendar-check', …) al componente de @ant-design/icons
 * más cercano. Devuelve referencias de componente (como menuIcons), no JSX.
 */

import {
  ThunderboltOutlined,
  TrophyOutlined,
  BellOutlined,
  BookOutlined,
  ReadOutlined,
  SolutionOutlined,
  GiftOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  SnippetsOutlined,
  CodeOutlined,
  CoffeeOutlined,
  DollarOutlined,
  EditOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FlagOutlined,
  BulbOutlined,
  UnorderedListOutlined,
  EnvironmentOutlined,
  NotificationOutlined,
  ShoppingOutlined,
  SmileOutlined,
  FireOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  UserSwitchOutlined,
  UserAddOutlined,
  TeamOutlined,
  AuditOutlined,
} from '@ant-design/icons';

export const activityIconMap = {
  activity: ThunderboltOutlined,
  award: TrophyOutlined,
  bell: BellOutlined,
  book: BookOutlined,
  'book-open': ReadOutlined,
  briefcase: SolutionOutlined,
  cake: GiftOutlined,
  calculator: CalculatorOutlined,
  calendar: CalendarOutlined,
  'calendar-check': CarryOutOutlined,
  'check-circle': CheckCircleOutlined,
  'check-square': CheckSquareOutlined,
  clipboard: SnippetsOutlined,
  code: CodeOutlined,
  coffee: CoffeeOutlined,
  'dollar-sign': DollarOutlined,
  edit: EditOutlined,
  'file-check': FileDoneOutlined,
  'file-text': FileTextOutlined,
  flag: FlagOutlined,
  lightbulb: BulbOutlined,
  list: UnorderedListOutlined,
  'map-pin': EnvironmentOutlined,
  megaphone: NotificationOutlined,
  'shopping-bag': ShoppingOutlined,
  smile: SmileOutlined,
  sun: FireOutlined,
  upload: UploadOutlined,
  'upload-cloud': CloudUploadOutlined,
  'user-check': UserSwitchOutlined,
  'user-plus': UserAddOutlined,
  users: TeamOutlined,
  vote: AuditOutlined,
};

/** Componente de icono para un nombre del catálogo (fallback: CalendarOutlined). */
export const getActivityIconComponent = (name) => activityIconMap[name] ?? CalendarOutlined;

/** Lista de iconos disponibles (para el Select del formulario de actividad maestra). */
export const ACTIVITY_ICON_OPTIONS = Object.keys(activityIconMap);
