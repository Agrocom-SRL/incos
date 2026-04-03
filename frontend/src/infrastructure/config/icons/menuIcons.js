// src/infrastructure/config/icons/menuIcons.js
/**
 * Configuración de iconos del menú de navegación
 * 
 * Single Responsibility: Solo mapea keys del menú a componentes de iconos
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuración de iconos
 * - Depende de: @ant-design/icons (librería externa)
 * 
 * Esta configuración centraliza el mapeo de iconos, facilitando:
 * - Mantenimiento (cambiar un icono en un solo lugar)
 * - Consistencia (mismo icono para misma funcionalidad)
 * - Extensibilidad (agregar nuevos iconos fácilmente)
 */

import {
    // Dashboard
    DashboardOutlined,
    // Estudiantes
    TeamOutlined,
    UnorderedListOutlined,
    UserAddOutlined,
    GiftOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    FolderOutlined,
    InfoCircleOutlined,
    // Inscripciones
    FileAddOutlined,
    BookOutlined,
    CalendarOutlined,
    // Calificaciones
    EditOutlined,
    TableOutlined,
    LockOutlined,
    // Nivelaciones
    SyncOutlined,
    // Docentes
    UsergroupAddOutlined,
    // Pasantías
    BankOutlined,
    FileSearchOutlined,
    EyeOutlined,
    // Supervisión
    ScheduleOutlined,
    FormOutlined,
    BarChartOutlined,
    // Horarios
    ClockCircleOutlined,
    // Pagos
    DollarOutlined,
    CreditCardOutlined,
    QrcodeOutlined,
    FileDoneOutlined,
    WarningOutlined,
    // Historial
    HistoryOutlined,
    SafetyCertificateOutlined,
    // Boletines
    FilePdfOutlined,
    SendOutlined,
    // Reportes
    LineChartOutlined,
    UserOutlined,
    FallOutlined,
    PieChartOutlined,
    // Usuarios
    SettingOutlined,
    UserSwitchOutlined,
    SafetyOutlined,
    AuditOutlined,
    // Configuración adicional
    FolderOpenOutlined,
    GlobalOutlined,
    TransactionOutlined,
    ReloadOutlined,
    // Transitabilidad
    SwapOutlined,
    ExportOutlined,
    ImportOutlined,
    // Dominios raíz (sidebar)
    IdcardOutlined,
    ReadOutlined,
    HomeOutlined,
} from '@ant-design/icons';

/**
 * Mapeo completo de iconos para todos los items del menú
 * Key: Identificador del item del menú
 * Value: Componente de icono de Ant Design
 */
