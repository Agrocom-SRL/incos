/**
 * Constantes compartidas de la aplicación
 * Organizadas por categorías para facilitar su uso y mantenimiento
 */

// ============================================
// ESTUDIANTES
// ============================================

/**
 * Estados académicos de estudiantes
 */
export const ESTADOS_ACADEMICOS = {
  REGULAR: 'REGULAR',
  NIVELACION: 'NIVELACION',
  RETIRADO: 'RETIRADO',
  EGRESADO: 'EGRESADO',
  ABANDONO: 'ABANDONO',
};

/**
 * Array de estados académicos válidos (útil para validators)
 */
export const ESTADOS_ACADEMICOS_VALUES = Object.values(ESTADOS_ACADEMICOS);

/**
 * Edad mínima requerida para ser estudiante (en años)
 */
export const EDAD_MINIMA_ESTUDIANTE = 17;

/**
 * Nota mínima para aprobar (0-100)
 */
export const NOTA_MINIMA_APROBACION = 60;

/**
 * Nota máxima posible
 */
export const NOTA_MAXIMA = 100;

// ============================================
// DOCUMENTOS DE IDENTIDAD
// ============================================

/**
 * Expediciones válidas del CI boliviano
 */
export const EXPEDICIONES_CI = {
  SANTA_CRUZ: 'SC',
  LA_PAZ: 'LP',
  COCHABAMBA: 'CB',
  TARIJA: 'TJ',
  BENI: 'BN',
  PANDO: 'PD',
  ORURO: 'OR',
  POTOSI: 'PT',
  CHUQUISACA: 'CH',
};

/**
 * Array de expediciones válidas (útil para validators)
 */
export const EXPEDICIONES_CI_VALUES = Object.values(EXPEDICIONES_CI);

/**
 * Longitud mínima del CI (dígitos)
 */
export const CI_LONGITUD_MINIMA = 7;

/**
 * Longitud máxima del CI (dígitos)
 */
export const CI_LONGITUD_MAXIMA = 9;

// ============================================
// DATOS PERSONALES
// ============================================

/**
 * Géneros permitidos
 */
export const GENEROS = {
  MASCULINO: 'MASCULINO',
  FEMENINO: 'FEMENINO',
  OTRO: 'OTRO',
};

/**
 * Array de géneros válidos (útil para validators)
 */
export const GENEROS_VALUES = Object.values(GENEROS);

/**
 * Tipos de sangre
 */
export const TIPOS_SANGRE = {
  A_POSITIVO: 'A+',
  A_NEGATIVO: 'A-',
  B_POSITIVO: 'B+',
  B_NEGATIVO: 'B-',
  AB_POSITIVO: 'AB+',
  AB_NEGATIVO: 'AB-',
  O_POSITIVO: 'O+',
  O_NEGATIVO: 'O-',
};

/**
 * Array de tipos de sangre válidos (útil para validators)
 */
export const TIPOS_SANGRE_VALUES = Object.values(TIPOS_SANGRE);

// ============================================
// TURNOS Y HORARIOS
// ============================================

/**
 * Turnos disponibles
 */
export const TURNOS = {
  MANANA: 'MAÑANA',
  TARDE: 'TARDE',
  NOCHE: 'NOCHE',
};

/**
 * Array de turnos válidos (útil para validators)
 */
export const TURNOS_VALUES = Object.values(TURNOS);

/**
 * Días de la semana
 */
export const DIAS_SEMANA = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
};

/**
 * Array de días de la semana válidos (útil para validators)
 */
export const DIAS_SEMANA_VALUES = Object.values(DIAS_SEMANA);

// ============================================
// BECAS Y DESCUENTOS
// ============================================

/**
 * Estados de becas
 */
export const ESTADOS_BECAS = {
  PENDIENTE: 'PENDIENTE',
  ACTIVA: 'ACTIVA',
  FINALIZADA: 'FINALIZADA',
  RECHAZADA: 'RECHAZADA',
};

/**
 * Array de estados de becas válidos (útil para validators)
 */
export const ESTADOS_BECAS_VALUES = Object.values(ESTADOS_BECAS);

