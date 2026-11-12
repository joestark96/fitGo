import { ExerciseDefinition, MuscleGroup } from '../types';

export type ExerciseFocusFilter =
  | MuscleGroup
  | 'gluteos'
  | 'push'
  | 'pull'
  | 'tren_superior'
  | 'tren_inferior';

export const FOCUS_FILTER_LABELS: Record<ExerciseFocusFilter, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  piernas: 'Piernas',
  gluteos: 'Glúteos',
  hombros: 'Hombros',
  brazos: 'Brazos',
  core: 'Core / Abdomen',
  cardio: 'Cardio',
  push: 'Push (Empuje)',
  pull: 'Pull (Tirón)',
  tren_superior: 'Tren Superior',
  tren_inferior: 'Tren Inferior',
  cuerpo_completo: 'Cuerpo Completo',
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isRearDeltOrPullShoulder(ex: ExerciseDefinition, normName: string, normDesc: string): boolean {
  return (
    normName.includes('deltoide posterior') ||
    normDesc.includes('deltoide posterior') ||
    normName.includes('posterior') ||
    normName.includes('pajaro') ||
    normDesc.includes('pajaro') ||
    normName.includes('face pull') ||
    normName.includes('encogimiento') ||
    normName.includes('trapecio') ||
    normName.includes('remo al menton') ||
    ex.id.includes('pajaro') ||
    ex.id.includes('reverse-fly') ||
    ex.id.includes('face-pull') ||
    ex.id.includes('shrug')
  );
}

function isTricepsExercise(ex: ExerciseDefinition, normName: string, normDesc: string): boolean {
  return (
    normName.includes('tricep') ||
    normDesc.includes('tricep') ||
    normName.includes('fondo') ||
    normName.includes('press frances') ||
    normName.includes('rompecraneos') ||
    normName.includes('patada') ||
    normName.includes('copa') ||
    normName.includes('extension') ||
    ex.id.includes('tricep')
  );
}

export function isGlutesExercise(ex: ExerciseDefinition): boolean {
  if (ex.muscleGroup !== 'piernas' && ex.muscleGroup !== 'cuerpo_completo') {
    return false;
  }
  const normName = normalizeText(ex.name);
  const normDesc = normalizeText(ex.description || '');
  const gif = (ex.gifUrl || '').toLowerCase();

  return (
    gif.includes('/glutes/') ||
    normName.includes('glute') ||
    normDesc.includes('glute') ||
    normName.includes('hip thrust') ||
    normName.includes('empuje de cadera') ||
    normName.includes('abduccion') ||
    normName.includes('puente') ||
    normName.includes('bulgara') ||
    normName.includes('zancada') ||
    normName.includes('lunge') ||
    normName.includes('rumano') ||
    normName.includes('sumo') ||
    normName.includes('patada') ||
    normName.includes('step-up') ||
    normName.includes('step up') ||
    ex.id.includes('glute') ||
    ex.id.includes('hip-thrust')
  );
}

export function matchesExerciseFocus(
  ex: ExerciseDefinition,
  focus: ExerciseFocusFilter
): boolean {
  const normName = normalizeText(ex.name);
  const normDesc = normalizeText(ex.description || '');

  switch (focus) {
    case 'gluteos':
      return isGlutesExercise(ex);
    case 'tren_superior':
      return (
        ex.muscleGroup === 'pecho' ||
        ex.muscleGroup === 'espalda' ||
        ex.muscleGroup === 'hombros' ||
        ex.muscleGroup === 'brazos'
      );
    case 'tren_inferior':
      return ex.muscleGroup === 'piernas';
    case 'push':
      if (ex.muscleGroup === 'pecho') return true;
      if (ex.muscleGroup === 'hombros') {
        return !isRearDeltOrPullShoulder(ex, normName, normDesc);
      }
      if (ex.muscleGroup === 'brazos') {
        return isTricepsExercise(ex, normName, normDesc);
      }
      return false;
    case 'pull':
      if (ex.muscleGroup === 'espalda') return true;
      if (ex.muscleGroup === 'hombros') {
        return isRearDeltOrPullShoulder(ex, normName, normDesc);
      }
      if (ex.muscleGroup === 'brazos') {
        return !isTricepsExercise(ex, normName, normDesc);
      }
      return false;
    case 'espalda':
      return (
        ex.muscleGroup === 'espalda' ||
        (ex.muscleGroup === 'hombros' && isRearDeltOrPullShoulder(ex, normName, normDesc))
      );
    default:
      return ex.muscleGroup.toLowerCase() === focus.toLowerCase();
  }
}
