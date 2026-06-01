/**
 * Selección visual de carrera (imagen + color institucional).
 */

import { Radio, Spin, Empty, Alert } from 'antd';
import { buildCarreraImageUrl } from '@application-configuracion/academico/utils/buildCarreraImageUrl';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const ParaleloCarreraPicker = ({
  carreras = [],
  loading = false,
  error = null,
  value,
  onChange: onChangeProp,
  disabled = false,
}) => {
  const selectedValue = value != null && value !== '' ? Number(value) : null;

  if (error) {
    return <Alert type="error" showIcon message={error} />;
  }

  if (loading) {
    return (
      <div className="cfg-paralelo-picker-loading">
        <Spin tip="Cargando carreras…">
          <div className="cfg-paralelo-picker-loading__nest" aria-hidden />
        </Spin>
      </div>
    );
  }

  if (!carreras.length) {
    return <Empty description="No hay carreras disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <Radio.Group
      className="cfg-paralelo-carrera-picker"
      value={selectedValue ?? undefined}
      onChange={(e) => onChangeProp?.(e.target.value)}
      disabled={disabled}
    >
      <div className="cfg-paralelo-carrera-picker__grid">
        {carreras.map((carrera) => {
          const isSelected = Number(selectedValue) === Number(carrera.id);
          const colorHex = sanitizeDocenteColorHex(carrera.colorHex || carrera.color_hex) || undefined;
          const accent = colorHex || 'var(--ant-color-primary, #22854f)';
          const imagenUrl = buildCarreraImageUrl(
            carrera.imagenRuta || carrera.imagen_ruta || carrera.image,
          );
          const hasImage = Boolean(imagenUrl);
          const nombre = carrera.nombre || carrera.name;
          const codigo = carrera.codigo;

          return (
            <Radio.Button
              key={carrera.id}
              value={carrera.id}
              className={`cfg-paralelo-carrera-picker__card${isSelected ? ' cfg-paralelo-carrera-picker__card--selected' : ''}`}
              style={{
                borderColor: isSelected ? accent : undefined,
                boxShadow: isSelected ? `0 4px 16px color-mix(in srgb, ${accent} 35%, transparent)` : undefined,
              }}
            >
              <div
                className="cfg-paralelo-carrera-picker__media"
                style={{
                  backgroundColor: hasImage ? undefined : `color-mix(in srgb, ${accent} 18%, transparent)`,
                }}
              >
                {hasImage ? (
                  <>
                    <img
                      src={imagenUrl}
                      alt={nombre || 'Carrera'}
                      className="cfg-paralelo-carrera-picker__img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="cfg-paralelo-carrera-picker__overlay">
                      {codigo ? <span className="cfg-paralelo-carrera-picker__codigo">{codigo}</span> : null}
                      {nombre ? <span className="cfg-paralelo-carrera-picker__nombre">{nombre}</span> : null}
                    </div>
                  </>
                ) : (
                  <div className="cfg-paralelo-carrera-picker__fallback">
                    <span className="cfg-paralelo-carrera-picker__initial" style={{ color: accent }}>
                      {codigo?.charAt(0) || '?'}
                    </span>
                    {nombre ? <span className="cfg-paralelo-carrera-picker__nombre">{nombre}</span> : null}
                  </div>
                )}
              </div>
            </Radio.Button>
          );
        })}
      </div>
    </Radio.Group>
  );
};

export default ParaleloCarreraPicker;