/**
 * Tipos de asignación automática de becas
 */
export const TIPOS_BECA_AUTOMATICA = {
  PROMEDIO_90: 'PROMEDIO_90',
  MANUAL: 'MANUAL',
};

/**
 * Promedio mínimo para beca automática
 */
export const PROMEDIO_MINIMO_BECA_AUTOMATICA = 90;

// ============================================
// LICENCIAS
// ============================================

/**
 * Motivos de licencias estudiantiles
 */
export const MOTIVOS_LICENCIAS = {
  ENFERMEDAD: 'ENFERMEDAD',
  TRABAJO: 'TRABAJO',
  FAMILIAR: 'FAMILIAR',
  VIAJE: 'VIAJE',
  ACADEMICO: 'ACADEMICO',
  DEPORTIVO: 'DEPORTIVO',
  PERSONAL: 'PERSONAL',
  OTRO: 'OTRO',
};

/**
 * Array de motivos de licencias válidos (útil para validators)
 */
export const MOTIVOS_LICENCIAS_VALUES = Object.values(MOTIVOS_LICENCIAS);

/**
 * Estados de licencias
 */
export const ESTADOS_LICENCIAS = {
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA',
};

/**
 * Array de estados de licencias válidos (útil para validators)
 */
export const ESTADOS_LICENCIAS_VALUES = Object.values(ESTADOS_LICENCIAS);

// ============================================
// INSCRIPCIONES
// ============================================

/**
 * Estados de inscripciones
 */
export const ESTADOS_INSCRIPCIONES = {
  BORRADOR: 'BORRADOR',
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  ANULADA: 'ANULADA',
};

/**
 * Array de estados de inscripciones válidos (útil para validators)
 */
export const ESTADOS_INSCRIPCIONES_VALUES = Object.values(ESTADOS_INSCRIPCIONES);

// ============================================
// MATERIAS Y CURSOS
// ============================================

/**
 * Tipos de materia según su naturaleza
 */
export const TIPOS_MATERIA = {
  TEORICA: 'TEORICA',
  PRACTICA: 'PRACTICA',
  TEORICA_PRACTICA: 'TEORICA_PRACTICA',
};

/**
 * Array de tipos de materia válidos (útil para validators)
 */
export const TIPOS_MATERIA_VALUES = Object.values(TIPOS_MATERIA);

/**
 * Estados de cursos
 */
export const ESTADOS_CURSOS = {
  PROPUESTO: 'PROPUESTO',
  APROBADO: 'APROBADO',
  CANCELADO: 'CANCELADO',
};

/**
 * Array de estados de cursos válidos (útil para validators)
 */
export const ESTADOS_CURSOS_VALUES = Object.values(ESTADOS_CURSOS);

// ============================================
// PAGOS
// ============================================

/**
 * Métodos de pago
 */
export const METODOS_PAGO = {
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  DEPOSITO: 'DEPOSITO',
  TARJETA: 'TARJETA',
  QR: 'QR',
  OTRO: 'OTRO',
};

/**
 * Array de métodos de pago válidos (útil para validators)
 */
export const METODOS_PAGO_VALUES = Object.values(METODOS_PAGO);

/**
 * Estados de pagos
 */
export const ESTADOS_PAGO = {
  PENDIENTE: 'PENDIENTE',
  PAGADO: 'PAGADO',
  PARCIAL: 'PARCIAL',
  VENCIDO: 'VENCIDO',
  ANULADO: 'ANULADO',
};

/**
 * Array de estados de pagos válidos (útil para validators)
 */
export const ESTADOS_PAGO_VALUES = Object.values(ESTADOS_PAGO);

// ============================================
// DOCENTES
// ============================================

/**
 * Niveles académicos
 */
export const NIVELES_ACADEMICOS = {
  ESTUDIANTE: 'ESTUDIANTE',
  TECNICO: 'TECNICO',
  LICENCIATURA: 'LICENCIATURA',
  MAESTRIA: 'MAESTRIA',
  DOCTORADO: 'DOCTORADO',
};

/**
 * Array de niveles académicos válidos (útil para validators)
 */
