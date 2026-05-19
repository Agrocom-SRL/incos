// Mock data for INCOS matriculados prototype
const CAREERS = [
    { id: "cont", name: "Contaduría General", short: "CG", color: "#0d6e3d" },
    { id: "sist", name: "Sistemas Informáticos", short: "SI", color: "#1d4e89" },
    { id: "admin", name: "Administración de Empresas", short: "AE", color: "#7a4cb8" },
    { id: "mark", name: "Marketing y Publicidad", short: "MP", color: "#c7522a" },
    { id: "secr", name: "Secretariado Ejecutivo", short: "SE", color: "#0a8a96" },
    { id: "elec", name: "Electrónica Industrial", short: "EI", color: "#a16207" },
];

const FIRST_NAMES = [
    "Mariana", "Dayana", "Yan Carla", "Jose Gabriel", "Grecia Andrea",
    "Roger", "Luis Fernando", "Camila", "Diego Andrés", "Valeria",
    "Sebastián", "Andrea Sofía", "Mauricio", "Lucía", "Ronaldo",
    "Daniela", "Carlos Eduardo", "Paola", "Joaquín", "Ximena",
    "Marco Antonio", "Fernanda", "Bryan", "Alejandra", "Iván",
    "Karen", "Rodrigo", "Génesis", "Pablo", "Noelia",
];

const LAST_NAMES = [
    "Nicasio Masay", "Montenegro Montenegro", "Mendez Siani", "Arce Quiñones",
    "Aguilera Nolvany", "Avendaño Rojas", "Suárez Vargas", "Rivero Justiniano",
    "Banegas Roca", "Cuéllar Pinto", "Ortiz Mamani", "Flores Choque",
    "Gutiérrez Salazar", "Vaca Diez", "Peña Aguilar", "Saucedo Méndez",
    "Justiniano Aramayo", "Calderón Rivas", "Salvatierra Chávez", "Morales Vega",
    "Roca Soliz", "Egüez Antelo", "Limpias Ruiz", "Coímbra Egúez",
    "Tapia Cortés", "Becerra López", "Quispe Mamani", "Arteaga Roca",
    "Velasco Cuéllar", "Hurtado Saavedra",
];

const HISTORY_STATES = [
    { key: "pendiente", label: "Historial pendiente", color: "warning" },
    { key: "completo", label: "Historial completo", color: "success" },
    { key: "observado", label: "Observado", color: "error" },
    { key: "revision", label: "En revisión", color: "processing" },
];

function seedRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function generateMatriculados(count = 48) {
    const rand = seedRandom(42);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const out = [];
    for (let i = 0; i < count; i++) {
        const firstName = pick(FIRST_NAMES);
        const lastName = pick(LAST_NAMES);
        const career = pick(CAREERS);
        const isAntiguo = rand() > 0.35;
        const historyIdx = isAntiguo
            ? Math.floor(rand() * 4)
            : Math.floor(rand() * 2) + 1; // newcomers more likely complete
        const day = String(Math.floor(rand() * 14) + 1).padStart(2, "0");
        const month = String(Math.floor(rand() * 5) + 1).padStart(2, "0");
        const materias = Math.floor(rand() * 4) + 5;
        const semester = isAntiguo ? Math.floor(rand() * 5) + 2 : 1;
        const code = `2025${String(58 - i).padStart(4, "0")}`;
        const ci = String(Math.floor(rand() * 90000000) + 1000000);
        out.push({
            key: i,
            code,
            ci,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.toUpperCase(),
            career,
            isAntiguo,
            tipo: isAntiguo ? "ANTIGUO" : "NUEVO",
            historyState: HISTORY_STATES[historyIdx],
            gestion: 2026,
            fecha: `${day}/${month}/2026`,
            materias,
            semester,
            avgGrade: (rand() * 30 + 60).toFixed(1),
            pago: isAntiguo ? pick(["Al día", "Al día", "Al día", "Pendiente"]) : "Inicial",
        });
    }
    return out;
}

const MATRICULADOS = generateMatriculados(48);

// Initials + color for avatar
function avatarFor(name) {
    const parts = name.trim().split(/\s+/);
    const initials = (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
    // hash to pick a color
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    const palette = [
        "#0d6e3d", "#157347", "#1d4e89", "#7a4cb8", "#c7522a",
        "#0a8a96", "#a16207", "#b91c1c", "#0369a1", "#4d7c0f",
    ];
    return { initials: initials.toUpperCase(), color: palette[h % palette.length] };
}

window.INCOS_DATA = { CAREERS, MATRICULADOS, HISTORY_STATES, avatarFor };
