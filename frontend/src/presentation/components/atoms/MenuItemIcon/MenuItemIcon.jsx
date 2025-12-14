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
    'EST-DOCUMENTOS-VER': EyeOutlined,
    'EST-DOCUMENTOS-VERIFICAR': CheckCircleOutlined,
    'EST-DOCUMENTOS-ESTADO': InfoCircleOutlined,
    
    // Inscripciones - Nivel 1
    'INS': FileAddOutlined,
    'INS-CREATE': FileAddOutlined,
    'INS-MATERIAS': BookOutlined,
    'INS-MATERIAS-INSCRIBIR': BookOutlined,
    'INS-MATERIAS-CURSO': TableOutlined,
    'INS-MATERIAS-VALIDAR': CheckCircleOutlined,
    'INS-HORARIO': CalendarOutlined,
    'INS-ANULAR': CloseCircleOutlined,
    
    // Calificaciones - Nivel 1
    'CAL': CheckCircleOutlined,
    'CAL-REGISTRAR': EditOutlined,
    'CAL-REGISTRAR-1PARCIAL': EditOutlined,
    'CAL-REGISTRAR-2PARCIAL': EditOutlined,
    'CAL-REGISTRAR-3PARCIAL': EditOutlined,
    'CAL-REGISTRAR-PRACTICO': EditOutlined,
    'CAL-REGISTRAR-RECUPERATORIO': SyncOutlined,
    'CAL-MODIFICAR': EditOutlined,
    'CAL-CURSO': TableOutlined,
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
    'DOC-ASIGNAR': UsergroupAddOutlined,
    
    // Pasantías - Nivel 1
    'PAS': BankOutlined,
    'PAS-ASIGNAR': BankOutlined,
    'PAS-EVALUAR': FileSearchOutlined,
    'PAS-SEGUIMIENTO': EyeOutlined,
    
    // Supervisión - Nivel 1
    'SUP': EyeOutlined,
    'SUP-PROGRAMAR': ScheduleOutlined,
    'SUP-FICHA': UsergroupAddOutlined,
    'SUP-FICHA-CREAR': FileAddOutlined,
    'SUP-FICHA-EDITAR': EditOutlined,
    'SUP-FICHA-VER': EyeOutlined,
    'SUP-REPORTE': BarChartOutlined,
    
    // Horarios - Nivel 1
    'HOR': CalendarOutlined,
    'HOR-TURNOS': ClockCircleOutlined,
    'HOR-ASIGNAR': CalendarOutlined,
    'HOR-GENERAR': CalendarOutlined,
    
    // Pagos - Nivel 1
    'PAG': DollarOutlined,
    'PAG-ARANCELES': DollarOutlined,
    'PAG-REGISTRAR': CreditCardOutlined,
    'PAG-REGISTRAR-EFECTIVO': DollarOutlined,
    'PAG-REGISTRAR-TRANSFERENCIA': CreditCardOutlined,
    'PAG-REGISTRAR-QR': QrcodeOutlined,
    'PAG-COMPROBANTE': FileDoneOutlined,
    'PAG-MOROSIDAD': WarningOutlined,
    
    // Historial - Nivel 1
    'HIS': HistoryOutlined,
    'HIS-GENERAR': FileTextOutlined,
    'HIS-VALIDAR': SafetyCertificateOutlined,
    'HIS-LIBROS': BookOutlined,
    
    // Boletines - Nivel 1
    'BOL': FilePdfOutlined,
    'BOL-GENERAR': FilePdfOutlined,
    'BOL-PUBLICAR': SendOutlined,
    
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
