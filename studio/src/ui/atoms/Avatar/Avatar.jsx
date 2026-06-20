/**
 * Avatar — círculo con iniciales. Átomo puro: deriva iniciales del nombre.
 * `tone` permite teñir con un color de marca/categoría.
 */
import { getInitials } from '@lib/text/getInitials';
import './Avatar.css';

export function Avatar({ name, size = 36, tone }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  if (tone) {
    style['--avatar-tone'] = tone;
  }
  return (
    <span className={`ds-avatar${tone ? ' ds-avatar--tone' : ''}`} style={style} aria-hidden>
      {getInitials(name)}
    </span>
  );
}

export default Avatar;
