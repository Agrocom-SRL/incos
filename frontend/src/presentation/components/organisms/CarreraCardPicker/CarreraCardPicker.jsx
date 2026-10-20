/**
 * CarreraCardPicker — selección visual de carrera (imagen + color institucional).
 *
 * Organismo COMPARTIDO del design system (Atomic Design: organisms), promovido
 * desde `configuracion/recursos` (ParaleloCarreraPicker, que hoy es un wrapper
 * delgado de este componente — patrón páginas gemelas). Lo consumen los ABM de
 * paralelos/planes, el registro de estudiantes y el paso «Carrera y plan» del
 * wizard de matrícula.
 *
 * Estilos: `styles/components/organisms/carrera-card-picker.css` (clases
 * `carrera-card-picker__*`, tokens del tema). El color de carrera es color de
 * negocio dinámico y pasa por `sanitizeDocenteColorHex` (única excepción inline
 * permitida por incos-ui-system §1).
 *
 * @param {Array}    carreras     - Catálogo de carreras (id, nombre, codigo, colorHex, imagenRuta)
 * @param {number}   value        - ID de la carrera seleccionada
 * @param {Function} onChange     - (carreraId) => void
 * @param {Array<number>} disabledIds - Carreras no seleccionables (overlay «No disponible»)
 * @param {boolean}  readOnly     - Sin interacción (la selección actual se conserva visible)
 * @param {boolean}  loading      - Estado de carga (Spin nest)
 * @param {string}   error        - Mensaje de error (Alert)
 * @param {boolean}  disabled     - Deshabilita todo el grupo (compatibilidad Form)
 */

import { Radio, Spin, Empty, Alert } from 'antd';
import { buildCarreraImageUrl } from '@application-configuracion/academico/utils/buildCarreraImageUrl';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const CarreraCardPicker = ({
  carreras = [],
  value,
  onChange: onChangeProp,
  disabledIds = null,
  readOnly = false,
  loading = false,
  error = null,
  disabled = false,
}) => {
  const selectedValue = value != null && value !== '' ? Number(value) : null;

  if (error) {
    return <Alert type="error" showIcon title={error} />;
  }

  if (loading) {
    return (
      <div className="carrera-card-picker__loading">
        <Spin tip="Cargando carreras…">
          <div className="carrera-card-picker__loading-nest" aria-hidden />
        </Spin>
      </div>
    );
  }

  if (!carreras.length) {
    return <Empty description="No hay carreras disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const groupClassName = `carrera-card-picker${readOnly ? ' carrera-card-picker--readonly' : ''}`;

  return (
    <Radio.Group
      className={groupClassName}
      value={selectedValue ?? undefined}
      onChange={(e) => {
        if (!readOnly) onChangeProp?.(e.target.value);
      }}
      disabled={disabled}
    >
      <div className="carrera-card-picker__grid">
        {carreras.map((carrera) => {
          const isSelected = Number(selectedValue) === Number(carrera.id);
          const isUnavailable =
            Array.isArray(disabledIds) &&
            disabledIds.some((id) => Number(id) === Number(carrera.id));
          const colorHex = sanitizeDocenteColorHex(carrera.colorHex || carrera.color_hex) || undefined;
          const accent = colorHex || 'var(--color-primary)';
          const imagenUrl = buildCarreraImageUrl(
            carrera.imagenRuta || carrera.imagen_ruta || carrera.image,
          );
          const hasImage = Boolean(imagenUrl);
          const nombre = carrera.nombre || carrera.name;
          const codigo = carrera.codigo;

          const cardClassName = [
            'carrera-card-picker__card',
            isSelected ? 'carrera-card-picker__card--selected' : '',
            isUnavailable ? 'carrera-card-picker__card--unavailable' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <Radio.Button
              key={carrera.id}
              value={carrera.id}
              disabled={isUnavailable}
              className={cardClassName}
              style={{
                borderColor: isSelected ? accent : undefined,
                boxShadow: isSelected
                  ? `0 4px 16px color-mix(in srgb, ${accent} 35%, transparent)`
                  : undefined,
              }}
            >
              <div
                className="carrera-card-picker__media"
                style={{
                  backgroundColor: hasImage
                    ? undefined
                    : `color-mix(in srgb, ${accent} 18%, transparent)`,
                }}
              >
                {hasImage ? (
                  <>
                    <img
                      src={imagenUrl}
                      alt={nombre || 'Carrera'}
                      className="carrera-card-picker__img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="carrera-card-picker__overlay">
                      {codigo ? <span className="carrera-card-picker__codigo">{codigo}</span> : null}
                      {nombre ? <span className="carrera-card-picker__nombre">{nombre}</span> : null}
                    </div>
                  </>
                ) : (
                  <div className="carrera-card-picker__fallback">
                    <span className="carrera-card-picker__initial" style={{ color: accent }}>
                      {codigo?.charAt(0) || '?'}
                    </span>
                    {nombre ? <span className="carrera-card-picker__nombre">{nombre}</span> : null}
                  </div>
                )}
                {isUnavailable ? (
                  <div className="carrera-card-picker__unavailable-overlay" aria-hidden={false}>
                    <span className="carrera-card-picker__unavailable-label">No disponible</span>
                  </div>
                ) : null}
              </div>
            </Radio.Button>
          );
        })}
      </div>
    </Radio.Group>
  );
};

export default CarreraCardPicker;
