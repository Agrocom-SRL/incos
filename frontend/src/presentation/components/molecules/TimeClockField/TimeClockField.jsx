/**
 * Molécula: selector de hora con reloj analógico (popup estilo Material Design, AM/PM).
 *
 * Control compatible con `Form.Item` de Ant Design (`value` dayjs | null, `onChange(dayjs|null)`).
 * Usa `DesktopTimePicker` de MUI X solo para este widget (el sistema sigue siendo Ant Design):
 * el reloj se abre en un popup anclado al campo, con el diseño del selector Material: cabecera
 * compacta con la hora y AM/PM apilados (la unidad activa, horas o minutos, va resaltada), esfera
 * redonda y número elegido en círculo. Colores, radios, bordes y tipografía salen de
 * `allThemeTokens` para verse como el resto de la página.
 *
 * IMPORTANTE: no se exporta desde `molecules/index.js` a propósito. MUI es pesado: los consumidores
 * lo importan con `React.lazy(() => import('.../TimeClockField'))` para que no entre al bundle
 * principal (ver `HorarioFormFields`).
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import 'dayjs/locale/es';
import { allThemeTokens as t } from '@theme/tokens';

const VISTAS = ['hours', 'minutes'];
const VISTAS_RELOJ = { hours: renderTimeViewClock, minutes: renderTimeViewClock };
const TEXTOS = {
  okButtonLabel: 'Aceptar',
  cancelButtonLabel: 'Cerrar',
  timePickerToolbarTitle: 'Seleccionar hora',
  hoursClockNumberText: (horas) => `${horas} horas`,
  minutesClockNumberText: (minutos) => `${minutos} minutos`,
};
const BLANCO = '#ffffff';
const BLANCO_APAGADO = 'rgba(255, 255, 255, 0.65)';

/** Tema de MUI derivado de los tokens del sistema; no cambia en runtime. */
const TEMA = createTheme({
  palette: { primary: { main: t.colorPrimary, dark: t.colorPrimaryHover } },
  typography: { fontFamily: t.fontFamily },
  shape: { borderRadius: t.borderRadius },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
});

/** Campo con el aspecto exacto de los inputs de Ant Design del sistema (borde suave, radio, foco verde). */
const SX_CAMPO = {
  '& .MuiPickersOutlinedInput-root': {
    borderRadius: `${t.borderRadius}px`,
    backgroundColor: t.colorBgContainer,
    fontFamily: t.fontFamily,
    fontSize: `${t.fontSize}px`,
    color: t.colorText,
    // Misma altura que Input/Select de Ant Design (controlHeight), no la del `size="small"` de MUI.
    minHeight: `${t.controlHeight}px`,
    height: `${t.controlHeight}px`,
    boxSizing: 'border-box',
    paddingRight: '11px',
  },
  '& .MuiPickersInputBase-sectionsContainer': { padding: '0 0 0 11px' },
  '& .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: t.colorBorder,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: `${t.borderRadius}px`,
    top: 0,
    padding: 0,
  },
  '& .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: t.colorPrimaryHover,
  },
  '& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: t.colorPrimary,
    borderWidth: '1px',
  },
  // El reset global de Ant Design da borde inferior a todo `legend`: aparecía como una línea
  // atravesando el texto del campo (el `legend` del contorno de MUI).
  // Se oculta del todo: sin etiqueta flotante no hace falta la muesca y dejaba el borde superior cortado.
  '& .MuiPickersOutlinedInput-notchedOutline legend': { display: 'none' },
  '& .MuiPickersInputBase-sectionsContainer, & .MuiPickersInputBase-input': {
    fontFamily: t.fontFamily,
  },
  '& .MuiPickersInputBase-input::placeholder': { color: t.colorTextPlaceholder, opacity: 1 },
  // Ícono de reloj como el sufijo de los campos de Ant Design: gris, sin botón circular.
  '& .MuiIconButton-root': {
    color: t.colorTextSecondary,
    padding: '4px',
    '&:hover': { backgroundColor: 'transparent', color: t.colorPrimary },
  },
  '& .MuiSvgIcon-root': { fontSize: '1.15rem' },
};