export const menuIconMap = {
    // Dashboard
    'DASH': DashboardOutlined,

    // Dominios de negocio (sidebar v1.2)
    'MAT': IdcardOutlined,
    'ACA': ReadOutlined,
    'DOC-DOM': UsergroupAddOutlined,
    'FIN': DollarOutlined,
    'INST': HomeOutlined,
    'REP-DOM': LineChartOutlined,
    'SEG': SafetyOutlined,

    // Gestiones - Nivel 1
    'GES': CalendarOutlined,
    'GES-ACTUAL': CalendarOutlined,
    'GES-LIST': UnorderedListOutlined,
    'GES-ETAPAS': ScheduleOutlined,
    'GES-OFERTA': BookOutlined,
    'GES-HORARIOS-ASIGNAR': CalendarOutlined,
    'GES-MAT-INSCRIBIR': BookOutlined,
    'GES-MAT-CURSO': TableOutlined,
    'GES-HORARIO-GEN': SyncOutlined,

    // Configuración - Nivel 1
    'CFG': SettingOutlined,
    // Submenu Académico
    'CFG-ACADEMICO': BookOutlined,
    'CFG-CARRERAS': BookOutlined,
    'CFG-MATERIAS': FileTextOutlined,
    'CFG-PLAN': FileTextOutlined,
    'CFG-CURSOS': TableOutlined,
    'CFG-TURNOS': ClockCircleOutlined,
    // Submenu Documentación
    'CFG-DOCUMENTACION': FolderOpenOutlined,
    'CFG-DOCUMENTACION-INSCRIPCION': FileAddOutlined,
    'CFG-DOCUMENTACION-BECAS': GiftOutlined,
    'CFG-DOCUMENTACION-PASANTIAS': BankOutlined,
    'CFG-DOCUMENTACION-TRASLADO': TransactionOutlined,
    'CFG-DOCUMENTACION-TRANSFERENCIA': ReloadOutlined,
    // Submenu Datos Complementarios
    'CFG-DATOS-COMPLEMENTARIOS': InfoCircleOutlined,
    'CFG-DISCAPACIDAD': SafetyCertificateOutlined,
    'CFG-APODERADOS': UserOutlined,
    'CFG-IDIOMAS': GlobalOutlined,
    'CFG-PAGOS': DollarOutlined,
    // Historial de Actividades
    'CFG-HISTORIAL-ACTIVIDADES': HistoryOutlined,

    // Matrícula (sidebar v1.2)
    'MAT-ADMISION': TeamOutlined,
    'MAT-MATRICULAS': ReadOutlined,
    'MAT-APORTES': DollarOutlined,
    'MAT-APO-LISTA': UnorderedListOutlined,
    'MAT-ADM-LISTAR': UnorderedListOutlined,
    'MAT-ADM-NUEVA': UserAddOutlined,
    'MAT-BECAS': GiftOutlined,
    'MAT-BEC-LISTAR': UnorderedListOutlined,
    'MAT-BEC-ASIGNAR': GiftOutlined,
    'MAT-BEC-APROBAR': CheckCircleOutlined,
    'MAT-LICENCIAS': FileTextOutlined,
    'MAT-LIC-LISTAR': UnorderedListOutlined,
    'MAT-LIC-SOLICITAR': FileAddOutlined,
    'MAT-LIC-APROBAR': CheckCircleOutlined,
    'MAT-DOCUMENTOS': FolderOutlined,
    'MAT-LISTA': UnorderedListOutlined,
    'MAT-NUEVA': FileAddOutlined,

    // Académico — Licencias de estudiante
    'ACA-LIC-EST': FileTextOutlined,
    'ACA-LIC-EST-LIST': UnorderedListOutlined,
    'ACA-LIC-EST-SOLICITAR': FileAddOutlined,
    'ACA-LIC-EST-APROBAR': CheckCircleOutlined,

    // Académico — Traspasos / Transitabilidad (nivel 2 bajo ACA)
    'ACA-TRA': SwapOutlined,
    'ACA-TRASPASOS': TransactionOutlined,
    'ACA-TRA-TRASPASOS': TransactionOutlined,
    'ACA-TRA-TRP-LIST': UnorderedListOutlined,
    'ACA-TRA-TRP-SOLICITAR': ExportOutlined,
    'ACA-TRA-TRP-RECIBIR': ImportOutlined,
    'ACA-TRA-TRP-CONVALIDAR': FileDoneOutlined,
    'ACA-TRA-TRP-APROBAR': CheckCircleOutlined,
    'ACA-TRA-TRANSIT': ReloadOutlined,
    'ACA-TRANSIT': ReloadOutlined,
    'ACA-TRA-TNS-LIST': UnorderedListOutlined,
    'ACA-TRA-TNS-SOLICITAR': ExportOutlined,
    'ACA-TRA-TNS-RECIBIR': ImportOutlined,
    'ACA-TRA-TNS-CONVALIDAR': FileDoneOutlined,
    'ACA-TRA-TNS-APROBAR': CheckCircleOutlined,

    // Académico — Calificaciones
    'ACA-CAL': CheckCircleOutlined,
    'ACA-CAL-REGISTRAR': EditOutlined,
    'ACA-CAL-REG-PARCIAL': FileTextOutlined,
    'ACA-CAL-REG-PRACTICO': EditOutlined,
    'ACA-CAL-REG-RECUP': SyncOutlined,
    'ACA-CAL-CURSO': TableOutlined,
    'ACA-CAL-PERIODO': FilePdfOutlined,
    'ACA-CAL-MODIFICAR': EditOutlined,

    // Académico — Nivelaciones
    'ACA-NIV': SyncOutlined,
    'ACA-NIV-LIST': UnorderedListOutlined,
    'ACA-NIV-INSCRIBIR': BookOutlined,
    'ACA-NIV-APROBAR': CheckCircleOutlined,

    // Docentes
    'DOC-GEST': UsergroupAddOutlined,
    'DOC-LIST': UnorderedListOutlined,
    'DOC-CREATE': UserAddOutlined,
    'DOC-LIC': FileTextOutlined,
    'DOC-LIC-LIST': UnorderedListOutlined,
    'DOC-LIC-SOLICITAR': FileAddOutlined,
    'DOC-LIC-APROBAR': CheckCircleOutlined,

    // Supervisión (bajo dominio Docentes)
    'DOC-SUP': EyeOutlined,
    'SUP-FICHA-VER': UsergroupAddOutlined,
    'SUP-REPORTE': BarChartOutlined,
    'SUP-PASANTIAS': BankOutlined,
    'SUP-PASANTIAS-SOLICITAR': BankOutlined,
    'SUP-PASANTIAS-SEGUIMIENTO': EyeOutlined,
    'SUP-PASANTIAS-EVALUAR': FileSearchOutlined,

    // Pagos - Nivel 1
    'PAG': DollarOutlined,
    'PAG-LIST': UnorderedListOutlined,
    'PAG-REGISTRAR': CreditCardOutlined,
    'PAG-REPORTES': BarChartOutlined,
    'PAG-REPORTES-CARRERA': BookOutlined,
    'PAG-REPORTES-ESTUDIANTE': UserOutlined,
    'PAG-REPORTES-GESTION': CalendarOutlined,
    'PAG-ADICIONALES': FileAddOutlined,

    // Académico — Historial
    'ACA-HIS': HistoryOutlined,
    'ACA-HIS-FOLIO': BookOutlined,
    'ACA-HIS-ACADEMICO': FileTextOutlined,

    // Reportes - Nivel 1
    'REP': BarChartOutlined,
    'REP-AVANCE-ACADEMICO': LineChartOutlined,
    'REP-ASISTENCIA': UserOutlined,
    'REP-DESERCION': FallOutlined,
    // Submenu Solicitudes
    'REP-SOLICITUDES': FileDoneOutlined,
    'REP-SOLICITUDES-GENERAL': BarChartOutlined,
    'REP-SOLICITUDES-BECAS': GiftOutlined,
    'REP-SOLICITUDES-TRASPASO': TransactionOutlined,
    'REP-SOLICITUDES-TRANSFERENCIA': ReloadOutlined,
    'REP-SOLICITUDES-PASANTIA': BankOutlined,

    // Usuarios - Nivel 1
    'USR': UsergroupAddOutlined,
    'USR-CREATE': UserAddOutlined,
    'USR-LIST': SettingOutlined,
    'USR-ROLES': UserSwitchOutlined,
};

