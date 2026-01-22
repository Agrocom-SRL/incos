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
    CloseCircleOutlined,
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
} from '@ant-design/icons';

/**
 * Mapeo completo de iconos para todos los items del menú
 * Key: Identificador del item del menú
 * Value: Componente de icono de Ant Design
 */
export const menuIconMap = {
    // Dashboard
    'DASH': DashboardOutlined,

    // Gestiones - Nivel 1
    'GES': CalendarOutlined,
    'GES-ACTUAL': CalendarOutlined,
    'GES-LIST': UnorderedListOutlined,
    'GES-ETAPAS': ScheduleOutlined,
    'GES-OFERTA': BookOutlined,
    'GES-HORARIOS-ASIGNAR': CalendarOutlined,

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
    // Historial de Actividades
    'CFG-HISTORIAL-ACTIVIDADES': HistoryOutlined,

    // Estudiantes - Nivel 1
    'EST': TeamOutlined,
    'EST-LIST': UnorderedListOutlined,
    'EST-REGISTRAR': UserAddOutlined,
    'EST-BECAS': GiftOutlined,
    'EST-BECAS-ASIGNAR': GiftOutlined,
    'EST-BECAS-APROBAR': CheckCircleOutlined,
    'EST-BECAS-LIST': UnorderedListOutlined,
    'EST-LICENCIAS': FileTextOutlined,
    'EST-LICENCIAS-SOLICITAR': FileAddOutlined,
    'EST-LICENCIAS-APROBAR': CheckCircleOutlined,
    'EST-LICENCIAS-LIST': UnorderedListOutlined,
    'EST-DOCUMENTOS': FolderOutlined,

    // Inscripciones - Nivel 1
    'INS': FileAddOutlined,
    'INS-LIST': UnorderedListOutlined,
    'INS-CREATE': FileAddOutlined,
    'INS-HORARIO': SyncOutlined,
    'INS-MATERIAS-INSCRIBIR': BookOutlined,
    'INS-MATERIAS-CURSO': TableOutlined,
    'INS-ANULAR': CloseCircleOutlined,

    // Transitabilidad - Nivel 1
    'TRA': SwapOutlined,
    // Submenu Traspasos
    'TRA-TRASPASOS': TransactionOutlined,
    'TRA-TRASPASOS-LIST': UnorderedListOutlined,
    'TRA-TRASPASOS-SOLICITAR': ExportOutlined,
    'TRA-TRASPASOS-RECIBIR': ImportOutlined,
    'TRA-TRASPASOS-CONVALIDAR-NOTAS': FileDoneOutlined,
    'TRA-TRASPASOS-APROBAR': CheckCircleOutlined,
    // Submenu Transitabilidad
    'TRA-TRANSFERENCIAS': ReloadOutlined,
    'TRA-TRANSFERENCIAS-LIST': UnorderedListOutlined,
    'TRA-TRANSFERENCIAS-SOLICITAR': ExportOutlined,
    'TRA-TRANSFERENCIAS-RECIBIR': ImportOutlined,
    'TRA-TRANSFERENCIAS-CONVALIDAR-NOTAS': FileDoneOutlined,
    'TRA-TRANSFERENCIAS-APROBAR': CheckCircleOutlined,

    // Calificaciones - Nivel 1
    'CAL': CheckCircleOutlined,
    'CAL-REGISTRAR': EditOutlined,
    'CAL-REGISTRAR-PARCIAL': FileTextOutlined,
    'CAL-REGISTRAR-PRACTICO': EditOutlined,
    'CAL-REGISTRAR-RECUPERATORIO': SyncOutlined,
    'CAL-CURSO': TableOutlined,
    'CAL-PERIODO': FilePdfOutlined,

    // Nivelaciones - Nivel 1
    'NIV': SyncOutlined,
    'NIV-LIST': UnorderedListOutlined,
    'NIV-INSCRIBIR': BookOutlined,
    'NIV-APROBAR': CheckCircleOutlined,

    // Docentes - Nivel 1
    'DOC': UsergroupAddOutlined,
    'DOC-LIST': UnorderedListOutlined,
    'DOC-CREATE': UserAddOutlined,
    'DOC-LICENCIAS': FileTextOutlined,
    'DOC-LICENCIAS-LIST': UnorderedListOutlined,
    'DOC-LICENCIAS-SOLICITAR': FileAddOutlined,
    'DOC-LICENCIAS-APROBAR': CheckCircleOutlined,

    // Supervisión - Nivel 1
    'SUP': EyeOutlined,
    'SUP-FICHA-VER': UsergroupAddOutlined,
    'SUP-REPORTE': BarChartOutlined,
    'SUP-PASANTIAS': BankOutlined,
    'SUP-PASANTIAS-SOLICITAR': BankOutlined,
    'SUP-PASANTIAS-SEGUIMIENTO': EyeOutlined,
    'SUP-PASANTIAS-EVALUAR': FileSearchOutlined,

    // Pagos - Nivel 1
    'PAG': DollarOutlined,
    'PAG-CONFIG': SettingOutlined,
    'PAG-LIST': UnorderedListOutlined,
    'PAG-REGISTRAR': CreditCardOutlined,
    'PAG-REPORTES': BarChartOutlined,
    'PAG-REPORTES-CARRERA': BookOutlined,
    'PAG-REPORTES-ESTUDIANTE': UserOutlined,
    'PAG-REPORTES-GESTION': CalendarOutlined,
    'PAG-ADICIONALES': FileAddOutlined,

    // Historial - Nivel 1
    'HIS': HistoryOutlined,
    'HIS-FOLIO': BookOutlined,
    'HIS-ACADEMICO': FileTextOutlined,

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

