export const normalizeArmadoTab = (raw) => {
    if (raw === 'gestion') return 'plan';
    if (raw === 'cursos') return 'cobertura';
    if (raw === 'cobertura' || raw === 'plan' || raw === 'vista') return raw;
    if (raw === 'horarios' || raw === 'conflicto') return 'plan';
    return 'plan';
};
