import { typography } from '@theme/tokens';

/**
 * Props compartidos para Tooltip del módulo dashboard (Ant Design 6: `styles.container` sustituye a overlayInnerStyle).
 * Más padding, tipografía más legible y separación respecto al disparador.
 */
export const dashboardTooltipProps = {
    mouseEnterDelay: 0.22,
    mouseLeaveDelay: 0.08,
    styles: {
        container: {
            padding: '14px 18px',
            borderRadius: 10,
            maxWidth: 380,
            lineHeight: 1.5,
            fontSize: typography.fontSizeSM,
            fontWeight: typography.fontWeightStrong,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        },
    },
};
