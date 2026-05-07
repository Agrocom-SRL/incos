export const normalizeArmadoTab = (raw) => {
    if (raw === 'cursos' || raw === 'gestion' || raw === 'plan' || raw === 'vista') return raw;
    if (raw === 'horarios' || raw === 'conflicto') return 'plan';
    return 'plan';
};
