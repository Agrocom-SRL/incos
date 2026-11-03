import { describeControllers, controllersDir } from '../_helpers/describeControllers.js';

await describeControllers('estudiantes', controllersDir('estudiantes'));
