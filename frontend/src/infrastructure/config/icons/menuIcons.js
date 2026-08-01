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
    FileDoneOutlined,
    FolderOpenOutlined,
    InfoCircleOutlined,
    UserSwitchOutlined,
    TableOutlined,
    AppstoreOutlined,
    ScheduleOutlined,
    SafetyCertificateOutlined,
    AlertOutlined,
    FundOutlined,
    ShopOutlined,
    ProfileOutlined,
    AuditOutlined,
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
    'CFG': SettingOutlined,
    'SEG': SafetyOutlined,
    'CAP': ScheduleOutlined,
    // Titulación (rename 2026-07-31 desde TUT; label del dominio desde 2026-07-29)
    'TIT': SafetyCertificateOutlined,
    'PERFIL': UserOutlined,

    // Matrícula (MAT)
    'MAT-ADM-NUEVA': UserAddOutlined,
    'MAT-ADMISION': TeamOutlined,
    'MAT-LISTA': UnorderedListOutlined,
    'MAT-APO-LISTA': DollarOutlined,
    'MAT-BEC-LISTAR': GiftOutlined,

    // Académico (ACA)
    'ACA-ASI': SolutionOutlined,
    'ACA-CAL': CheckCircleOutlined,
    'ACA-CENTRALIZADOR': TableOutlined,
    'ACA-LIBROS': ProfileOutlined,
    'ACA-NIV': SyncOutlined,
    'ACA-TRASPASOS': TransactionOutlined,
    'ACA-TRANSIT': ReloadOutlined,
    'ACA-HIS': HistoryOutlined,
    'ACA-AVANCE': LineChartOutlined,
    // Acompañamiento pedagógico (reclasificado desde TUT el 2026-07-31)
    'ACA-ALERTAS': AlertOutlined,
    'ACA-SESIONES': ScheduleOutlined,
    'ACA-PANEL': FundOutlined,

    // Docentes (DOC)
    'DOC-LIST': UnorderedListOutlined,
    'DOC-LIC': FileTextOutlined,
    'DOC-SUPERVISION': AuditOutlined,

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

    // Titulación (TIT) — rename 2026-07-31 desde TUT; Acompañamiento se
    // reclasificó al bloque Académico (ver arriba).
    'TIT-PROYECTOS': FileDoneOutlined,
    'TIT-PASANTIAS': ShopOutlined,
    // Reportes de avance de tutoría (Requisitos 2/3 — extensión 2026-07-31)
    'TIT-PROYECTOS-AVANCE-CARRERA': BarChartOutlined,
    'TIT-PROYECTOS-PLANILLA-TERCER-ANIO': TableOutlined,
};