export const NIVELES_ACADEMICOS_VALUES = Object.values(NIVELES_ACADEMICOS);

/**
 * Tipos de contrato
 */
export const TIPOS_CONTRATO = {
  PLANTA: 'PLANTA',
  CONTRATO: 'CONTRATO',
  HORARIO: 'HORARIO',
  CONSULTOR: 'CONSULTOR',
  EVENTUAL: 'EVENTUAL',
  TEMPORAL: 'TEMPORAL',
  INDEFINIDO: 'INDEFINIDO',
};

/**
 * Array de tipos de contrato válidos (útil para validators)
 */
export const TIPOS_CONTRATO_VALUES = Object.values(TIPOS_CONTRATO);

/**
 * Estados laborales
 */
export const ESTADOS_LABORALES = {
  ACTIVO: 'ACTIVO',
  LICENCIA: 'LICENCIA',
  RETIRADO: 'RETIRADO',
  SUSPENDIDO: 'SUSPENDIDO',
};

/**
 * Array de estados laborales válidos (útil para validators)
 */
export const ESTADOS_LABORALES_VALUES = Object.values(ESTADOS_LABORALES);

// ============================================
// USUARIOS Y SEGURIDAD
// ============================================

/**
 * Estados de usuarios
 */
export const ESTADOS_USUARIOS = {
  ACTIVO: null, // NULL = activo
  BLOQUEADO: 'BLOQUEADO',
  SUSPENDIDO: 'SUSPENDIDO',
  RETIRADO: 'RETIRADO',
};

/**
 * Tipos de referencia polimórfica
 */
export const TIPOS_REFERENCIA = {
  ESTUDIANTE: 'ESTUDIANTE',
  DOCENTE: 'DOCENTE',
  RECTOR: 'RECTOR',
  DIRECTOR: 'DIRECTOR',
  SECRETARIA: 'SECRETARIA',
};

/**
 * Array de tipos de referencia válidos (útil para validators)
 */
export const TIPOS_REFERENCIA_VALUES = Object.values(TIPOS_REFERENCIA);

/**
 * Acciones permitidas en permisos
 */
export const ACCIONES_PERMISOS = {
  VER: 'VER',
  CREAR: 'CREAR',
  EDITAR: 'EDITAR',
  ELIMINAR: 'ELIMINAR',
  APROBAR: 'APROBAR',
  EXPORTAR: 'EXPORTAR',
};

/**
 * Array de acciones válidas (útil para validators)
 */
export const ACCIONES_PERMISOS_VALUES = Object.values(ACCIONES_PERMISOS);

// ============================================
// PAGINACIÓN Y BÚSQUEDA
// ============================================

/**
 * Límite máximo de resultados por página
 */
export const PAGINACION_LIMITE_MAXIMO = 100;

/**
 * Límite por defecto de resultados por página
 */
export const PAGINACION_LIMITE_DEFECTO = 10;

/**
 * Página por defecto
 */
export const PAGINACION_PAGINA_DEFECTO = 1;

/**
 * Longitud mínima de búsqueda
 */
export const BUSQUEDA_LONGITUD_MINIMA = 2;

/**
 * Longitud máxima de búsqueda
 */
export const BUSQUEDA_LONGITUD_MAXIMA = 100;

// ============================================
// VALIDACIONES DE LONGITUD
// ============================================

/**
 * Longitud mínima de nombres
 */
export const LONGITUD_NOMBRES_MINIMA = 2;

/**
 * Longitud máxima de nombres
 */
export const LONGITUD_NOMBRES_MAXIMA = 150;

/**
 * Longitud mínima de apellidos
 */
export const LONGITUD_APELLIDOS_MINIMA = 2;

/**
 * Longitud máxima de apellidos
 */
export const LONGITUD_APELLIDOS_MAXIMA = 100;

/**
 * Longitud mínima de teléfono/celular (dígitos)
 */
export const LONGITUD_TELEFONO_MINIMA = 7;

/**
 * Longitud máxima de teléfono/celular (dígitos)
 */
export const LONGITUD_TELEFONO_MAXIMA = 8;

/**
 * Longitud mínima de motivo de beca/licencia
 */
