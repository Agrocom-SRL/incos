/**
 * Catálogo de BLOQUES HORARIO de capacitación (tipo_horario='CAPACITACION').
 *
 * TRANSITORIO: espejo del seeder `66-seed-horarios-capacitacion.sql` (IDs fijos
 * 61-74, rango reservado tras el 1-60 del seeder 24). El backend NO expone aún
 * un endpoint de catálogo de `horarios` filtrado por tipo, así que el picker
 * del formulario de curso usa esta tabla declarativa; el backend RE-VALIDA cada
 * id (existencia + tipo CAPACITACION) en Create/UpdateCursoCapacitacionUseCase.
 *
 * TODO(backend): exponer `GET /cursos-capacitacion/bloques-horario` (o catálogo
 * de horarios con filtro) y reemplazar esta constante por un hook de API.
 *
 * Etiquetas alineadas con `bloque_etiqueta` de la vista 154 ("LUN 15:00-17:00").
 */

const bloque = (id, dia, horaInicio, horaFin, grupo) => ({
  id,
  dia,
  horaInicio,
  horaFin,
  grupo,
  etiqueta: `${dia} ${horaInicio}-${horaFin}`,
});

/** L-V tarde (15:00-17:00) → IDs 61-65 · L-V noche (19:00-21:00) → 66-70 · Sábado 2h → 71-74. */
export const BLOQUES_HORARIO_CAPACITACION = [
  bloque(61, 'LUN', '15:00', '17:00', 'Tarde (L-V)'),
  bloque(62, 'MAR', '15:00', '17:00', 'Tarde (L-V)'),
  bloque(63, 'MIE', '15:00', '17:00', 'Tarde (L-V)'),
  bloque(64, 'JUE', '15:00', '17:00', 'Tarde (L-V)'),
  bloque(65, 'VIE', '15:00', '17:00', 'Tarde (L-V)'),
  bloque(66, 'LUN', '19:00', '21:00', 'Noche (L-V)'),
  bloque(67, 'MAR', '19:00', '21:00', 'Noche (L-V)'),
  bloque(68, 'MIE', '19:00', '21:00', 'Noche (L-V)'),
  bloque(69, 'JUE', '19:00', '21:00', 'Noche (L-V)'),
  bloque(70, 'VIE', '19:00', '21:00', 'Noche (L-V)'),
  bloque(71, 'SAB', '08:00', '10:00', 'Sábado'),
  bloque(72, 'SAB', '10:00', '12:00', 'Sábado'),
  bloque(73, 'SAB', '14:00', '16:00', 'Sábado'),
  bloque(74, 'SAB', '16:00', '18:00', 'Sábado'),
];

/** Opciones agrupadas para el Select múltiple del formulario de curso. */
export const BLOQUES_HORARIO_OPTIONS = ['Tarde (L-V)', 'Noche (L-V)', 'Sábado'].map((grupo) => ({
  label: grupo,
  title: grupo,
  options: BLOQUES_HORARIO_CAPACITACION.filter((b) => b.grupo === grupo).map((b) => ({
    value: b.id,
    label: b.etiqueta,
  })),
}));

/** Etiqueta de un bloque por id (fallback al id si no está en el catálogo local). */
export const bloqueEtiquetaById = (id) =>
  BLOQUES_HORARIO_CAPACITACION.find((b) => b.id === Number(id))?.etiqueta ?? `Bloque ${id}`;