/**
 * Popup al estilo Material (selector de hora MD2): cabecera compacta con la hora grande y AM/PM
 * apilados a su lado, esfera redonda gris, número elegido en círculo con su línea desde el centro.
 */
const SX_POPUP = {
  borderRadius: `${t.borderRadiusLG}px`,
  overflow: 'hidden',
  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.18)',
  '& *': { fontFamily: t.fontFamily },
  // Cabecera
  '& .MuiPickersToolbar-root': {
    backgroundColor: t.colorPrimary,
    padding: '14px 20px 16px',
  },
  '& .MuiPickersToolbar-title': {
    color: BLANCO_APAGADO,
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: 0,
    textTransform: 'none',
    marginBottom: '2px',
  },
  '& .MuiPickersToolbar-content': { justifyContent: 'center', alignItems: 'center' },
  '& .MuiTimePickerToolbar-hourMinuteLabel': { alignItems: 'center' },
  '& .MuiPickersToolbarText-root': {
    color: BLANCO_APAGADO,
    fontWeight: 500,
    cursor: 'pointer',
  },
  '& .MuiPickersToolbarText-root.Mui-selected': { color: BLANCO },
  '& .MuiTypography-h3': { fontSize: '3rem', lineHeight: 1.1, fontWeight: 500 },
  '& .MuiTimePickerToolbar-separator': { color: BLANCO_APAGADO, margin: '0 2px' },
  '& .MuiTimePickerToolbar-ampmSelection': {
    marginLeft: '14px',
    marginRight: 0,
    justifyContent: 'center',
    gap: '4px',
  },
  '& .MuiTimePickerToolbar-ampmLabel': { fontSize: '0.95rem', lineHeight: 1.2 },
  // Esfera: círculo gris (no el cuadrado contenedor), manecilla fina y número elegido en círculo.
  '& .MuiClock-clock': { backgroundColor: '#f0f0f0' },
  '& .MuiClock-pin': { backgroundColor: t.colorPrimary },
  '& .MuiClockPointer-root': { backgroundColor: t.colorPrimary, width: '2px' },
  '& .MuiClockPointer-thumb': {
    backgroundColor: t.colorPrimary,
    borderColor: t.colorPrimary,
  },
  '& .MuiClockNumber-root': { fontSize: '0.9rem', fontWeight: 500, color: t.colorText },
  '& .MuiClockNumber-root.Mui-selected': { color: BLANCO, fontWeight: 600 },
  // Sin flechas laterales: se cambia de horas a minutos tocando la hora o los minutos de la cabecera.
  '& .MuiTimeClock-arrowSwitcher': { display: 'none' },
  '& .MuiDialogActions-root': { padding: '4px 12px 12px' },
};

const TimeClockField = ({
  value = null,
  onChange,
  disabled = false,
  placeholder = 'hh:mm aa',
  minutesStep = 5,
  id,
}) => (
  <ThemeProvider theme={TEMA}>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <DesktopTimePicker
        value={value}
        onChange={(nuevo) => onChange?.(nuevo && nuevo.isValid() ? nuevo : null)}
        disabled={disabled}
        ampm
        ampmInClock={false}
        views={VISTAS}
        viewRenderers={VISTAS_RELOJ}
        minutesStep={minutesStep}
        localeText={TEXTOS}
        slotProps={{
          textField: { id, fullWidth: true, placeholder, sx: SX_CAMPO },
          toolbar: { hidden: false },
          desktopPaper: { sx: SX_POPUP },
          actionBar: { actions: ['cancel', 'accept'] },
        }}
      />
    </LocalizationProvider>
  </ThemeProvider>
);

export default TimeClockField;
