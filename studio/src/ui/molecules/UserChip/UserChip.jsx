/**
 * UserChip — identidad del usuario en el topbar (nombre + meta + avatar).
 * Molécula: compone Avatar + textos; datos por props (DIP).
 */
import { Avatar } from '@ui/atoms/Avatar/Avatar';

export function UserChip({ name, meta }) {
  return (
    <div className="ds-user-chip">
      <div className="ds-user-chip__text">
        <div className="ds-user-chip__name" title={name}>
          {name}
        </div>
        {meta ? <div className="ds-user-chip__meta">{meta}</div> : null}
      </div>
      <Avatar name={name} size={36} />
    </div>
  );
}

export default UserChip;
