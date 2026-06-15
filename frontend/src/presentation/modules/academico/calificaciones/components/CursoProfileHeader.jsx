/**
 * Cabecera del curso — mismo patrón visual que sd-profile (detalle estudiante).
 */

import { BookOutlined, SettingOutlined } from '@ant-design/icons';

const CursoProfileHeader = ({
  materia,
  sigla,
  subtitulo,
  carreraColor = '#196b45',
  stats = [],
  pill,
  onAjustes,
  ajustesDisabled = false,
  acciones = null,
}) => {
  const avatarText = (sigla ?? '').trim().toUpperCase() || null;
  const usarSigla = Boolean(avatarText);
  const toolbarVisible = Boolean(onAjustes || acciones);

  return (
    <div className="sd-profile cal-curso-profile">
      {toolbarVisible ? (
        <div className="cal-curso-profile__toolbar">
          {acciones ? <div className="cal-curso-profile__acciones">{acciones}</div> : null}
          {onAjustes ? (
            <button
              type="button"
              className="sd-btn sd-btn--info cal-curso-profile__config-btn"
              onClick={onAjustes}
              disabled={ajustesDisabled}
              aria-label="Configuración del curso"
            >
              <SettingOutlined aria-hidden />
              Configuración
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div
            className={`sd-profile__avatar sd-profile__avatar--default cal-curso-profile__avatar${
              usarSigla ? ' cal-curso-profile__avatar--sigla' : ''
            }`}
            style={{ backgroundColor: carreraColor }}
          >
            {usarSigla ? avatarText : <BookOutlined aria-hidden />}
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
              <span className="sd-profile__admission-pill cal-curso-profile__bimestre-pill">
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
