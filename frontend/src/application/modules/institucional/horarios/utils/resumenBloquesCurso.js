function horaToMinutes(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'string') {
        const m = v.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (!m) return null;
        return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    }
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
        return v.getHours() * 60 + v.getMinutes();
    }
    return null;
}

function blockDurationMinutes(horaInicio, horaFin) {
    const a = horaToMinutes(horaInicio);
    const b = horaToMinutes(horaFin);
    if (a == null || b == null || b <= a) return 45;
    return b - a;
}

const DIA_ETIQUETA = {
    LUNES: 'Lunes',
    MARTES: 'Martes',
    MIERCOLES: 'Miércoles',
    JUEVES: 'Jueves',
    VIERNES: 'Viernes',
    SABADO: 'Sábado',
};

const DIAS_ORDEN = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const fmtHoraCorta = (t) => {
    if (t == null || t === '') return '—';
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
};

/** Una línea por día con todas las franjas separadas por coma. */
function buildLineasPorDia(bloques) {
    const byDay = new Map();
    for (const b of bloques || []) {
        const d = b.dia ? String(b.dia).toUpperCase() : '';
        if (!d) continue;
        if (!byDay.has(d)) byDay.set(d, []);
        byDay.get(d).push(b);
    }

    const lineas = [];
    for (const d of DIAS_ORDEN) {
        const dayBlocks = byDay.get(d);
        if (!dayBlocks?.length) continue;
        dayBlocks.sort(
            (a, b) =>
                (horaToMinutes(a.horaInicio) ?? 0) - (horaToMinutes(b.horaInicio) ?? 0),
        );
        const franjas = dayBlocks
            .map((b) => `${fmtHoraCorta(b.horaInicio)}–${fmtHoraCorta(b.horaFin)}`)
            .join(', ');
        lineas.push(`${DIA_ETIQUETA[d] || d}: ${franjas}`);
    }
    return lineas;
}

/**
 * Resumen de bloques de un curso para la pestaña «Cobertura» del armado.
 */
export const resumenBloquesCurso = (c) => {
    const bloques = c.bloques || [];
    let minutos = 0;
    const diasOrd = [];
    const visto = new Set();
    for (const b of bloques) {
        const d = b.dia ? String(b.dia).toUpperCase() : '';
        const mins = blockDurationMinutes(b.horaInicio, b.horaFin);
        minutos += mins;
        if (d && !visto.has(d)) {
            visto.add(d);
            diasOrd.push(DIA_ETIQUETA[d] || d);
        }
    }
    const horasGrilla = Math.round((minutos / 60) * 100) / 100;
    const horasPlan = c.horasSemanalesPlan != null ? Number(c.horasSemanalesPlan) : null;
    const lineas = buildLineasPorDia(bloques);
    return { horasGrilla, horasPlan, diasOrd, lineas };
};
