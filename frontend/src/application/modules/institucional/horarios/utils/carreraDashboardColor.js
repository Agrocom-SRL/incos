/** Colores por carrera — alineados con `10-seed-carreras.sql` si el API no envía `color_hex`. */
const BY_ID = {
    1: '#FF5733',
    2: '#3498DB',
    3: '#27AE60',
};

const BY_NAME_KEY = {
    'sistemas informaticos': '#FF5733',
    'administracion de empresas': '#3498DB',
    'contaduria general': '#27AE60',
};

const normalizeNombreKey = (nombre) =>
    String(nombre || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

function normalizeHex(hex) {
    const s = String(hex || '').trim();
    if (!s) return null;
    const body = s.startsWith('#') ? s.slice(1) : s;
    if (!/^[0-9A-Fa-f]{6}$/.test(body)) return null;
    return `#${body}`;
}

function hexToRgb(hex) {
    const h = normalizeHex(hex);
    if (!h) return null;
    const n = h.slice(1);
    return {
        r: parseInt(n.slice(0, 2), 16),
        g: parseInt(n.slice(2, 4), 16),
        b: parseInt(n.slice(4, 6), 16),
    };
}

/** Resuelve el color institucional de la carrera para UI (cabeceras de tabla agrupada, etc.). */
export function resolveCarreraDashboardColor({ carreraId, carreraNombre, carreraColorHex }) {
    const fromApi = normalizeHex(carreraColorHex);
    if (fromApi) return fromApi;
    const id = carreraId != null ? Number(carreraId) : NaN;
    if (!Number.isNaN(id) && BY_ID[id]) return BY_ID[id];
    const k = normalizeNombreKey(carreraNombre);
    return BY_NAME_KEY[k] || null;
}

/** Estilo de superficie para cabecera de grupo (tinte + borde sin perder contraste del texto). */
export function buildCarreraHeadingSurfaceStyle(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return {};
    const { r, g, b } = rgb;
    return {
        borderLeft: `4px solid ${normalizeHex(hex)}`,
        background: `linear-gradient(90deg, rgba(${r},${g},${b},0.26) 0%, rgba(${r},${g},${b},0.1) 42%, var(--ant-color-fill-secondary, #f5f5f5) 100%)`,
        borderColor: `rgba(${r},${g},${b},0.42)`,
    };
}
