/**
 * Tabs de bimestres con bloqueo secuencial.
 */

import { LockOutlined, UnlockOutlined } from '@ant-design/icons';

const BIMESTRES = [1, 2, 3, 4];

const BimestreTabs = ({ bimestres = [], bimestreActivo, onChange }) => {
  const getEstado = (num) => {
    const meta = bimestres.find((b) => b.numero === num);
    if (meta?.estado === 'bloqueado') return 'futuro';
    if (meta?.estado === 'vigente') return 'vigente';
    if (meta?.estado === 'cerrado') return 'anterior';
    return 'anterior';
  };

  return (
    <div className="cal-bimestre-tabs" role="tablist" aria-label="Bimestres">
      <div className="cal-bimestre-tabs__track">
        {BIMESTRES.map((num) => {
          const estado = getEstado(num);
          const activo = bimestreActivo === num;
          const bloqueado = estado === 'futuro';
          const Icon = estado === 'futuro' ? LockOutlined : UnlockOutlined;

          return (
            <button
              key={num}
              type="button"
              role="tab"
              aria-selected={activo}
              aria-current={activo ? 'true' : undefined}
              aria-disabled={bloqueado}
              disabled={bloqueado}
              className={[
                'cal-bimestre-tabs__tab',
                `cal-bimestre-tabs__tab--${estado}`,
                activo ? 'cal-bimestre-tabs__tab--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => !bloqueado && onChange(num)}
            >
              <Icon className="cal-bimestre-tabs__icon" aria-hidden />
              <span className="cal-bimestre-tabs__label">Bimestre {num}</span>
              {estado === 'vigente' ? (
                <span className="cal-bimestre-tabs__vigente">vigente</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="cal-bimestre-tabs__rule" aria-hidden />
    </div>
  );
};

export default BimestreTabs;
