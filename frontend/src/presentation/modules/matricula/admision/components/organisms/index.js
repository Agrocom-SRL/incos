/**
 * Organisms - Componentes orgánicos del módulo de estudiantes
 * 
 * Atomic Design: Organisms
 * - Componentes complejos que combinan molecules y atoms
 */

export { default as StudentInfoSection } from './StudentInfoSection';
export { default as DatosPersonalesSection } from './DatosPersonalesSection';
export { default as DisabilitiesSection } from './DisabilitiesSection';
export { default as OriginsSection } from './OriginsSection';
// ScholarshipsSection: se queda aquí (no en matricula/becas) porque su único
// consumidor es la ficha de detalle de admisión (EstudiantesDetail.jsx en
// matricula/admision/), no ninguna página de becas.
export { default as ScholarshipsSection } from './ScholarshipsSection';
