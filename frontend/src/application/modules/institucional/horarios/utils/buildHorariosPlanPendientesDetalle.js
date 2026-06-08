import { resolveHorasPlanSemanalCurso } from './resolveHorasPlanSemanalCurso';

/**
 * Construye mensajes legibles de pendientes/conflictos a partir del plan local
 * (`courseSchedules` como lo consume DocenteHorarioSemanalGrid).
 *
 * @param {Array<{
 *   cursoId?: number,
 *   materiaSigla?: string|null,
 *   materiaNombre?: string|null,
 *   cursoCodigo?: string|null,
 *   docente?: string|null,
 *   docenteId?: number|null,
 *   horasSemanalesPlan?: number|null,
 *   bloques?: object[],
 * }>} courseSchedules
 * @param {{ maxSolapeLineas?: number, maxChoqueLineas?: number }} [opts]
 * @returns {string[]}
 */

const DIA_LABELS = {
    LUNES: 'Lun',
    MARTES: 'Mar',
    MIERCOLES: 'Mié',
    JUEVES: 'Jue',
    VIERNES: 'Vie',
    SABADO: 'Sáb',
};

const MAX_SIGLAS_LISTA = 14;
const DEFAULT_MAX_SOLAPE = 8;
const DEFAULT_MAX_CHOQUE = 8;

/** @param {unknown} v */
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

/** @param {unknown} raw */
function normalizeDiaDb(raw) {
    if (raw == null || raw === '') return null;
    const s = String(raw).toUpperCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s || null;
}

/** @param {unknown} t */
function fmtHoraCorta(t) {
    if (t == null || t === '') return '—';
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
}

function siglaCurso(c) {
    return (
        (c.materiaSigla && String(c.materiaSigla).trim()) ||
        (c.cursoCodigo && String(c.cursoCodigo).trim()) ||
        (c.materiaNombre && String(c.materiaNombre).trim()) ||
        (c.cursoId != null ? `Curso ${c.cursoId}` : '—')
    );
}

function docenteClave(docente, docenteId) {
    if (docenteId != null && Number.isFinite(Number(docenteId)) && Number(docenteId) > 0) {
        return `id:${Number(docenteId)}`;
    }
    const s = docente == null ? '' : String(docente).trim();
    if (!s) return '';
    return `n:${s.toLowerCase()}`;
}

function docenteEtiqueta(docente, docenteId) {
    const s = docente == null ? '' : String(docente).trim();
    if (s) return s;
    if (docenteId != null && Number.isFinite(Number(docenteId)) && Number(docenteId) > 0) {
        return `Docente #${docenteId}`;
    }
    return 'Docente sin nombre';
}

