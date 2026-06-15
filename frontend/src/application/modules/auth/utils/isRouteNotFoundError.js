import { isRouteErrorResponse } from 'react-router-dom';

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isRouteNotFoundError(error) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return true;
  }
  return error instanceof Error && /not found/i.test(error.message);
}
