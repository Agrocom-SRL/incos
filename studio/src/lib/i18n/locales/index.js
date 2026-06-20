/** Registro de idiomas disponibles. Añadir un idioma = una entrada aquí. */
import { es } from './es';
import { en } from './en';

export const dictionaries = { es, en };

export const availableLocales = Object.keys(dictionaries);

export default dictionaries;
