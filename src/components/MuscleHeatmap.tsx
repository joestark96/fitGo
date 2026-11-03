import React, { useState } from 'react';
import { MuscleGroup } from '../types';

interface MuscleHeatmapProps {
  muscleVolumes: Record<string, number>; // volume in kg or set count per muscle group
  timeframe?: string;
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ muscleVolumes, timeframe = 'Esta semana' }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Find max volume to normalize heat levels (0.0 to 1.0)
  const values = Object.values(muscleVolumes);
  const maxVal = Math.max(...values, 1);

  const getHeatColor = (group: string): string => {
    const val = muscleVolumes[group] || 0;
    if (val === 0) return '#242b38'; // Dark unworked slate
    const ratio = Math.min(val / maxVal, 1);
    if (ratio > 0.75) return '#3b82f6'; // Bright vibrant blue (Alta)
    if (ratio > 0.45) return '#2563eb'; // Medium blue
    if (ratio > 0.2) return '#1d4ed8';  // Moderate blue
    return '#1e3a8a';                   // Deep dark blue (Baja)
  };

  const getIntensityLabel = (group: string): string => {
    const val = muscleVolumes[group] || 0;
    if (val === 0) return 'Sin actividad reciente';
    const ratio = Math.min(val / maxVal, 1);
    if (ratio > 0.75) return `Intensidad Alta (${val} kg)`;
    if (ratio > 0.45) return `Intensidad Media (${val} kg)`;
    return `Intensidad Baja (${val} kg)`;
  };

  const chestColor = getHeatColor('pecho');
  const backColor = getHeatColor('espalda');
  const legsColor = getHeatColor('piernas');
  const shouldersColor = getHeatColor('hombros');
  const armsColor = getHeatColor('brazos');
  const coreColor = getHeatColor('core');

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {/* Selected Muscle Tooltip Banner */}
      <div
        style={{
          minHeight: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        {selectedMuscle ? (
          <span
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60a5fa',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.80rem',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {selectedMuscle}: {getIntensityLabel(selectedMuscle)}
          </span>
        ) : (
          <span style={{ fontSize: '0.76rem', color: 'var(--ion-color-medium, #94a3b8)' }}>
            Toca cualquier músculo para ver su volumen
          </span>
        )}
      </div>

      {/* Anatomical SVG Diagram */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg
          viewBox="0 0 340 220"
          style={{ width: '100%', maxWidth: '340px', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="heatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#242b38" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* ================ VISTA FRONTAL (LEFT) ================== */}
          {/* ======================================================== */}
          <g id="vista-frontal" transform="translate(10, 5)">
            {/* Silhouette Base & Head */}
            <ellipse cx="75" cy="18" rx="8" ry="10" fill="#242b38" stroke="#10151f" strokeWidth="1" />
            <path d="M72 27 L78 27 L78 33 L72 33 Z" fill="#242b38" />

            {/* Shoulders (Deltoides frontales) */}
            <path
              d="M52 35 C52 35, 48 42, 50 51 C54 53, 60 50, 62 46 C63 41, 60 36, 55 35 Z"
              fill={shouldersColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('hombros')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M98 35 C98 35, 102 42, 100 51 C96 53, 90 50, 88 46 C87 41, 90 36, 95 35 Z"
              fill={shouldersColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('hombros')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Pectorals (Pecho) */}
            <path
              d="M62 36 L74 36 L74 53 C70 54, 62 52, 60 46 C60 41, 61 38, 62 36 Z"
              fill={chestColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('pecho')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M88 36 L76 36 L76 53 C80 54, 88 52, 90 46 C90 41, 89 38, 88 36 Z"
              fill={chestColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('pecho')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Biceps (Brazos) */}
            <path
              d="M48 53 C46 60, 48 68, 52 72 C55 71, 57 65, 56 57 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M102 53 C104 60, 102 68, 98 72 C95 71, 93 65, 94 57 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Forearms (Antebrazos) */}
            <path
              d="M49 74 C44 83, 40 94, 38 104 C41 106, 45 104, 50 96 C53 89, 53 80, 52 74 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M101 74 C106 83, 110 94, 112 104 C109 106, 105 104, 100 96 C97 89, 97 80, 98 74 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Hands */}
            <path d="M37 105 C36 109, 38 114, 41 115 C43 114, 44 110, 43 106 Z" fill="#242b38" />
            <path d="M113 105 C114 109, 112 114, 109 115 C107 114, 106 110, 107 106 Z" fill="#242b38" />

            {/* Abdomen / Core */}
            <path
              d="M66 55 L84 55 L82 86 L68 86 Z"
              fill={coreColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('core')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Pelvis */}
            <path d="M67 87 L83 87 L80 97 L70 97 Z" fill="#242b38" stroke="#10151f" strokeWidth="1" />

            {/* Quadriceps (Piernas frontales) */}
            <path
              d="M65 98 C63 115, 62 130, 66 142 C70 144, 73 138, 74 125 C75 112, 75 103, 74 98 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M85 98 C87 115, 88 130, 84 142 C80 144, 77 138, 76 125 C75 112, 75 103, 76 98 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Knees */}
            <circle cx="68" cy="146" r="3.5" fill="#242b38" />
            <circle cx="82" cy="146" r="3.5" fill="#242b38" />

            {/* Calves / Tibiales */}
            <path
              d="M65 150 C63 162, 64 175, 67 186 C69 187, 72 186, 73 178 C74 168, 72 158, 71 150 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M85 150 C87 162, 86 175, 83 186 C81 187, 78 186, 77 178 C76 168, 78 158, 79 150 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Feet */}
            <path d="M66 187 C63 191, 62 195, 66 196 L71 196 C72 193, 71 189, 70 187 Z" fill="#242b38" />
            <path d="M84 187 C87 191, 88 195, 84 196 L79 196 C78 193, 79 189, 80 187 Z" fill="#242b38" />
          </g>

          {/* ======================================================== */}
          {/* ================= VISTA DORSAL (RIGHT) ================= */}
          {/* ======================================================== */}
          <g id="vista-dorsal" transform="translate(175, 5)">
            {/* Silhouette Base & Head */}
            <ellipse cx="75" cy="18" rx="8" ry="10" fill="#242b38" stroke="#10151f" strokeWidth="1" />
            <path d="M72 27 L78 27 L78 33 L72 33 Z" fill="#242b38" />

            {/* Upper Back / Traps (Trapecios y espalda alta) */}
            <path
              d="M68 33 L82 33 L88 44 L75 58 L62 44 Z"
              fill={backColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('espalda')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Rear Deltoids (Hombros posteriores) */}
            <path
              d="M52 35 C52 35, 48 42, 50 51 C54 53, 60 50, 62 45 C63 40, 59 36, 54 35 Z"
              fill={shouldersColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('hombros')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M98 35 C98 35, 102 42, 100 51 C96 53, 90 50, 88 45 C87 40, 91 36, 96 35 Z"
              fill={shouldersColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('hombros')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Triceps (Tríceps posterior) */}
            <path
              d="M48 53 C46 60, 48 68, 52 72 C55 71, 57 65, 56 57 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M102 53 C104 60, 102 68, 98 72 C95 71, 93 65, 94 57 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Forearms back */}
            <path
              d="M49 74 C44 83, 40 94, 38 104 C41 106, 45 104, 50 96 C53 89, 53 80, 52 74 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M101 74 C106 83, 110 94, 112 104 C109 106, 105 104, 100 96 C97 89, 97 80, 98 74 Z"
              fill={armsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('brazos')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Hands back */}
            <path d="M37 105 C36 109, 38 114, 41 115 C43 114, 44 110, 43 106 Z" fill="#242b38" />
            <path d="M113 105 C114 109, 112 114, 109 115 C107 114, 106 110, 107 106 Z" fill="#242b38" />

            {/* Lats (Dorsales) */}
            <path
              d="M61 46 C61 46, 68 56, 74 60 L74 84 C68 82, 63 72, 60 58 Z"
              fill={backColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('espalda')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M89 46 C89 46, 82 56, 76 60 L76 84 C82 82, 87 72, 90 58 Z"
              fill={backColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('espalda')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Lower Back (Lumbares) */}
            <path
              d="M69 82 L81 82 L80 94 L70 94 Z"
              fill={backColor}
              stroke="#10151f"
              strokeWidth="1"
              onClick={() => setSelectedMuscle('espalda')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Glutes (Glúteos) */}
            <path
              d="M64 96 C64 96, 75 94, 75 106 C75 116, 68 122, 64 118 C61 114, 61 102, 64 96 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M86 96 C86 96, 75 94, 75 106 C75 116, 82 122, 86 118 C89 114, 89 102, 86 96 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Hamstrings (Femorales / Isquiotibiales) */}
            <path
              d="M64 120 C62 128, 63 138, 66 144 C70 144, 73 138, 74 128 C74 122, 72 120, 68 120 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M86 120 C88 128, 87 138, 84 144 C80 144, 77 138, 76 128 C76 122, 78 120, 82 120 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Back Knees */}
            <circle cx="68" cy="146" r="3" fill="#242b38" />
            <circle cx="82" cy="146" r="3" fill="#242b38" />

            {/* Calves (Gemelos) */}
            <path
              d="M65 150 C62 160, 63 174, 67 186 C70 186, 73 182, 74 174 C75 165, 73 155, 71 150 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />
            <path
              d="M85 150 C88 160, 87 174, 83 186 C80 186, 77 182, 76 174 C75 165, 77 155, 79 150 Z"
              fill={legsColor}
              stroke="#10151f"
              strokeWidth="1.2"
              onClick={() => setSelectedMuscle('piernas')}
              style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
            />

            {/* Feet back */}
            <path d="M67 187 L67 196 L71 196 L70 187 Z" fill="#242b38" />
            <path d="M83 187 L83 196 L79 196 L80 187 Z" fill="#242b38" />
          </g>
        </svg>
      </div>

      {/* Heatmap Legend Bar (Alta [blue gradient] Baja) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '10px',
        }}
      >
        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--ion-color-medium, #94a3b8)' }}>
          Alta
        </span>
        <div
          style={{
            width: '80px',
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #3b82f6, #1d4ed8, #242b38)',
          }}
        />
        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--ion-color-medium, #94a3b8)' }}>
          Baja
        </span>
      </div>
    </div>
  );
};
