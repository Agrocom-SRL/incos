/**
 * Cabecera del curso — mismo patrón visual que sd-profile (detalle estudiante).
 */

import { BookOutlined } from '@ant-design/icons';

const CursoProfileHeader = ({
  materia,
  subtitulo,
  carreraColor = '#196b45',
  stats = [],
  pill,
}) => {
  const iniciales = (materia ?? 'CU')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="sd-profile cal-curso-profile">
      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div
            className="sd-profile__avatar sd-profile__avatar--default cal-curso-profile__avatar"
            style={{ backgroundColor: carreraColor }}
          >
            {iniciales || <BookOutlined aria-hidden />}
          </div>
          <span className="sd-profile__status-dot" aria-hidden />
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{materia ?? '—'}</h1>
          <div className="sd-profile__meta">
            {subtitulo ? (
              <p className="sd-profile__sub">
                <BookOutlined aria-hidden />
                {subtitulo}
              </p>
            ) : null}
            {pill ? (
              <span className="sd-profile__admission-pill sd-profile__admission-pill--default">
                {pill}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {stats.length ? (
        <>
          <div className="sd-profile__divider" />
          <div className="sd-profile__stats">
            {stats.map(({ label, value }) => (
              <div key={label} className="sd-stat">
                <span className="sd-stat__label">{label}</span>
                <span className="sd-stat__value sd-stat__value--primary">{value ?? '—'}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CursoProfileHeader;