export const LONGITUD_MOTIVO_MINIMA = 10;

/**
 * Longitud máxima de motivo de beca/licencia
 */
export const LONGITUD_MOTIVO_MAXIMA = 1000;

// ============================================
// FORMATOS
// ============================================

/**
 * Formato de gestión (YYYY-X donde X es 1 o 2)
 */
export const FORMATO_GESTION = /^\d{4}-[12]$/;

/**
 * Año mínimo válido para egreso de secundaria
 */
export const ANIO_EGRESO_MINIMO = 1950;

/**
 * Promedio mínimo válido
 */
export const PROMEDIO_MINIMO = 0;

/**
 * Promedio máximo válido
 */
export const PROMEDIO_MAXIMO = 100;

// ============================================
// EXPORT DEFAULT (para compatibilidad)
// ============================================

export default {
  // Estudiantes
  ESTADOS_ACADEMICOS,
  ESTADOS_ACADEMICOS_VALUES,
  EDAD_MINIMA_ESTUDIANTE,
  NOTA_MINIMA_APROBACION,
  NOTA_MAXIMA,
  
  // Documentos
  EXPEDICIONES_CI,
  EXPEDICIONES_CI_VALUES,
  CI_LONGITUD_MINIMA,
  CI_LONGITUD_MAXIMA,
  
  // Datos personales
  GENEROS,
  GENEROS_VALUES,
  TIPOS_SANGRE,
  TIPOS_SANGRE_VALUES,
  
  // Turnos y horarios
  TURNOS,
  TURNOS_VALUES,
  DIAS_SEMANA,
  DIAS_SEMANA_VALUES,
  
  // Becas
  ESTADOS_BECAS,
  ESTADOS_BECAS_VALUES,
  TIPOS_BECA_AUTOMATICA,
  PROMEDIO_MINIMO_BECA_AUTOMATICA,
  
  // Licencias
  MOTIVOS_LICENCIAS,
  MOTIVOS_LICENCIAS_VALUES,
  ESTADOS_LICENCIAS,
  ESTADOS_LICENCIAS_VALUES,
  
  // Inscripciones
  ESTADOS_INSCRIPCIONES,
  ESTADOS_INSCRIPCIONES_VALUES,
  
  // Materias y cursos
  TIPOS_MATERIA,
  TIPOS_MATERIA_VALUES,
  ESTADOS_CURSOS,
  ESTADOS_CURSOS_VALUES,
  
  // Pagos
  METODOS_PAGO,
  METODOS_PAGO_VALUES,
  ESTADOS_PAGO,
  ESTADOS_PAGO_VALUES,
  
  // Docentes
  NIVELES_ACADEMICOS,
  NIVELES_ACADEMICOS_VALUES,
  TIPOS_CONTRATO,
  TIPOS_CONTRATO_VALUES,
  ESTADOS_LABORALES,
  ESTADOS_LABORALES_VALUES,
  
  // Usuarios y seguridad
  ESTADOS_USUARIOS,
  TIPOS_REFERENCIA,
  TIPOS_REFERENCIA_VALUES,
  ACCIONES_PERMISOS,
  ACCIONES_PERMISOS_VALUES,
  
  // Paginación
  PAGINACION_LIMITE_MAXIMO,
  PAGINACION_LIMITE_DEFECTO,
  PAGINACION_PAGINA_DEFECTO,
  BUSQUEDA_LONGITUD_MINIMA,
  BUSQUEDA_LONGITUD_MAXIMA,
  
  // Validaciones de longitud
  LONGITUD_NOMBRES_MINIMA,
  LONGITUD_NOMBRES_MAXIMA,
  LONGITUD_APELLIDOS_MINIMA,
  LONGITUD_APELLIDOS_MAXIMA,
  LONGITUD_TELEFONO_MINIMA,
  LONGITUD_TELEFONO_MAXIMA,
  LONGITUD_MOTIVO_MINIMA,
  LONGITUD_MOTIVO_MAXIMA,
  
  // Formatos
  FORMATO_GESTION,
  ANIO_EGRESO_MINIMO,
  PROMEDIO_MINIMO,
  PROMEDIO_MAXIMO,
};
