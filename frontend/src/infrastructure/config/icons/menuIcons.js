// src/presentation/config/icons/menuIcons.js
/**
 * Configuración de iconos del menú de navegación (sidebar).
 *
 * Single Responsibility: Solo mapea keys del menú a componentes de iconos.
 *
 * Clean Architecture:
 * - Infrastructure Layer: Configuración de iconos.
 * - Depende de: @ant-design/icons (librería externa).
 *
 * REGLA: el mapa contiene ÚNICAMENTE los keys que son ítem de menú visible en
 * el sidebar — los 10 dominios (módulos) y sus submenús. Las subpáginas
 * (`menu: null`: detalles, wizards, breadcrumbs) NO llevan icono aquí porque
 * nunca se renderizan en el sidebar (único consumidor: components/atoms/MenuItem
 * vía application/navigation/hooks/useNavigationMenu). Mantener esta lista
 * alineada con los `routes.jsx` de cada módulo.
 */

import {
    DashboardOutlined,
    // Dominios (módulos)
    IdcardOutlined,
    ReadOutlined,
    UsergroupAddOutlined,
    DollarOutlined,
    HomeOutlined,
    BarChartOutlined,
    SettingOutlined,
    SafetyOutlined,
    UserOutlined,
    // Submenús
    TeamOutlined,
    UnorderedListOutlined,
    UserAddOutlined,
    SolutionOutlined,
    CheckCircleOutlined,
    GiftOutlined,
    SyncOutlined,
    TransactionOutlined,
    ReloadOutlined,
    HistoryOutlined,
    LineChartOutlined,
    FileTextOutlined,
    BankOutlined,
    CreditCardOutlined,
    FileAddOutlined,
    CalendarOutlined,
    BookOutlined,
    FallOutlined,
    FileDoneOutlined,
    FolderOpenOutlined,
    InfoCircleOutlined,
    UserSwitchOutlined,
    TableOutlined,
    AppstoreOutlined,
    ScheduleOutlined,
    BulbOutlined,
    AlertOutlined,
    FundOutlined,
} from '@ant-design/icons';

/**
 * Mapeo de iconos por key de ruta. Solo ítems de menú del sidebar.
 */
export const menuIconMap = {
    // Dashboard
    'DASH': DashboardOutlined,

    // Dominios de negocio (raíces de sidebar)
    'MAT': IdcardOutlined,
    'ACA': ReadOutlined,
    'DOC': UsergroupAddOutlined,
    'FIN': DollarOutlined,
    'INST': HomeOutlined,
    'REP': BarChartOutlined,
    'CFG': SettingOutlined,
    'SEG': SafetyOutlined,
    'CAP': ScheduleOutlined,
    'TUT': BulbOutlined,
    'PERFIL': UserOutlined,

    // Matrícula (MAT)
    'MAT-ADM-NUEVA': UserAddOutlined,
    'MAT-ADMISION': TeamOutlined,
    'MAT-LISTA': UnorderedListOutlined,
    'MAT-APO-LISTA': DollarOutlined,
    'MAT-BEC-LISTAR': GiftOutlined,
    'MAT-PAS-LISTA': SolutionOutlined,

    // Académico (ACA)
    'ACA-ASI': SolutionOutlined,
    'ACA-CAL': CheckCircleOutlined,
    'ACA-CENTRALIZADOR': TableOutlined,
    'ACA-NIV': SyncOutlined,
    'ACA-TRASPASOS': TransactionOutlined,
    'ACA-TRANSIT': ReloadOutlined,
    'ACA-HIS': HistoryOutlined,
    'ACA-AVANCE': LineChartOutlined,

    // Docentes (DOC)
    'DOC-LIST': UnorderedListOutlined,
    'DOC-LIC': FileTextOutlined,

    // Finanzas (FIN)
    'FIN-PAG': CreditCardOutlined,
    'FIN-ADI': FileAddOutlined,
    'FIN-REP': BarChartOutlined,
    'FIN-CFG': SettingOutlined,

    // Institucional (INST)
    'INST-GESTION-ACTUAL': CalendarOutlined,
    'INST-OFERTA-ACADEMICA': BookOutlined,
    'INST-HORARIOS': CalendarOutlined,
    'INST-GESTIONES-PASADAS': UnorderedListOutlined,

    // Reportes (REP)
    'REP-AVANCE-ACADEMICO': LineChartOutlined,
    'REP-ASISTENCIA': UserOutlined,
    'REP-DESERCION': FallOutlined,
    'REP-SOLICITUDES': FileDoneOutlined,

    // Configuración (CFG)
    'CFG-ACADEMICO': BookOutlined,
    'CFG-RECURSOS': AppstoreOutlined,
    'CFG-DOCUMENTACION': FolderOpenOutlined,
    'CFG-COMPLEMENTARIO': InfoCircleOutlined,
    'CFG-CONVENIOS': BankOutlined,
    'CFG-ACTIVIDADES': HistoryOutlined,

    // Seguridad (SEG)
    'SEG-USUARIOS': SettingOutlined,
    'SEG-ROLES': UserSwitchOutlined,

    // Capacitación (CAP)
    'CAP-CURSOS': BookOutlined,
    'CAP-PARTICIPANTES': TeamOutlined,
    'CAP-INSCRIPCIONES': SolutionOutlined,

    // Tutorías (TUT)
    'TUT-TITULACION': FileDoneOutlined,
    'TUT-ALERTAS': AlertOutlined,
    'TUT-SESIONES': ScheduleOutlined,
    'TUT-PANEL': FundOutlined,
};
