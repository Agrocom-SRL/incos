/**
 * Organismo: cabecera de ficha (sd-profile) — avatar, título, meta, stats y acciones.
 */

import { Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const DetailProfileCard = ({
  avatarInitials,
  avatarClassName = 'sd-profile__avatar',
  avatarStyle,
  active = true,
  title,
  subtitle,
  metaExtra,
  onEdit,
  editTooltip = 'Editar',
  editAriaLabel = 'Editar',
  showEdit = false,
  stats = [],
  actions,
}) => (
  <section className="sd-profile">
    {showEdit && onEdit ? (
      <button
        type="button"
        className="sd-profile__edit-btn"
        onClick={onEdit}
        title={editTooltip}
        aria-label={editAriaLabel}
      >
        <EditOutlined />
      </button>
    ) : null}

    <Flex className="sd-profile__identity" align="flex-start" gap={16}>
      <div className="sd-profile__avatar-wrap">
        <div className={avatarClassName} style={avatarStyle} aria-hidden>
          {avatarInitials}
        </div>
        <span
          className={`sd-profile__status-dot${active ? '' : ' sd-profile__status-dot--inactive'}`}
        />
      </div>
      <div className="sd-profile__name-block">
        <h1 className="sd-profile__name">{title}</h1>
        {(subtitle || metaExtra) && (
          <Flex className="sd-profile__meta" align="center" wrap="wrap" gap={8}>
            {subtitle ? <p className="sd-profile__sub">{subtitle}</p> : null}
            {metaExtra}
          </Flex>
        )}
      </div>
    </Flex>

    {stats?.length > 0 ? (
      <>
        <div className="sd-profile__divider" />
        <Flex className="sd-profile__stats" gap={32} wrap="wrap">
          {stats.map((stat) => (
            <div className="sd-stat" key={stat.label}>
              <span className="sd-stat__label">{stat.label}</span>
              <span
                className={
                  stat.primary
                    ? 'sd-stat__value sd-stat__value--primary'
                    : 'sd-stat__value'
                }
              >
                {stat.value ?? '—'}
              </span>
            </div>
          ))}
        </Flex>
      </>
    ) : null}

    {actions ? (
      <>
        <div className="sd-profile__divider" />
        <Flex className="sd-profile__actions" gap={8} wrap="wrap">
          {actions}
        </Flex>
      </>
    ) : null}
  </section>
);

export default DetailProfileCard;