function unirSiglas(siglas, max = MAX_SIGLAS_LISTA) {
    const u = [...new Set(siglas.map((s) => String(s || '').trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'es'),
    );
    if (!u.length) return '';
    if (u.length <= max) return u.join(', ');
    return `${u.slice(0, max).join(', ')}… (+${u.length - max} más)`;
}

/**
 * @param {unknown[]} courseSchedules
 * @param {{ maxSolapeLineas?: number, maxChoqueLineas?: number }} [opts]
 */
export function buildHorariosPlanPendientesDetalleLines(courseSchedules, opts = {}) {
    const maxSolape = opts.maxSolapeLineas ?? DEFAULT_MAX_SOLAPE;
    const maxChoque = opts.maxChoqueLineas ?? DEFAULT_MAX_CHOQUE;
    const list = Array.isArray(courseSchedules) ? courseSchedules : [];
    const lineas = [];

    const sinBloquesSiglas = [];
    const sinDocSiglas = [];
    const sinAulaSiglas = [];

    /** @type {Map<string, Map<string, Map<number, string>>>} slotKey -> docKey -> cursoId -> sigla */
    const docentePorSlot = new Map();
    /** @type {Map<string, Map<number, string>>} */
    const cursosPorSlot = new Map();

    for (const c of list) {
        const sigla = siglaCurso(c);
        const bloques = Array.isArray(c.bloques) ? c.bloques : [];
        if (!bloques.length) {
            sinBloquesSiglas.push(sigla);
            continue;
        }

        const sinDoc =
            (c.docente == null || String(c.docente).trim() === '') &&
            !(c.docenteId != null && Number(c.docenteId) > 0);
        if (sinDoc) sinDocSiglas.push(sigla);

        for (const b of bloques) {
            const dia = normalizeDiaDb(b?.dia);
            const start = horaToMinutes(b?.horaInicio);
            if (!dia || start == null) continue;

            const aula = b?.aula;
            const sinAula =
                aula == null ||
                String(aula).trim() === '' ||
                String(aula).trim() === '—' ||
                String(aula).toLowerCase() === 'null';
            if (sinAula) sinAulaSiglas.push(sigla);

            const slotKey = `${dia}-${start}`;
            const dk = docenteClave(c.docente, c.docenteId);
            if (dk) {
                if (!docentePorSlot.has(slotKey)) docentePorSlot.set(slotKey, new Map());
                const byDoc = docentePorSlot.get(slotKey);
                if (!byDoc.has(dk)) byDoc.set(dk, new Map());
                byDoc.get(dk).set(Number(c.cursoId) || sigla, sigla);
            }

            if (!cursosPorSlot.has(slotKey)) cursosPorSlot.set(slotKey, new Map());
            cursosPorSlot.get(slotKey).set(Number(c.cursoId) || sigla, sigla);
        }
    }

    if (sinBloquesSiglas.length) {
        lineas.push(`Materias sin ningún bloque de horario: ${unirSiglas(sinBloquesSiglas)}.`);
    }
    if (sinDocSiglas.length) {
        lineas.push(`Materias sin docente asignado: ${unirSiglas(sinDocSiglas)}.`);
    }
    if (sinAulaSiglas.length) {
        lineas.push(`Bloques sin aula asignada (por materia): ${unirSiglas(sinAulaSiglas)}.`);
    }

    const solapeLineas = [];
    for (const [slotKey, curMap] of cursosPorSlot) {
        if (curMap.size < 2) continue;
        let docenteComun = null;
        let todosConMismoDocenteAsignado = true;
        for (const mapKey of curMap.keys()) {
            const cur = list.find((c) => {
                const id = Number(c.cursoId);
                if (Number.isFinite(id) && id > 0 && Number(mapKey) === id) return true;
                return siglaCurso(c) === String(mapKey);
            });
            const dk = docenteClave(cur?.docente, cur?.docenteId);
            if (!dk) {
                todosConMismoDocenteAsignado = false;
                break;
            }
            if (docenteComun == null) docenteComun = dk;
            else if (docenteComun !== dk) {
                todosConMismoDocenteAsignado = false;
                break;
            }
        }
        if (todosConMismoDocenteAsignado && docenteComun) {
            continue;
        }
        const [dia, startStr] = slotKey.split('-');
        const start = Number(startStr);
        const hi = Number.isFinite(start)
            ? `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
            : '??:??';
        const diaEt = DIA_LABELS[dia] || dia;
        const siglas = [...curMap.values()];
        solapeLineas.push(`Solape en ${diaEt} ${hi}: ${unirSiglas(siglas, 8)}.`);
    }
    solapeLineas.sort((a, b) => a.localeCompare(b, 'es'));
    if (solapeLineas.length > maxSolape) {
        lineas.push(...solapeLineas.slice(0, maxSolape));
        lineas.push(`…y ${solapeLineas.length - maxSolape} solape(s) adicional(es) en el paralelo.`);
    } else {
        lineas.push(...solapeLineas);
    }

    const choqueLineas = [];
    for (const [slotKey, byDoc] of docentePorSlot) {
        for (const [dk, curMap] of byDoc) {
            if (curMap.size < 2) continue;
            const [dia, startStr] = slotKey.split('-');
            const start = Number(startStr);
            const hi = Number.isFinite(start)
                ? `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
                : '??:??';
            const diaEt = DIA_LABELS[dia] || dia;
            const siglas = [...curMap.values()].sort((a, b) => a.localeCompare(b, 'es'));
            const muestra = siglas.slice(0, 4).join(', ');
            const extra = siglas.length > 4 ? ` (+${siglas.length - 4} más)` : '';
            const docLabel = (() => {
                for (const c of list) {
                    if (docenteClave(c.docente, c.docenteId) !== dk) continue;
                    return docenteEtiqueta(c.docente, c.docenteId);
                }
                return 'Docente';
            })();
            let bloqueEjemplo = null;
            for (const mapKey of curMap.keys()) {
                const cur = list.find((c) => {
                    const id = Number(c.cursoId);
                    if (Number.isFinite(id) && id > 0 && Number(mapKey) === id) return true;
                    return siglaCurso(c) === String(mapKey);
                });
                const bloq = (cur?.bloques || []).find((b) => {
                    const d = normalizeDiaDb(b?.dia);
                    const sm = horaToMinutes(b?.horaInicio);
                    return d === dia && sm === start;
                });
                if (bloq) {
                    bloqueEjemplo = bloq;
                    break;
                }
            }
            const rango =
                bloqueEjemplo && (bloqueEjemplo.horaInicio || bloqueEjemplo.horaFin)
                    ? `${fmtHoraCorta(bloqueEjemplo.horaInicio)}–${fmtHoraCorta(bloqueEjemplo.horaFin)}`
                    : hi;
            choqueLineas.push(
                `Choque de docente (${docLabel}) en ${diaEt} ${rango}: ${muestra}${extra}.`,
            );
        }
    }
    choqueLineas.sort((a, b) => a.localeCompare(b, 'es'));
    if (choqueLineas.length > maxChoque) {
        lineas.push(...choqueLineas.slice(0, maxChoque));
        lineas.push(`…y ${choqueLineas.length - maxChoque} choque(s) docente adicional(es).`);
    } else {
        lineas.push(...choqueLineas);
    }

    return lineas;
}

