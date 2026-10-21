/** Columnas 2× desde tablet; ancho completo si span 24 */
export const cfgFormColProps = (span = 12) => {
  if (!span || span >= 24) {
    return { xs: 24 };
  }
  return { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12 };
};
