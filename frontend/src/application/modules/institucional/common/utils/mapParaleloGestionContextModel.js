/**
 * Modelo de lectura compartido para cabecera de paralelo_gestion (oferta + horarios).
 * @param {object|null} raw — detalle API o meta parcial del resolver
 */
export function mapParaleloGestionContextModel(raw) {
    if (!raw) return null;
    const id = Number(raw.id ?? raw.paraleloGestionId);
    return {
        id: Number.isFinite(id) && id > 0 ? id : null,
        paraleloNombre: raw.paraleloNombre ?? raw.paralelo_nombre ?? raw.nombre ?? null,
        estado: raw.estado ?? raw.state ?? null,
        turno: raw.turno ?? null,
        carreraNombre: raw.carreraNombre ?? raw.carrera_nombre ?? null,
        carreraCodigo: raw.carreraCodigo ?? raw.carrera_codigo ?? null,
        carreraImagenRuta: raw.carreraImagenRuta ?? raw.carrera_imagen_ruta ?? null,
        periodoNombre: raw.periodoNombre ?? raw.periodo_nombre ?? null,
        periodoNumero: raw.periodoNumero ?? raw.periodo_numero ?? null,
        cupoMinimo: raw.cupoMinimo ?? raw.cupo_minimo ?? null,
        cupoMaximo: raw.cupoMaximo ?? raw.cupo_maximo ?? null,
        aulaId: raw.aulaId ?? raw.aula_id ?? null,
        aulaCodigo: raw.aulaCodigo ?? raw.aula_codigo ?? null,
        aulaNombre: raw.aulaNombre ?? raw.aula_nombre ?? null,
        planNombre: raw.planNombre ?? raw.plan_nombre ?? null,
        paraleloDescripcion:
            raw.paraleloDescripcion ?? raw.paralelo_descripcion ?? raw.descripcion ?? null,
    };
}
