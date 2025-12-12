// src/router/config/navigationMenuData.js
/**
 * Items del menú de navegación basados en los módulos funcionales del sistema
 * Referencia: docs/02-requerimientos-funcionales.md y docs/06-diseno-api.md
 * 
 * Ubicación: router/config/ (configuración del router, no es data genérica)
 * 
 * TODO: En el futuro, este menú debería generarse automáticamente desde las rutas
 * para evitar duplicación de keys entre rutas y menú.
 */
export const navigationMenuItems = [
    {
        key: 'DASH',
        label: 'Dashboard',
        module: 'DASH',
    },
    {
        key: 'EST',
        label: 'Estudiantes',
        module: 'EST',
        children: [
            {
                key: 'EST-LIST',
                label: 'Listar',
                module: 'EST',
            },
            {
                key: 'EST-CREATE',
                label: 'Registrar',
                module: 'EST',
            },
            {
                key: 'EST-BECAS',
                label: 'Becas',
                module: 'EST',
                children: [
                    {
                        key: 'EST-BECAS-ASIGNAR',
                        label: 'Asignar',
                        module: 'EST',
                    },
                    {
                        key: 'EST-BECAS-APROBAR',
                        label: 'Aprobar',
                        module: 'EST',
                    },
                    {
                        key: 'EST-BECAS-LIST',
                        label: 'Listar',
                        module: 'EST',
                    },
                ],
            },
            {
                key: 'EST-LICENCIAS',
                label: 'Licencias',
                module: 'EST',
                children: [
                    {
                        key: 'EST-LICENCIAS-SOLICITAR',
                        label: 'Solicitar',
                        module: 'EST',
                    },
                    {
                        key: 'EST-LICENCIAS-APROBAR',
                        label: 'Aprobar',
                        module: 'EST',
                    },
                    {
                        key: 'EST-LICENCIAS-LIST',
                        label: 'Listar',
                        module: 'EST',
                    },
                ],
            },
            {
                key: 'EST-ESTADO',
                label: 'Estado',
                module: 'EST',
            },
            {
                key: 'EST-DOCUMENTOS',
                label: 'Documentos',
                module: 'EST',
                children: [
                    {
                        key: 'EST-DOCUMENTOS-VER',
                        label: 'Ver Documentos',
                        module: 'EST',
                    },
                    {
                        key: 'EST-DOCUMENTOS-VERIFICAR',
                        label: 'Verificar',
                        module: 'EST',
                    },
                    {
                        key: 'EST-DOCUMENTOS-ESTADO',
                        label: 'Estado',
                        module: 'EST',
                    },
                ],
            },
        ],
    },
    {
        key: 'INS',
        label: 'Inscripciones',
        module: 'INS',
        children: [
            {
                key: 'INS-CREATE',
                label: 'Nueva',
                module: 'INS',
            },
            {
                key: 'INS-MATERIAS',
                label: 'Inscribir Materias',
                module: 'INS',
                children: [
                    {
                        key: 'INS-MATERIAS-INSCRIBIR',
                        label: 'Por Materia',
                        module: 'INS',
                    },
                    {
                        key: 'INS-MATERIAS-CURSO',
                        label: 'Por Curso',
                        module: 'INS',
                    },
                    {
                        key: 'INS-MATERIAS-VALIDAR',
                        label: 'Validar',
                        module: 'INS',
                    },
                ],
            },
            {
                key: 'INS-HORARIO',
                label: 'Horario',
                module: 'INS',
            },
            {
                key: 'INS-ANULAR',
                label: 'Anular',
                module: 'INS',
            },
        ],
    },
    {
        key: 'CAL',
        label: 'Calificaciones',
        module: 'CAL',
        children: [
            {
                key: 'CAL-REGISTRAR',
                label: 'Registrar',
                module: 'CAL',
                children: [
                    {
                        key: 'CAL-REGISTRAR-1PARCIAL',
                        label: '1º Parcial',
                        module: 'CAL',
                    },
                    {
                        key: 'CAL-REGISTRAR-2PARCIAL',
                        label: '2º Parcial',
                        module: 'CAL',
                    },
                    {
                        key: 'CAL-REGISTRAR-3PARCIAL',
                        label: '3º Parcial',
                        module: 'CAL',
                    },
                    {
                        key: 'CAL-REGISTRAR-PRACTICO',
                        label: 'Práctico',
                        module: 'CAL',
                    },
                    {
                        key: 'CAL-REGISTRAR-RECUPERATORIO',
                        label: 'Recuperatorio',
                        module: 'CAL',
                    },
                ],
            },
            {
                key: 'CAL-MODIFICAR',
                label: 'Modificar',
                module: 'CAL',
            },
            {
                key: 'CAL-CURSO',
                label: 'Por Curso',
                module: 'CAL',
            },
            {
                key: 'CAL-CERRAR',
                label: 'Cerrar',
                module: 'CAL',
            },
        ],
    },
    {
        key: 'NIV',
        label: 'Nivelaciones',
        module: 'NIV',
        children: [
            {
                key: 'NIV-LIST',
                label: 'Listar',
                module: 'NIV',
            },
            {
                key: 'NIV-INSCRIBIR',
                label: 'Inscribir',
                module: 'NIV',
            },
            {
                key: 'NIV-APROBAR',
                label: 'Aprobar',
                module: 'NIV',
            },
        ],
    },
    {
        key: 'DOC',
        label: 'Docentes',
        module: 'DOC',
        children: [
            {
                key: 'DOC-LIST',
                label: 'Listar',
                module: 'DOC',
            },
            {
                key: 'DOC-CREATE',
                label: 'Registrar',
                module: 'DOC',
            },
            {
                key: 'DOC-ASIGNAR',
                label: 'Asignar',
                module: 'DOC',
            },
        ],
    },
    {
        key: 'PAS',
        label: 'Pasantías',
        module: 'PAS',
        children: [
            {
                key: 'PAS-ASIGNAR',
                label: 'Asignar',
                module: 'PAS',
            },
            {
                key: 'PAS-EVALUAR',
                label: 'Evaluar',
                module: 'PAS',
            },
            {
                key: 'PAS-SEGUIMIENTO',
                label: 'Seguimiento',
                module: 'PAS',
            },
        ],
    },
    {
        key: 'SUP',
        label: 'Supervisión',
        module: 'SUP',
        children: [
            {
                key: 'SUP-PROGRAMAR',
                label: 'Programar',
                module: 'SUP',
            },
            {
                key: 'SUP-FICHA',
                label: 'Evaluación Docente',
                module: 'SUP',
                children: [
                    {
                        key: 'SUP-FICHA-CREAR',
                        label: 'Crear',
                        module: 'SUP',
                    },
                    {
                        key: 'SUP-FICHA-EDITAR',
                        label: 'Editar',
                        module: 'SUP',
                    },
                    {
                        key: 'SUP-FICHA-VER',
                        label: 'Ver',
                        module: 'SUP',
                    },
                ],
            },
            {
                key: 'SUP-REPORTE',
                label: 'Reporte',
                module: 'SUP',
            },
        ],
    },
    {
        key: 'HOR',
        label: 'Horarios',
        module: 'HOR',
        children: [
            {
                key: 'HOR-TURNOS',
                label: 'Turnos',
                module: 'HOR',
            },
            {
                key: 'HOR-ASIGNAR',
                label: 'Asignar',
                module: 'HOR',
            },
            {
                key: 'HOR-GENERAR',
                label: 'Generar',
                module: 'HOR',
            },
        ],
    },
    {
        key: 'PAG',
        label: 'Pagos',
        module: 'PAG',
        children: [
            {
                key: 'PAG-ARANCELES',
                label: 'Aranceles',
                module: 'PAG',
            },
            {
                key: 'PAG-REGISTRAR',
                label: 'Registrar Pago',
                module: 'PAG',
                children: [
                    {
                        key: 'PAG-REGISTRAR-EFECTIVO',
                        label: 'Efectivo',
                        module: 'PAG',
                    },
                    {
                        key: 'PAG-REGISTRAR-TRANSFERENCIA',
                        label: 'Transferencia',
                        module: 'PAG',
                    },
                    {
                        key: 'PAG-REGISTRAR-QR',
                        label: 'QR',
                        module: 'PAG',
                    },
                ],
            },
            {
                key: 'PAG-COMPROBANTE',
                label: 'Comprobantes',
                module: 'PAG',
            },
            {
                key: 'PAG-MOROSIDAD',
                label: 'Morosidad',
                module: 'PAG',
            },
        ],
    },
    {
        key: 'HIS',
        label: 'Historial',
        module: 'HIS',
        children: [
            {
                key: 'HIS-GENERAR',
                label: 'Generar',
                module: 'HIS',
            },
            {
                key: 'HIS-VALIDAR',
                label: 'Validar',
                module: 'HIS',
            },
            {
                key: 'HIS-LIBROS',
                label: 'Libros Oficiales',
                module: 'HIS',
            },
        ],
    },
    {
        key: 'BOL',
        label: 'Boletines',
        module: 'BOL',
        children: [
            {
                key: 'BOL-GENERAR',
                label: 'Generar Boletín',
                module: 'BOL',
            },
            {
                key: 'BOL-PUBLICAR',
                label: 'Publicar',
                module: 'BOL',
            },
        ],
    },
    {
        key: 'REP',
        label: 'Reportes',
        module: 'REP',
        children: [
            {
                key: 'REP-RENDIMIENTO',
                label: 'Rendimiento',
                module: 'REP',
            },
            {
                key: 'REP-ASISTENCIA',
                label: 'Asistencia',
                module: 'REP',
            },
            {
                key: 'REP-DESERCION',
                label: 'Deserción',
                module: 'REP',
            },
            {
                key: 'REP-BECAS',
                label: 'Becas',
                module: 'REP',
            },
            {
                key: 'REP-FINANCIERO',
                label: 'Financiero',
                module: 'REP',
            },
        ],
    },
    {
        key: 'USR',
        label: 'Usuarios',
        module: 'USR',
        children: [
            {
                key: 'USR-LIST',
                label: 'Listar',
                module: 'USR',
            },
            {
                key: 'USR-CREATE',
                label: 'Crear',
                module: 'USR',
            },
            {
                key: 'USR-ROLES',
                label: 'Roles',
                module: 'USR',
            },
            {
                key: 'USR-PERMISOS',
                label: 'Permisos',
                module: 'USR',
            },
            {
                key: 'USR-AUDITORIA',
                label: 'Auditoría',
                module: 'USR',
            },
        ],
    },
];

export default navigationMenuItems;
