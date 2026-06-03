export const normalizeArmadoTab = (raw) => {
    if (raw === 'gestion') return 'plan';
    if (raw === 'cursos' || raw === 'plan' || raw === 'vista') return raw;
    if (raw === 'horarios' || raw === 'conflicto') return 'plan';
    return 'plan';
};
