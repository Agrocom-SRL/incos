-- ============================================
-- SEEDER: carreras
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Carreras del instituto
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE carreras;

-- ============================================
-- INSERTAR CARRERAS
-- ============================================
-- NOTA: Las imágenes deben estar en: backend/uploads/carreras/imagenes/{carreraId}/
-- Formato de nombre: {carreraId}_{codigo}.{ext}
-- Ejemplo: 1_SIS-INF.jpg, 2_ADM-EMP.png, 3_CON-GEN.jpg

INSERT INTO carreras (
    codigo, 
    nombre, 
    descripcion, 
    duracion_anios, 
    titulo_otorgado, 
    resolucion_ministerial, 
    carga_horaria_total, 
    color_hex,
    imagen_nombre,
    imagen_ruta,
    imagen_url
) VALUES
(
    'SIS-INF', 
    'Sistemas Informáticos', 
    'El Técnico Superior en Sistemas Informáticos es el profesional que brinda servicios de soporte técnico en software y hardware, implementación y gestión de redes, aplicaciones web, aplicaciones móviles que integran la tecnología arduino, creación de contenido gráfico y multimedia, incursionando en la utilización de las nuevas tecnologías con un enfoque investigativo e innovador, competitivo, respetando la Madre Tierra en la actividad tecnológica, productivo con ética en la atención y resolución de problemas y necesidades informáticas de la sociedad, con una visión emprendedora.', 
    3, 
    'Técnico Superior en Sistemas Informáticos', 
    NULL, 
    3600, 
    '#FF5733',
    '1_SIS-INF.webp',
    '/uploads/carreras/imagenes/1/1_SIS-INF.webp',
    NULL
),
(
    'ADM-EMP', 
    'Administración de Empresas', 
    'EL Técnico Superior en Administración de Empresas emprende, administra, asesora y es parte competente de las dependencias especializadas de las organizaciones públicas y privadas, para solucionar problemas organizacionales con la aplicación técnica de los saberes, conocimientos, habilidades y valores adquiridos. De igual forma, apoya el proceso de toma de decisiones en función de la optimización de los recursos organizacionales; contribuye técnica y administrativamente en las diferentes organizaciones en materia de: Mercadotecnia, Finanzas, Recursos Humanos, Producción y en otras áreas de actuación que son de su competencia profesional. El profesional en Administración brinda asistencia técnica y administrativa al desarrollo local y/o nacional de los diferentes niveles de gobierno; actúa con un código ético profesional y desarrolla la capacidad creativa, innovadora y de liderazgo para el desarrollo de proyectos.', 
    3, 
    'Técnico Superior en Administración de Empresas PyMES', 
    NULL, 
    3600, 
    '#3498DB',
    '2_ADM-EMP.webp',
    '/uploads/carreras/imagenes/2/2_ADM-EMP.webp',
    NULL
),
(
    'CON-GEN', 
    'Contaduría General', 
    'EL Técnico Superior en Contaduría General es el profesional que aplica normas contables, tributarias, procedimientos administrativos y disposiciones legales vigentes. El profesional utiliza metodologías científicas y técnicas para diseñar, organizar, ejecutar y evaluar la información contable, económica y financiera de las diversas organizaciones publicas, privadas y mixtas. La finalidad de este trabajo contable es elaborar estados estados financieros confiables, útiles, oportunos y comparables, para la toma de decisiones que generen emprendimientos en todo el territorio del Estado Plurinacional de Bolivia. Asimismo, el profesional contable debe preparar técnicamente todo tipo de información financiera - económica de cualquier actividad económica debiendo establecer, de forma creativa y proactiva, estrategias de políticas contables.', 
    3, 
    'Contador General', 
    NULL, 
    3600, 
    '#27AE60',
    '3_CON-GEN.webp',
    '/uploads/carreras/imagenes/3/3_CON-GEN.webp',
    NULL
);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

