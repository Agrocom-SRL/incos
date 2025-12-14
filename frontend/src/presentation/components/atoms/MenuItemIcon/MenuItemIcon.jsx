// src/presentation/components/atoms/MenuItemIcon/MenuItemIcon.jsx
import React from 'react';
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
} from '@ant-design/icons';

/**
 * Mapeo completo de iconos para todos los items del menú
 */
const iconMap = {
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
    'CFG-CARRERAS': BookOutlined,
    'CFG-MATERIAS': FileTextOutlined,
    'CFG-PLAN': FileTextOutlined,
    'CFG-CURSOS': TableOutlined,
    'CFG-TURNOS': ClockCircleOutlined,

    // Estudiantes - Nivel 1
    'EST': TeamOutlined,
    'EST-LIST': UnorderedListOutlined,
    'EST-CREATE': UserAddOutlined,
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
    'INS-CREATE': FileAddOutlined,
    'INS-HORARIO': SyncOutlined,
    'INS-MATERIAS-INSCRIBIR': BookOutlined,
    'INS-MATERIAS-CURSO': TableOutlined,
    'INS-ANULAR': CloseCircleOutlined,

    // Calificaciones - Nivel 1
    'CAL': CheckCircleOutlined,
    'CAL-REGISTRAR': EditOutlined,
    'CAL-REGISTRAR-PARCIAL': FileTextOutlined, 
    'CAL-REGISTRAR-PRACTICO': EditOutlined,
    'CAL-REGISTRAR-RECUPERATORIO': SyncOutlined,
    'CAL-CURSO': TableOutlined,
    'CAL-PERIODO': FilePdfOutlined,
    'CAL-CERRAR': LockOutlined,

    // Nivelaciones - Nivel 1
    'NIV': SyncOutlined,
    'NIV-LIST': UnorderedListOutlined,
    'NIV-INSCRIBIR': BookOutlined,
    'NIV-APROBAR': CheckCircleOutlined,

    // Docentes - Nivel 1
    'DOC': UsergroupAddOutlined,
    'DOC-LIST': UnorderedListOutlined,
    'DOC-CREATE': UserAddOutlined,

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
    'HIS-GENERAR': FileTextOutlined,
    'HIS-VALIDAR': SafetyCertificateOutlined,

    // Reportes - Nivel 1
    'REP': BarChartOutlined,
    'REP-RENDIMIENTO': LineChartOutlined,
    'REP-ASISTENCIA': UserOutlined,
    'REP-DESERCION': FallOutlined,
    'REP-BECAS': GiftOutlined,
    'REP-FINANCIERO': PieChartOutlined,

    // Usuarios - Nivel 1
    'USR': SettingOutlined,
    'USR-LIST': UnorderedListOutlined,
    'USR-CREATE': UserAddOutlined,
    'USR-ROLES': UserSwitchOutlined,
    'USR-PERMISOS': SafetyOutlined,
    'USR-AUDITORIA': AuditOutlined,
};

/**
 * Componente atómico para renderizar iconos del menú
 * @param {string} iconName - Nombre del icono (key del item)
 * @param {object} props - Props adicionales para el icono
 */
const MenuItemIcon = ({ iconName, ...props }) => {
    const IconComponent = iconMap[iconName];

    if (!IconComponent) {
        return null;
    }

    return <IconComponent {...props} />;
};

export default MenuItemIcon;
export { iconMap };
