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

const fmtHoraCorta = (t) => {
    if (t == null || t === '') return '—';
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
};

/**
 * Resumen de bloques de un curso para la pestaña «Cursos del paralelo» del armado.
 */
export const resumenBloquesCurso = (c) => {
    const bloques = c.bloques || [];
    let minutos = 0;
    const diasOrd = [];
    const visto = new Set();
    const lineas = [];
    for (const b of bloques) {
        const d = b.dia ? String(b.dia).toUpperCase() : '';
        const mins = blockDurationMinutes(b.horaInicio, b.horaFin);
        minutos += mins;
        if (d && !visto.has(d)) {
            visto.add(d);
            diasOrd.push(DIA_ETIQUETA[d] || d);
        }
        if (d) {
            lineas.push(
                `${DIA_ETIQUETA[d] || d}: ${fmtHoraCorta(b.horaInicio)}–${fmtHoraCorta(b.horaFin)}${b.aula ? ` · ${b.aula}` : ''}`,
            );
        }
    }
    const horasGrilla = Math.round((minutos / 60) * 100) / 100;
    const horasPlan = c.horasSemanalesPlan != null ? Number(c.horasSemanalesPlan) : null;
    return { horasGrilla, horasPlan, diasOrd, lineas };
};