const COBERTURA_LINE_PATTERNS = [
    /bloques insuficientes/i,
    /más bloques de los requeridos/i,
    /Materias sin ningún bloque/i,
    /sin bloques de horario/i,
    /cobertura horaria/i,
    /cobertura insuficiente/i,
];

function stripCoberturaRelatedLines(lineas) {
    return (lineas || []).filter((l) => !COBERTURA_LINE_PATTERNS.some((p) => p.test(String(l))));
}

/**
 * Una línea por tipo de desajuste de cobertura (insuficiente / exceso), sin duplicar dashboard vs plan local.
 * @param {unknown[]} courseSchedules
 * @param {Record<string, unknown>|null|undefined} paraleloDashboard
 * @param {string[]} [baseLineas]
 */
export function appendCoberturaPlanPendientesLineas(courseSchedules, paraleloDashboard, baseLineas = []) {
    const lineas = stripCoberturaRelatedLines(baseLineas);
    const insufParcial = [];
    const exceso = [];
    const sinBloques = [];

    for (const c of Array.isArray(courseSchedules) ? courseSchedules : []) {
        const horasPlan = resolveHorasPlanSemanalCurso(c);
        const bloques = Array.isArray(c.bloques) ? c.bloques : [];
        const sigla = siglaCurso(c);
        if (!bloques.length) {
            sinBloques.push(sigla);
            continue;
        }
        if (!horasPlan || horasPlan <= 0) continue;
        if (bloques.length < horasPlan) insufParcial.push(sigla);
        else if (bloques.length > horasPlan) exceso.push(sigla);
    }

    const dash = paraleloDashboard || {};
    const coberturaInc = Number(dash.ofertasCoberturaIncompleta) || 0;
    const excesoCount = exceso.length;
    const insufSiglas = [...new Set([...sinBloques, ...insufParcial])];
    const insufFromDash = coberturaInc > 0 ? Math.max(0, coberturaInc - excesoCount) : 0;
    const insufCount = Math.max(insufFromDash, insufSiglas.length);

    if (insufCount > 0) {
        const siglasTxt = insufSiglas.length ? `: ${unirSiglas(insufSiglas)}` : '';
        lineas.push(
            `${insufCount} materia(s) con bloques insuficientes para cubrir las horas semanales del plan${siglasTxt}.`,
        );
    }

    if (excesoCount > 0) {
        lineas.push(
            `${excesoCount} materia(s) con más bloques de los requeridos por el plan: ${unirSiglas(exceso)}.`,
        );
    }

    return lineas;
}

/**
 * Añade líneas a partir de métricas del dashboard de paralelos (vista SQL / API).
 * @param {string[]} base
 * @param {Record<string, unknown>|null|undefined} paraleloDashboardRow — fila con cursosTotales, cursosCreados, cursosSinBloquesHorario, conflictosAula, etc.
 */
export function appendParaleloDashboardPendientesLineas(base, paraleloDashboardRow) {
    const out = [...(base || [])];
    const st = paraleloDashboardRow || {};
    const cursosTotales = Number(st.cursosTotales) || 0;
    const cursosCreados = Number(st.cursosCreados) || 0;
    const faltaCursos = Math.max(0, cursosTotales - cursosCreados);
    if (faltaCursos > 0) {
        out.unshift(`Faltan ${faltaCursos} curso(s) del plan por crear en el paralelo.`);
    }
    const aulaCruce = Number(st.conflictosAula) || 0;
    if (aulaCruce > 0) {
        out.push(
            `Conflicto de aula con otro paralelo/curso (misma aula y franja): ${aulaCruce} caso(s) reportado(s) en el sistema.`,
        );
    }
    return out;
}
