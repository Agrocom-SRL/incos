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
-- IDs fijos para facilitar migraciones y referencias consistentes
-- Orden: 1. Sistemas Informáticos, 2. Administración de Empresas, 3. Contaduría General
-- ============================================
-- NOTA: Las imágenes deben estar en: backend/uploads/carreras/
-- Formato de ruta: /uploads/carreras/{carreraId}_{codigo}.webp
-- Ejemplo: /uploads/carreras/1_SIS-INF.webp

INSERT INTO carreras (
    id,
    codigo, 
    nombre, 
    descripcion,
    area_formacion,
    titulo_otorgado,
    color_hex,
    imagen_ruta
) VALUES
(
    1,
    'SIS-INF', 
    'Sistemas Informáticos', 
    'El Técnico Superior en Sistemas Informáticos es el profesional que brinda servicios de soporte técnico en software y hardware, implementación y gestión de redes, aplicaciones web, aplicaciones móviles que integran la tecnología arduino, creación de contenido gráfico y multimedia, incursionando en la utilización de las nuevas tecnologías con un enfoque investigativo e innovador, competitivo, respetando la Madre Tierra en la actividad tecnológica, productivo con ética en la atención y resolución de problemas y necesidades informáticas de la sociedad, con una visión emprendedora.',
    'COMERCIAL Y SERVICIOS',
    'Técnico Superior en Sistemas Informáticos',
    '#FF5733',
    '/uploads/carreras/1_SIS-INF.webp'
),
(
    2,
    'ADM-EMP', 
    'Administración de Empresas', 
    'EL Técnico Superior en Administración de Empresas emprende, administra, asesora y es parte competente de las dependencias especializadas de las organizaciones públicas y privadas, para solucionar problemas organizacionales con la aplicación técnica de los saberes, conocimientos, habilidades y valores adquiridos. De igual forma, apoya el proceso de toma de decisiones en función de la optimización de los recursos organizacionales; contribuye técnica y administrativamente en las diferentes organizaciones en materia de: Mercadotecnia, Finanzas, Recursos Humanos, Producción y en otras áreas de actuación que son de su competencia profesional. El profesional en Administración brinda asistencia técnica y administrativa al desarrollo local y/o nacional de los diferentes niveles de gobierno; actúa con un código ético profesional y desarrolla la capacidad creativa, innovadora y de liderazgo para el desarrollo de proyectos.',
    'COMERCIAL Y SERVICIOS',
    'Técnico Superior en Administración de Empresas',
    '#3498DB',
    '/uploads/carreras/2_ADM-EMP.webp'
),
(
    3,
    'CON-GEN', 
    'Contaduría General', 
    'EL Técnico Superior en Contaduría General es el profesional que aplica normas contables, tributarias, procedimientos administrativos y disposiciones legales vigentes. El profesional utiliza metodologías científicas y técnicas para diseñar, organizar, ejecutar y evaluar la información contable, económica y financiera de las diversas organizaciones publicas, privadas y mixtas. La finalidad de este trabajo contable es elaborar estados estados financieros confiables, útiles, oportunos y comparables, para la toma de decisiones que generen emprendimientos en todo el territorio del Estado Plurinacional de Bolivia. Asimismo, el profesional contable debe preparar técnicamente todo tipo de información financiera - económica de cualquier actividad económica debiendo establecer, de forma creativa y proactiva, estrategias de políticas contables.',
    'COMERCIAL Y SERVICIOS',
    'Contador General',
    '#27AE60',
    '/uploads/carreras/3_CON-GEN.webp'
);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
