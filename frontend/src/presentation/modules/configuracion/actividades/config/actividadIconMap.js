/**
 * Mapeo de la columna libre `icono` (kebab-case, estilo Feather/Lucide, sembrada en
 * `17-seed-actividades.sql`) a componentes reales de `@ant-design/icons`. AntD no tiene
 * un set 1:1 con esos nombres, así que cada entrada usa el ícono semánticamente más
 * cercano disponible; ver comentarios inline en los casos no obvios.
 *
 * Fallback: cualquier valor no mapeado (actividad nueva con otro string) cae en
 * `TagOutlined`, para no dejar el dot vacío en `ActividadDescripcionCell`.
 */
import {
  AimOutlined,
  BellOutlined,
  BookOutlined,
  BulbOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  CoffeeOutlined,
  CompassOutlined,
  ContainerOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FireOutlined,
  FlagOutlined,
  GiftOutlined,
  GlobalOutlined,
  HeartOutlined,
  HistoryOutlined,
  HomeOutlined,
  IdcardOutlined,
  LikeOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  NotificationOutlined,
  PhoneOutlined,
  PictureOutlined,
  ProfileOutlined,
  PushpinOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  ShopOutlined,
  ShoppingOutlined,
  SmileOutlined,
  SolutionOutlined,
  SoundOutlined,
  StarOutlined,
  SunOutlined,
  TagOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TrophyOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserAddOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

export const ACTIVIDAD_ICON_FALLBACK = TagOutlined;

export const ACTIVIDAD_ICON_MAP = {
  activity: ThunderboltOutlined,
  award: TrophyOutlined,
  bell: BellOutlined,
  book: BookOutlined,
  'book-open': ReadOutlined,
  // Sin BriefcaseOutlined en AntD: ícono de maletín/caja más cercano.
  briefcase: ContainerOutlined,
  // Sin CakeOutlined en AntD: regalo como sustituto de celebración.
  cake: GiftOutlined,
  calculator: CalculatorOutlined,
  calendar: CalendarOutlined,
  'calendar-check': ScheduleOutlined,
  'check-circle': CheckCircleOutlined,
  'check-square': CheckSquareOutlined,
  // Sin ClipboardOutlined en AntD: Profile (hoja con líneas) es el más cercano.
  clipboard: ProfileOutlined,
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
  megaphone: SoundOutlined,
  'shopping-bag': ShoppingOutlined,
  smile: SmileOutlined,
  sun: SunOutlined,
  upload: UploadOutlined,
  'upload-cloud': CloudUploadOutlined,
  // Sin UserCheckOutlined en AntD: Solution (persona + validación) es el más cercano.
  'user-check': SolutionOutlined,
  'user-plus': UserAddOutlined,
  users: TeamOutlined,
  // Sin VoteOutlined en AntD: Like (aprobación) es el sustituto más cercano.
  vote: LikeOutlined,
  // Ampliación: más opciones temáticas de actividades/calendario/comunicación.
  camera: CameraOutlined,
  certificate: SafetyCertificateOutlined,
  clock: ClockCircleOutlined,
  compass: CompassOutlined,
  experiment: ExperimentOutlined,
  'field-time': FieldTimeOutlined,
  fire: FireOutlined,
  globe: GlobalOutlined,
  heart: HeartOutlined,
  history: HistoryOutlined,
  home: HomeOutlined,
  'id-card': IdcardOutlined,
  mail: MailOutlined,
  medicine: MedicineBoxOutlined,
  message: MessageOutlined,
  notification: NotificationOutlined,
  phone: PhoneOutlined,
  picture: PictureOutlined,
  pin: PushpinOutlined,
  rocket: RocketOutlined,
  shop: ShopOutlined,
  star: StarOutlined,
  target: AimOutlined,
  tool: ToolOutlined,
  video: VideoCameraOutlined,
};

/**
 * @param {string} [icono] - Valor kebab-case sembrado en el campo `icono` de la actividad.
 * @returns {React.ComponentType} Componente de ícono AntD (nunca `undefined`).
 */
export const getActividadIconComponent = (icono) =>
  ACTIVIDAD_ICON_MAP[icono] || ACTIVIDAD_ICON_FALLBACK;
