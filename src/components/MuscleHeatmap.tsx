import React, { useState } from 'react';

interface MuscleHeatmapProps {
  muscleVolumes: Record<string, number>; // volume in kg or set count per muscle group
  timeframe?: string;
  defaultGender?: 'male' | 'female';
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({
  muscleVolumes,
  timeframe = 'Esta semana',
  defaultGender = 'male',
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>(defaultGender);

  // Find max volume to normalize heat levels (0.0 to 1.0)
  const values = Object.values(muscleVolumes);
  const maxVal = Math.max(...values, 1);

  const getHeatColor = (group: string): string => {
    const val = muscleVolumes[group] || 0;
    if (val === 0) return '#2b3442'; // Neutral slate facet matching reference
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
    if (ratio > 0.75) return `Intensidad Alta (${val.toLocaleString()} kg)`;
    if (ratio > 0.45) return `Intensidad Media (${val.toLocaleString()} kg)`;
    return `Intensidad Baja (${val.toLocaleString()} kg)`;
  };

  const muscleNamesMap: Record<string, string> = {
    pecho: 'Pecho (Pectorales)',
    espalda: 'Espalda (Dorsales y Trapecio)',
    piernas: 'Piernas (Cuádriceps, Glúteos y Gemelos)',
    hombros: 'Hombros (Deltoides)',
    brazos: 'Brazos (Bíceps, Tríceps y Antebrazo)',
    core: 'Core (Abdomen y Oblicuos)',
  };

  const chestColor = getHeatColor('pecho');
  const backColor = getHeatColor('espalda');
  const legsColor = getHeatColor('piernas');
  const shouldersColor = getHeatColor('hombros');
  const armsColor = getHeatColor('brazos');
  const coreColor = getHeatColor('core');
  const neutralColor = '#2b3442';
  const strokeColor = '#0f131a';
  const sw = '1.2';

  const isSel = (g: string) => selectedMuscle === g;
  const toggleMuscle = (g: string) => setSelectedMuscle(selectedMuscle === g ? null : g);

  // SVG Figure Centers
  const frontCX = 95;
  const backCX = 265;

  // Render a detailed anatomical hand with solid palm and 5 distinct splayed fingers
  const renderHand = (cx: number, side: number) => {
    const s = side; // -1 for left figure arm (lateral is -x), 1 for right figure arm (lateral is +x)
    const wx = cx + s * 54;
    const wy = 196;

    // In anatomical position, thumb points LATERAL (+s relative to side direction), pinky is MEDIAL (-s)
    const palm = `M ${wx - s * 4} ${wy} L ${wx + s * 6} ${wy} L ${wx + s * 11} ${wy + 11} L ${wx + s * 7} ${wy + 23} L ${wx - s * 2} ${wy + 25} L ${wx - s * 7} ${wy + 21} L ${wx - s * 7} ${wy + 10} Z`;
    const thumb = `M ${wx + s * 7} ${wy + 9} L ${wx + s * 20} ${wy + 18} L ${wx + s * 22} ${wy + 26} L ${wx + s * 16} ${wy + 26} L ${wx + s * 5} ${wy + 16} Z`;
    const index = `M ${wx + s * 5} ${wy + 22} L ${wx + s * 8} ${wy + 40} L ${wx + s * 3} ${wy + 41} L ${wx + s * 1} ${wy + 24} Z`;
    const middle = `M ${wx + s * 1} ${wy + 24} L ${wx + s * 1} ${wy + 48} L ${wx - s * 4} ${wy + 48} L ${wx - s * 3} ${wy + 24} Z`;
    const ring = `M ${wx - s * 3} ${wy + 23} L ${wx - s * 4} ${wy + 44} L ${wx - s * 8} ${wy + 44} L ${wx - s * 6} ${wy + 22} Z`;
    const pinky = `M ${wx - s * 6} ${wy + 21} L ${wx - s * 7} ${wy + 37} L ${wx - s * 12} ${wy + 36} L ${wx - s * 8} ${wy + 17} Z`;

    return (
      <g fill={neutralColor} stroke={strokeColor} strokeWidth="1">
        <path d={palm} />
        <path d={thumb} />
        <path d={index} />
        <path d={middle} />
        <path d={ring} />
        <path d={pinky} />
      </g>
    );
  };

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {/* Gender Switcher (Hombre ♂ / Mujer ♀) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div
          style={{
            display: 'inline-flex',
            background: '#10141c',
            padding: '3px',
            borderRadius: '20px',
            border: '1px solid #232d3d',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setGender('male')}
            style={{
              padding: '5px 16px',
              borderRadius: '16px',
              border: 'none',
              background: gender === 'male' ? '#3b82f6' : 'transparent',
              color: gender === 'male' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.80rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>♂</span> Hombre
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            style={{
              padding: '5px 16px',
              borderRadius: '16px',
              border: 'none',
              background: gender === 'female' ? '#ec4899' : 'transparent',
              color: gender === 'female' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.80rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>♀</span> Mujer
          </button>
        </div>
      </div>

      {/* Selected Muscle Tooltip banner */}
      <div
        style={{
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        {selectedMuscle ? (
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '12px',
              padding: '3px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#93c5fd',
            }}
          >
            <span style={{ fontWeight: 700 }}>{muscleNamesMap[selectedMuscle]}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>{getIntensityLabel(selectedMuscle)}</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Toca cualquier grupo muscular para ver el volumen ({timeframe})
          </span>
        )}
      </div>

      {/* Anatomical Heatmap SVG */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <svg
          viewBox="0 0 360 410"
          style={{
            width: '100%',
            maxWidth: '350px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5))',
          }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.8" />
            </filter>
            <linearGradient id="legendGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {/* ======================= MALE MODEL ======================= */}
          {gender === 'male' ? (
            <g className="male-model">
              {/* FRONT VIEW (CX = 95) */}
              <g id="male-front">
                {/* Head & Neck */}
                <g fill={neutralColor} stroke={strokeColor} strokeWidth="1">
                  <path d={`M ${frontCX - 10} 20 C ${frontCX - 17} 21 ${frontCX - 19} 29 ${frontCX - 19} 37 C ${frontCX - 19} 45 ${frontCX - 14} 52 ${frontCX - 9} 56 L ${frontCX} 61 L ${frontCX + 9} 56 C ${frontCX + 14} 52 ${frontCX + 19} 45 ${frontCX + 19} 37 C ${frontCX + 19} 29 ${frontCX + 17} 21 ${frontCX + 10} 20 Z`} />
                  <path d={`M ${frontCX - 7} 58 L ${frontCX - 13} 70 L ${frontCX - 7} 70 L ${frontCX - 2} 60 Z`} />
                  <path d={`M ${frontCX + 7} 58 L ${frontCX + 13} 70 L ${frontCX + 7} 70 L ${frontCX + 2} 60 Z`} />
                  <path d={`M ${frontCX - 2} 60 L ${frontCX - 4} 70 L ${frontCX + 4} 70 L ${frontCX + 2} 60 Z`} />
                </g>

                {/* Trapezius Front Slopes -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 14} 66 C ${frontCX - 24} 68 ${frontCX - 34} 73 ${frontCX - 41} 79 L ${frontCX - 35} 83 C ${frontCX - 26} 78 ${frontCX - 16} 73 ${frontCX - 7} 71 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 14} 66 C ${frontCX + 24} 68 ${frontCX + 34} 73 ${frontCX + 41} 79 L ${frontCX + 35} 83 C ${frontCX + 26} 78 ${frontCX + 16} 73 ${frontCX + 7} 71 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Deltoids / Shoulders -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 42} 79 C ${frontCX - 50} 85 ${frontCX - 54} 94 ${frontCX - 53} 105 C ${frontCX - 52} 111 ${frontCX - 48} 115 ${frontCX - 43} 116 C ${frontCX - 40} 110 ${frontCX - 37} 102 ${frontCX - 36} 94 C ${frontCX - 35} 88 ${frontCX - 37} 82 ${frontCX - 41} 79 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 42} 79 C ${frontCX + 50} 85 ${frontCX + 54} 94 ${frontCX + 53} 105 C ${frontCX + 52} 111 ${frontCX + 48} 115 ${frontCX + 43} 116 C ${frontCX + 40} 110 ${frontCX + 37} 102 ${frontCX + 36} 94 C ${frontCX + 35} 88 ${frontCX + 37} 82 ${frontCX + 41} 79 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Pectorals / Chest -> PECHO */}
                <g onClick={() => toggleMuscle('pecho')} style={{ cursor: 'pointer' }} filter={isSel('pecho') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 2} 71 C ${frontCX - 14} 71 ${frontCX - 26} 75 ${frontCX - 35} 83 C ${frontCX - 34} 95 ${frontCX - 31} 104 ${frontCX - 25} 108 C ${frontCX - 17} 111 ${frontCX - 8} 110 ${frontCX - 2} 106 Z`} fill={chestColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 71 C ${frontCX + 14} 71 ${frontCX + 26} 75 ${frontCX + 35} 83 C ${frontCX + 34} 95 ${frontCX + 31} 104 ${frontCX + 25} 108 C ${frontCX + 17} 111 ${frontCX + 8} 110 ${frontCX + 2} 106 Z`} fill={chestColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Arms -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 43} 116 C ${frontCX - 47} 122 ${frontCX - 49} 130 ${frontCX - 50} 139 C ${frontCX - 46} 142 ${frontCX - 42} 141 ${frontCX - 38} 138 C ${frontCX - 37} 130 ${frontCX - 38} 123 ${frontCX - 39} 116 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 50} 107 C ${frontCX - 55} 116 ${frontCX - 56} 124 ${frontCX - 55} 132 L ${frontCX - 50} 135 C ${frontCX - 48} 127 ${frontCX - 46} 119 ${frontCX - 44} 113 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 43} 116 C ${frontCX + 47} 122 ${frontCX + 49} 130 ${frontCX + 50} 139 C ${frontCX + 46} 142 ${frontCX + 42} 141 ${frontCX + 38} 138 C ${frontCX + 37} 130 ${frontCX + 38} 123 ${frontCX + 39} 116 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 50} 107 C ${frontCX + 55} 116 ${frontCX + 56} 124 ${frontCX + 55} 132 L ${frontCX + 50} 135 C ${frontCX + 48} 127 ${frontCX + 46} 119 ${frontCX + 44} 113 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${frontCX - 50} 142 C ${frontCX - 54} 154 ${frontCX - 58} 169 ${frontCX - 60} 185 C ${frontCX - 56} 188 ${frontCX - 53} 187 ${frontCX - 50} 183 C ${frontCX - 47} 170 ${frontCX - 44} 156 ${frontCX - 42} 143 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 41} 144 C ${frontCX - 45} 158 ${frontCX - 48} 174 ${frontCX - 51} 190 C ${frontCX - 53} 191 ${frontCX - 57} 191 ${frontCX - 55} 196 L ${frontCX - 49} 196 C ${frontCX - 45} 182 ${frontCX - 41} 168 ${frontCX - 36} 150 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 50} 142 C ${frontCX + 54} 154 ${frontCX + 58} 169 ${frontCX + 60} 185 C ${frontCX + 56} 188 ${frontCX + 53} 187 ${frontCX + 50} 183 C ${frontCX + 47} 170 ${frontCX + 44} 156 ${frontCX + 42} 143 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 41} 144 C ${frontCX + 45} 158 ${frontCX + 48} 174 ${frontCX + 51} 190 C ${frontCX + 53} 191 ${frontCX + 57} 191 ${frontCX + 55} 196 L ${frontCX + 49} 196 C ${frontCX + 45} 182 ${frontCX + 41} 168 ${frontCX + 36} 150 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Defined Hands */}
                {renderHand(frontCX, -1)}
                {renderHand(frontCX, 1)}

                {/* Core / 6-Pack + Obliques -> CORE */}
                <g onClick={() => toggleMuscle('core')} style={{ cursor: 'pointer' }} filter={isSel('core') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 2} 108 L ${frontCX - 14} 110 L ${frontCX - 14} 120 L ${frontCX - 2} 119 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 108 L ${frontCX + 14} 110 L ${frontCX + 14} 120 L ${frontCX + 2} 119 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 2} 122 L ${frontCX - 13} 122 L ${frontCX - 13} 133 L ${frontCX - 2} 132 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 122 L ${frontCX + 13} 122 L ${frontCX + 13} 133 L ${frontCX + 2} 132 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 2} 135 L ${frontCX - 12} 135 L ${frontCX - 11} 146 L ${frontCX - 2} 146 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 135 L ${frontCX + 12} 135 L ${frontCX + 11} 146 L ${frontCX + 2} 146 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 2} 148 L ${frontCX - 10} 148 L ${frontCX - 6} 160 L ${frontCX - 2} 160 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 148 L ${frontCX + 10} 148 L ${frontCX + 6} 160 L ${frontCX + 2} 160 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${frontCX - 23} 109 C ${frontCX - 27} 114 ${frontCX - 28} 120 ${frontCX - 29} 125 L ${frontCX - 16} 122 L ${frontCX - 16} 113 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 28} 127 C ${frontCX - 27} 134 ${frontCX - 25} 141 ${frontCX - 23} 147 L ${frontCX - 15} 139 L ${frontCX - 15} 126 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 22} 149 C ${frontCX - 20} 155 ${frontCX - 17} 161 ${frontCX - 13} 165 L ${frontCX - 12} 153 L ${frontCX - 14} 142 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${frontCX + 23} 109 C ${frontCX + 27} 114 ${frontCX + 28} 120 ${frontCX + 29} 125 L ${frontCX + 16} 122 L ${frontCX + 16} 113 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 28} 127 C ${frontCX + 27} 134 ${frontCX + 25} 141 ${frontCX + 23} 147 L ${frontCX + 15} 139 L ${frontCX + 15} 126 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 22} 149 C ${frontCX + 20} 155 ${frontCX + 17} 161 ${frontCX + 13} 165 L ${frontCX + 12} 153 L ${frontCX + 14} 142 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Pelvis / Groin */}
                <path d={`M ${frontCX - 2} 161 L ${frontCX - 5} 171 L ${frontCX + 5} 171 L ${frontCX + 2} 161 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* ================= LONG ATHLETIC LEGS (61% OF TOTAL HEIGHT) -> PIERNAS ================= */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  {/* Left Quads - Athletic sweeping lateral contour */}
                  <path d={`M ${frontCX - 15} 164 C ${frontCX - 28} 177 ${frontCX - 32} 201 ${frontCX - 29} 226 C ${frontCX - 26} 242 ${frontCX - 20} 254 ${frontCX - 15} 265 L ${frontCX - 10} 265 C ${frontCX - 15} 249 ${frontCX - 19} 228 ${frontCX - 17} 199 L ${frontCX - 10} 174 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 10} 174 L ${frontCX - 17} 199 C ${frontCX - 19} 228 ${frontCX - 15} 249 ${frontCX - 10} 265 L ${frontCX - 4} 265 C ${frontCX - 4} 247 ${frontCX - 6} 226 ${frontCX - 6} 199 L ${frontCX - 4} 178 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 4} 178 L ${frontCX - 6} 199 C ${frontCX - 6} 226 ${frontCX - 4} 247 ${frontCX - 4} 265 L ${frontCX - 1} 265 C ${frontCX - 0} 249 ${frontCX - 0} 228 ${frontCX - 1} 202 L ${frontCX - 1} 185 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Right Quads */}
                  <path d={`M ${frontCX + 15} 164 C ${frontCX + 28} 177 ${frontCX + 32} 201 ${frontCX + 29} 226 C ${frontCX + 26} 242 ${frontCX + 20} 254 ${frontCX + 15} 265 L ${frontCX + 10} 265 C ${frontCX + 15} 249 ${frontCX + 19} 228 ${frontCX + 17} 199 L ${frontCX + 10} 174 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 10} 174 L ${frontCX + 17} 199 C ${frontCX + 19} 228 ${frontCX + 15} 249 ${frontCX + 10} 265 L ${frontCX + 4} 265 C ${frontCX + 4} 247 ${frontCX + 6} 226 ${frontCX + 6} 199 L ${frontCX + 4} 178 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 4} 178 L ${frontCX + 6} 199 C ${frontCX + 6} 226 ${frontCX + 4} 247 ${frontCX + 4} 265 L ${frontCX + 1} 265 C ${frontCX + 0} 249 ${frontCX + 0} 228 ${frontCX + 1} 202 L ${frontCX + 1} 185 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Left Lower Leg (Muscular Calves & Shins) */}
                  <path d={`M ${frontCX - 14} 283 C ${frontCX - 23} 297 ${frontCX - 23} 316 ${frontCX - 16} 334 L ${frontCX - 10} 366 L ${frontCX - 6} 366 L ${frontCX - 10} 333 C ${frontCX - 14} 317 ${frontCX - 14} 301 ${frontCX - 10} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 9} 285 L ${frontCX - 10} 333 L ${frontCX - 6} 366 L ${frontCX - 2} 366 L ${frontCX - 1} 333 C ${frontCX + 1} 317 ${frontCX + 1} 301 ${frontCX - 2} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Right Lower Leg */}
                  <path d={`M ${frontCX + 14} 283 C ${frontCX + 23} 297 ${frontCX + 23} 316 ${frontCX + 16} 334 L ${frontCX + 10} 366 L ${frontCX + 6} 366 L ${frontCX + 10} 333 C ${frontCX + 14} 317 ${frontCX + 14} 301 ${frontCX + 10} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 9} 285 L ${frontCX + 10} 333 L ${frontCX + 6} 366 L ${frontCX + 2} 366 L ${frontCX + 1} 333 C ${frontCX - 1} 317 ${frontCX - 1} 301 ${frontCX + 2} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Knees */}
                <path d={`M ${frontCX - 10} 267 L ${frontCX - 15} 274 L ${frontCX - 10} 281 L ${frontCX - 5} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX - 4} 267 L ${frontCX - 4} 276 L ${frontCX - 1} 276 L ${frontCX - 1} 267 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX + 10} 267 L ${frontCX + 15} 274 L ${frontCX + 10} 281 L ${frontCX + 5} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX + 4} 267 L ${frontCX + 4} 276 L ${frontCX + 1} 276 L ${frontCX + 1} 267 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Feet */}
                <path d={`M ${frontCX - 11} 368 L ${frontCX - 16} 387 L ${frontCX - 1} 387 L ${frontCX - 2} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX + 11} 368 L ${frontCX + 16} 387 L ${frontCX + 1} 387 L ${frontCX + 2} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>

              {/* BACK VIEW (CX = 265) */}
              <g id="male-back">
                {/* Head & Neck Back */}
                <g fill={neutralColor} stroke={strokeColor} strokeWidth="1">
                  <path d={`M ${backCX - 10} 20 C ${backCX - 17} 21 ${backCX - 19} 29 ${backCX - 19} 37 C ${backCX - 19} 45 ${backCX - 14} 52 ${backCX - 9} 56 L ${backCX} 61 L ${backCX + 9} 56 C ${backCX + 14} 52 ${backCX + 19} 45 ${backCX + 19} 37 C ${backCX + 19} 29 ${backCX + 17} 21 ${backCX + 10} 20 Z`} />
                  <path d={`M ${backCX - 6} 58 L ${backCX - 7} 71 L ${backCX + 7} 71 L ${backCX + 6} 58 Z`} />
                </g>

                {/* Trapezius / Back / Lats -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d={`M ${backCX - 6} 71 L ${backCX - 18} 81 L ${backCX - 5} 81 L ${backCX - 2} 71 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 6} 71 L ${backCX + 18} 81 L ${backCX + 5} 81 L ${backCX + 2} 71 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 2} 83 L ${backCX - 19} 83 C ${backCX - 32} 86 ${backCX - 42} 93 ${backCX - 48} 100 L ${backCX - 35} 102 C ${backCX - 25} 96 ${backCX - 13} 90 ${backCX - 2} 88 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 2} 83 L ${backCX + 19} 83 C ${backCX + 32} 86 ${backCX + 42} 93 ${backCX + 48} 100 L ${backCX + 35} 102 C ${backCX + 25} 96 ${backCX + 13} 90 ${backCX + 2} 88 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 2} 90 C ${backCX - 9} 99 ${backCX - 14} 111 ${backCX - 16} 122 L ${backCX - 2} 138 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 2} 90 C ${backCX + 9} 99 ${backCX + 14} 111 ${backCX + 16} 122 L ${backCX + 2} 138 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 37} 104 C ${backCX - 28} 111 ${backCX - 22} 120 ${backCX - 19} 130 L ${backCX - 34} 134 C ${backCX - 38} 124 ${backCX - 38} 114 ${backCX - 37} 105 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 37} 104 C ${backCX + 28} 111 ${backCX + 22} 120 ${backCX + 19} 130 L ${backCX + 34} 134 C ${backCX + 38} 124 ${backCX + 38} 114 ${backCX + 37} 105 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 19} 133 C ${backCX - 19} 144 ${backCX - 18} 156 ${backCX - 16} 168 C ${backCX - 11} 171 ${backCX - 6} 171 ${backCX - 5} 163 C ${backCX - 6} 152 ${backCX - 7} 141 ${backCX - 5} 139 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 35} 136 C ${backCX - 31} 148 ${backCX - 25} 160 ${backCX - 17} 172 L ${backCX - 14} 169 C ${backCX - 19} 157 ${backCX - 21} 145 ${backCX - 22} 132 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 19} 133 C ${backCX + 19} 144 ${backCX + 18} 156 ${backCX + 16} 168 C ${backCX + 11} 171 ${backCX + 6} 171 ${backCX + 5} 163 C ${backCX + 6} 152 ${backCX + 7} 141 ${backCX + 5} 139 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 35} 136 C ${backCX + 31} 148 ${backCX + 25} 160 ${backCX + 17} 172 L ${backCX + 14} 169 C ${backCX + 19} 157 ${backCX + 21} 145 ${backCX + 22} 132 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 5} 170 L ${backCX - 7} 185 L ${backCX - 2} 185 L ${backCX - 2} 170 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 5} 170 L ${backCX + 7} 185 L ${backCX + 2} 185 L ${backCX + 2} 170 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Rear Deltoids -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d={`M ${backCX - 49} 101 C ${backCX - 56} 109 ${backCX - 60} 119 ${backCX - 59} 130 C ${backCX - 54} 131 ${backCX - 48} 127 ${backCX - 44} 121 C ${backCX - 42} 113 ${backCX - 42} 106 ${backCX - 43} 101 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 49} 101 C ${backCX + 56} 109 ${backCX + 60} 119 ${backCX + 59} 130 C ${backCX + 54} 131 ${backCX + 48} 127 ${backCX + 44} 121 C ${backCX + 42} 113 ${backCX + 42} 106 ${backCX + 43} 101 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Arms Back -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d={`M ${backCX - 60} 133 C ${backCX - 65} 141 ${backCX - 69} 150 ${backCX - 72} 158 C ${backCX - 68} 161 ${backCX - 62} 160 ${backCX - 57} 156 C ${backCX - 54} 147 ${backCX - 53} 139 ${backCX - 52} 133 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 50} 134 C ${backCX - 50} 143 ${backCX - 53} 151 ${backCX - 57} 158 L ${backCX - 51} 161 C ${backCX - 47} 152 ${backCX - 46} 142 ${backCX - 47} 134 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 60} 133 C ${backCX + 65} 141 ${backCX + 69} 150 ${backCX + 72} 158 C ${backCX + 68} 161 ${backCX + 62} 160 ${backCX + 57} 156 C ${backCX + 54} 147 ${backCX + 53} 139 ${backCX + 52} 133 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 50} 134 C ${backCX + 50} 143 ${backCX + 53} 151 ${backCX + 57} 158 L ${backCX + 51} 161 C ${backCX + 47} 152 ${backCX + 46} 142 ${backCX + 47} 134 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 72} 161 C ${backCX - 76} 173 ${backCX - 79} 185 ${backCX - 80} 197 C ${backCX - 76} 199 ${backCX - 72} 198 ${backCX - 69} 193 C ${backCX - 66} 181 ${backCX - 64} 170 ${backCX - 63} 161 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 62} 163 C ${backCX - 63} 174 ${backCX - 65} 187 ${backCX - 66} 199 L ${backCX - 61} 199 C ${backCX - 59} 186 ${backCX - 57} 173 ${backCX - 56} 163 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 72} 161 C ${backCX + 76} 173 ${backCX + 79} 185 ${backCX + 80} 197 C ${backCX + 76} 199 ${backCX + 72} 198 ${backCX + 69} 193 C ${backCX + 66} 181 ${backCX + 64} 170 ${backCX + 63} 161 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 62} 163 C ${backCX + 63} 174 ${backCX + 65} 187 ${backCX + 66} 199 L ${backCX + 61} 199 C ${backCX + 59} 186 ${backCX + 57} 173 ${backCX + 56} 163 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Hands Back */}
                {renderHand(backCX, -1)}
                {renderHand(backCX, 1)}

                {/* ================= GLUTES & LEGS BACK -> PIERNAS ================= */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  {/* Gluteus Maximus */}
                  <path d={`M ${backCX - 2} 186 C ${backCX - 14} 186 ${backCX - 29} 190 ${backCX - 30} 205 C ${backCX - 31} 220 ${backCX - 24} 229 ${backCX - 12} 232 C ${backCX - 6} 233 ${backCX - 2} 225 ${backCX - 2} 214 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 2} 186 C ${backCX + 14} 186 ${backCX + 29} 190 ${backCX + 30} 205 C ${backCX + 31} 220 ${backCX + 24} 229 ${backCX + 12} 232 C ${backCX + 6} 233 ${backCX + 2} 225 ${backCX + 2} 214 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Hamstrings */}
                  <path d={`M ${backCX - 29} 213 C ${backCX - 31} 230 ${backCX - 28} 248 ${backCX - 18} 266 L ${backCX - 12} 266 C ${backCX - 18} 248 ${backCX - 20} 230 ${backCX - 19} 216 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 19} 216 C ${backCX - 20} 230 ${backCX - 18} 248 ${backCX - 12} 266 L ${backCX - 6} 266 C ${backCX - 8} 252 ${backCX - 9} 238 ${backCX - 9} 228 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 9} 228 C ${backCX - 9} 238 ${backCX - 8} 252 ${backCX - 6} 266 L ${backCX - 1} 266 C ${backCX - 2} 252 ${backCX - 2} 239 ${backCX - 2} 229 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX + 29} 213 C ${backCX + 31} 230 ${backCX + 28} 248 ${backCX + 18} 266 L ${backCX + 12} 266 C ${backCX + 18} 248 ${backCX + 20} 230 ${backCX + 19} 216 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 19} 216 C ${backCX + 20} 230 ${backCX + 18} 248 ${backCX + 12} 266 L ${backCX + 6} 266 C ${backCX + 8} 252 ${backCX + 9} 238 ${backCX + 9} 228 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 9} 228 C ${backCX + 9} 238 ${backCX + 8} 252 ${backCX + 6} 266 L ${backCX + 1} 266 C ${backCX + 2} 252 ${backCX + 2} 239 ${backCX + 2} 229 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Calves Back (Muscular Twin Bellies continuous to heel) */}
                  <path d={`M ${backCX - 14} 282 C ${backCX - 24} 297 ${backCX - 24} 316 ${backCX - 16} 334 L ${backCX - 10} 366 L ${backCX - 6} 366 L ${backCX - 10} 333 C ${backCX - 15} 317 ${backCX - 14} 301 ${backCX - 10} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 10} 284 L ${backCX - 10} 333 L ${backCX - 6} 366 L ${backCX - 2} 366 L ${backCX - 1} 333 C ${backCX + 1} 317 ${backCX + 1} 301 ${backCX - 3} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX + 14} 282 C ${backCX + 24} 297 ${backCX + 24} 316 ${backCX + 16} 334 L ${backCX + 10} 366 L ${backCX + 6} 366 L ${backCX + 10} 333 C ${backCX + 15} 317 ${backCX + 14} 301 ${backCX + 10} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 10} 284 L ${backCX + 10} 333 L ${backCX + 6} 366 L ${backCX + 2} 366 L ${backCX + 1} 333 C ${backCX - 1} 317 ${backCX - 1} 301 ${backCX + 3} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Popliteal Fossa */}
                <path d={`M ${backCX - 10} 268 L ${backCX - 15} 274 L ${backCX - 10} 280 L ${backCX - 5} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${backCX + 10} 268 L ${backCX + 15} 274 L ${backCX + 10} 280 L ${backCX + 5} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Calcaneus / Heels */}
                <path d={`M ${backCX - 11} 368 L ${backCX - 15} 387 L ${backCX - 1} 387 L ${backCX - 3} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${backCX + 11} 368 L ${backCX + 15} 387 L ${backCX + 1} 387 L ${backCX + 3} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>
            </g>
          ) : (
            /* ======================= FEMALE MODEL ======================= */
            <g className="female-model">
              {/* FRONT VIEW (CX = 95) */}
              <g id="female-front">
                {/* Head & Neck */}
                <g fill={neutralColor} stroke={strokeColor} strokeWidth="1">
                  <path d={`M ${frontCX - 8} 22 C ${frontCX - 15} 23 ${frontCX - 17} 30 ${frontCX - 17} 37 C ${frontCX - 17} 45 ${frontCX - 12} 51 ${frontCX - 8} 55 L ${frontCX} 60 L ${frontCX + 8} 55 C ${frontCX + 12} 51 ${frontCX + 17} 45 ${frontCX + 17} 37 C ${frontCX + 17} 30 ${frontCX + 15} 23 ${frontCX + 8} 22 Z`} />
                  <path d={`M ${frontCX - 5} 57 L ${frontCX - 8} 69 L ${frontCX + 8} 69 L ${frontCX + 5} 57 Z`} />
                </g>

                {/* Trapezius Front Slopes -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 9} 67 C ${frontCX - 17} 70 ${frontCX - 25} 74 ${frontCX - 31} 80 L ${frontCX - 27} 83 C ${frontCX - 20} 79 ${frontCX - 13} 74 ${frontCX - 6} 71 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 9} 67 C ${frontCX + 17} 70 ${frontCX + 25} 74 ${frontCX + 31} 80 L ${frontCX + 27} 83 C ${frontCX + 20} 79 ${frontCX + 13} 74 ${frontCX + 6} 71 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Athletic Deltoids -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 32} 80 C ${frontCX - 39} 86 ${frontCX - 43} 95 ${frontCX - 42} 104 C ${frontCX - 41} 110 ${frontCX - 38} 113 ${frontCX - 35} 114 C ${frontCX - 32} 108 ${frontCX - 29} 101 ${frontCX - 28} 94 C ${frontCX - 28} 88 ${frontCX - 30} 83 ${frontCX - 32} 80 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 32} 80 C ${frontCX + 39} 86 ${frontCX + 43} 95 ${frontCX + 42} 104 C ${frontCX + 41} 110 ${frontCX + 38} 113 ${frontCX + 35} 114 C ${frontCX + 32} 108 ${frontCX + 29} 101 ${frontCX + 28} 94 C ${frontCX + 28} 88 ${frontCX + 30} 83 ${frontCX + 32} 80 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Feminine Athletic Chest / Sports-Bra Contour -> PECHO */}
                <g onClick={() => toggleMuscle('pecho')} style={{ cursor: 'pointer' }} filter={isSel('pecho') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 2} 72 C ${frontCX - 11} 72 ${frontCX - 20} 77 ${frontCX - 26} 85 C ${frontCX - 26} 98 ${frontCX - 23} 108 ${frontCX - 17} 111 C ${frontCX - 10} 113 ${frontCX - 4} 110 ${frontCX - 2} 103 Z`} fill={chestColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 72 C ${frontCX + 11} 72 ${frontCX + 20} 77 ${frontCX + 26} 85 C ${frontCX + 26} 98 ${frontCX + 23} 108 ${frontCX + 17} 111 C ${frontCX + 10} 113 ${frontCX + 4} 110 ${frontCX + 2} 103 Z`} fill={chestColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Arms -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 35} 115 C ${frontCX - 39} 122 ${frontCX - 41} 130 ${frontCX - 42} 139 C ${frontCX - 39} 141 ${frontCX - 35} 140 ${frontCX - 32} 137 C ${frontCX - 31} 130 ${frontCX - 31} 123 ${frontCX - 32} 115 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 42} 142 C ${frontCX - 47} 155 ${frontCX - 51} 170 ${frontCX - 54} 187 C ${frontCX - 51} 190 ${frontCX - 48} 189 ${frontCX - 45} 185 C ${frontCX - 42} 171 ${frontCX - 38} 157 ${frontCX - 36} 143 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 35} 144 C ${frontCX - 39} 158 ${frontCX - 43} 174 ${frontCX - 46} 192 C ${frontCX - 49} 193 ${frontCX - 52} 193 ${frontCX - 50} 198 L ${frontCX - 45} 198 C ${frontCX - 41} 184 ${frontCX - 37} 170 ${frontCX - 32} 151 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${frontCX + 35} 115 C ${frontCX + 39} 122 ${frontCX + 41} 130 ${frontCX + 42} 139 C ${frontCX + 39} 141 ${frontCX + 35} 140 ${frontCX + 32} 137 C ${frontCX + 31} 130 ${frontCX + 31} 123 ${frontCX + 32} 115 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 42} 142 C ${frontCX + 47} 155 ${frontCX + 51} 170 ${frontCX + 54} 187 C ${frontCX + 51} 190 ${frontCX + 48} 189 ${frontCX + 45} 185 C ${frontCX + 42} 171 ${frontCX + 38} 157 ${frontCX + 36} 143 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 35} 144 C ${frontCX + 39} 158 ${frontCX + 43} 174 ${frontCX + 46} 192 C ${frontCX + 49} 193 ${frontCX + 52} 193 ${frontCX + 50} 198 L ${frontCX + 45} 198 C ${frontCX + 41} 184 ${frontCX + 37} 170 ${frontCX + 32} 151 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Feminine Hands */}
                {renderHand(frontCX, -1)}
                {renderHand(frontCX, 1)}

                {/* Slender Athletic Core & Waist -> CORE */}
                <g onClick={() => toggleMuscle('core')} style={{ cursor: 'pointer' }} filter={isSel('core') ? 'url(#glow)' : undefined}>
                  <path d={`M ${frontCX - 2} 111 L ${frontCX - 10} 113 L ${frontCX - 10} 122 L ${frontCX - 2} 121 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 111 L ${frontCX + 10} 113 L ${frontCX + 10} 122 L ${frontCX + 2} 121 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 2} 124 L ${frontCX - 9} 124 L ${frontCX - 8} 136 L ${frontCX - 2} 136 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 124 L ${frontCX + 9} 124 L ${frontCX + 8} 136 L ${frontCX + 2} 136 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 2} 138 L ${frontCX - 8} 138 L ${frontCX - 5} 157 L ${frontCX - 2} 157 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 2} 138 L ${frontCX + 8} 138 L ${frontCX + 5} 157 L ${frontCX + 2} 157 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${frontCX - 18} 112 C ${frontCX - 22} 118 ${frontCX - 22} 125 ${frontCX - 21} 131 L ${frontCX - 12} 127 L ${frontCX - 12} 116 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 21} 133 C ${frontCX - 20} 141 ${frontCX - 19} 148 ${frontCX - 24} 159 L ${frontCX - 10} 155 L ${frontCX - 10} 139 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 18} 112 C ${frontCX + 22} 118 ${frontCX + 22} 125 ${frontCX + 21} 131 L ${frontCX + 12} 127 L ${frontCX + 12} 116 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 21} 133 C ${frontCX + 20} 141 ${frontCX + 19} 148 ${frontCX + 24} 159 L ${frontCX + 10} 155 L ${frontCX + 10} 139 Z`} fill={coreColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Pelvis */}
                <path d={`M ${frontCX - 2} 158 L ${frontCX - 5} 169 L ${frontCX + 5} 169 L ${frontCX + 2} 158 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* ================= FEMALE LONG ATHLETIC LEGS -> PIERNAS ================= */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  {/* Left Thigh - Athletic feminine curve */}
                  <path d={`M ${frontCX - 17} 162 C ${frontCX - 28} 178 ${frontCX - 30} 201 ${frontCX - 27} 225 C ${frontCX - 24} 240 ${frontCX - 19} 253 ${frontCX - 14} 265 L ${frontCX - 9} 265 C ${frontCX - 13} 249 ${frontCX - 16} 228 ${frontCX - 14} 199 L ${frontCX - 9} 174 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 9} 174 L ${frontCX - 14} 199 C ${frontCX - 15} 228 ${frontCX - 13} 249 ${frontCX - 9} 265 L ${frontCX - 4} 265 C ${frontCX - 4} 247 ${frontCX - 5} 226 ${frontCX - 5} 199 L ${frontCX - 3} 178 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 3} 178 L ${frontCX - 5} 199 C ${frontCX - 5} 226 ${frontCX - 4} 247 ${frontCX - 4} 265 L ${frontCX - 1} 265 C ${frontCX - 0} 249 ${frontCX - 0} 228 ${frontCX - 1} 202 L ${frontCX - 1} 185 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Right Thigh */}
                  <path d={`M ${frontCX + 17} 162 C ${frontCX + 28} 178 ${frontCX + 30} 201 ${frontCX + 27} 225 C ${frontCX + 24} 240 ${frontCX + 19} 253 ${frontCX + 14} 265 L ${frontCX + 9} 265 C ${frontCX + 13} 249 ${frontCX + 16} 228 ${frontCX + 14} 199 L ${frontCX + 9} 174 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 9} 174 L ${frontCX + 14} 199 C ${frontCX + 15} 228 ${frontCX + 13} 249 ${frontCX + 9} 265 L ${frontCX + 4} 265 C ${frontCX + 4} 247 ${frontCX + 5} 226 ${frontCX + 5} 199 L ${frontCX + 3} 178 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 3} 178 L ${frontCX + 5} 199 C ${frontCX + 5} 226 ${frontCX + 4} 247 ${frontCX + 4} 265 L ${frontCX + 1} 265 C ${frontCX + 0} 249 ${frontCX + 0} 228 ${frontCX + 1} 202 L ${frontCX + 1} 185 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Left Lower Leg */}
                  <path d={`M ${frontCX - 13} 283 C ${frontCX - 20} 297 ${frontCX - 20} 315 ${frontCX - 14} 333 L ${frontCX - 9} 366 L ${frontCX - 5} 366 L ${frontCX - 9} 333 C ${frontCX - 12} 317 ${frontCX - 12} 301 ${frontCX - 9} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX - 8} 285 L ${frontCX - 9} 333 L ${frontCX - 5} 366 L ${frontCX - 2} 366 L ${frontCX - 1} 333 C ${frontCX + 1} 317 ${frontCX + 1} 301 ${frontCX - 2} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Right Lower Leg */}
                  <path d={`M ${frontCX + 13} 283 C ${frontCX + 20} 297 ${frontCX + 20} 315 ${frontCX + 14} 333 L ${frontCX + 9} 366 L ${frontCX + 5} 366 L ${frontCX + 9} 333 C ${frontCX + 12} 317 ${frontCX + 12} 301 ${frontCX + 9} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${frontCX + 8} 285 L ${frontCX + 9} 333 L ${frontCX + 5} 366 L ${frontCX + 2} 366 L ${frontCX + 1} 333 C ${frontCX - 1} 317 ${frontCX - 1} 301 ${frontCX + 2} 285 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Knees */}
                <path d={`M ${frontCX - 9} 267 L ${frontCX - 13} 274 L ${frontCX - 9} 281 L ${frontCX - 5} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX - 4} 267 L ${frontCX - 4} 276 L ${frontCX - 1} 276 L ${frontCX - 1} 267 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX + 9} 267 L ${frontCX + 13} 274 L ${frontCX + 9} 281 L ${frontCX + 5} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX + 4} 267 L ${frontCX + 4} 276 L ${frontCX + 1} 276 L ${frontCX + 1} 267 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Feet */}
                <path d={`M ${frontCX - 10} 368 L ${frontCX - 13} 387 L ${frontCX - 1} 387 L ${frontCX - 2} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${frontCX + 10} 368 L ${frontCX + 14} 387 L ${frontCX + 1} 387 L ${frontCX + 2} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>

              {/* BACK VIEW (CX = 265) */}
              <g id="female-back">
                {/* Head Back */}
                <g fill={neutralColor} stroke={strokeColor} strokeWidth="1">
                  <path d={`M ${backCX - 8} 22 C ${backCX - 15} 23 ${backCX - 17} 30 ${backCX - 17} 37 C ${backCX - 17} 45 ${backCX - 12} 51 ${backCX - 8} 55 L ${backCX} 60 L ${backCX + 8} 55 C ${backCX + 12} 51 ${backCX + 17} 45 ${backCX + 17} 37 C ${backCX + 17} 30 ${backCX + 15} 23 ${backCX + 8} 22 Z`} />
                  <path d={`M ${backCX - 5} 57 L ${backCX - 6} 69 L ${backCX + 6} 69 L ${backCX + 5} 57 Z`} />
                </g>

                {/* Back / Traps / Lats -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d={`M ${backCX - 5} 69 L ${backCX - 14} 79 L ${backCX - 4} 79 L ${backCX - 2} 69 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 5} 69 L ${backCX + 14} 79 L ${backCX + 4} 79 L ${backCX + 2} 69 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 2} 81 L ${backCX - 15} 81 C ${backCX - 25} 84 ${backCX - 34} 90 ${backCX - 39} 97 L ${backCX - 28} 99 C ${backCX - 20} 93 ${backCX - 10} 88 ${backCX - 2} 86 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 2} 81 L ${backCX + 15} 81 C ${backCX + 25} 84 ${backCX + 34} 90 ${backCX + 39} 97 L ${backCX + 28} 99 C ${backCX + 20} 93 ${backCX + 10} 88 ${backCX + 2} 86 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 2} 88 C ${backCX - 8} 96 ${backCX - 12} 107 ${backCX - 14} 118 L ${backCX - 2} 133 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 2} 88 C ${backCX + 8} 96 ${backCX + 12} 107 ${backCX + 14} 118 L ${backCX + 2} 133 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 16} 130 C ${backCX - 16} 140 ${backCX - 15} 151 ${backCX - 13} 162 C ${backCX - 9} 165 ${backCX - 5} 165 ${backCX - 4} 158 C ${backCX - 5} 148 ${backCX - 6} 138 ${backCX - 4} 136 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 29} 132 C ${backCX - 25} 143 ${backCX - 20} 154 ${backCX - 14} 165 L ${backCX - 11} 162 C ${backCX - 15} 151 ${backCX - 17} 140 ${backCX - 18} 129 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 16} 130 C ${backCX + 16} 140 ${backCX + 15} 151 ${backCX + 13} 162 C ${backCX + 9} 165 ${backCX + 5} 165 ${backCX + 4} 158 C ${backCX + 5} 148 ${backCX + 6} 138 ${backCX + 4} 136 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 29} 132 C ${backCX + 25} 143 ${backCX + 20} 154 ${backCX + 14} 165 L ${backCX + 11} 162 C ${backCX + 15} 151 ${backCX + 17} 140 ${backCX + 18} 129 Z`} fill={backColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Rear Delts -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d={`M ${backCX - 40} 98 C ${backCX - 46} 105 ${backCX - 49} 114 ${backCX - 48} 123 C ${backCX - 44} 124 ${backCX - 39} 121 ${backCX - 35} 116 C ${backCX - 34} 109 ${backCX - 34} 103 ${backCX - 35} 98 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 40} 98 C ${backCX + 46} 105 ${backCX + 49} 114 ${backCX + 48} 123 C ${backCX + 44} 124 ${backCX + 39} 121 ${backCX + 35} 116 C ${backCX + 34} 109 ${backCX + 34} 103 ${backCX + 35} 98 Z`} fill={shouldersColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Back Arms -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d={`M ${backCX - 49} 125 C ${backCX - 53} 132 ${backCX - 56} 140 ${backCX - 58} 147 C ${backCX - 55} 149 ${backCX - 50} 148 ${backCX - 46} 145 C ${backCX - 44} 138 ${backCX - 43} 131 ${backCX - 42} 125 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 49} 125 C ${backCX + 53} 132 ${backCX + 56} 140 ${backCX + 58} 147 C ${backCX + 55} 149 ${backCX + 50} 148 ${backCX + 46} 145 C ${backCX + 44} 138 ${backCX + 43} 131 ${backCX + 42} 125 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX - 58} 150 C ${backCX - 61} 162 ${backCX - 64} 174 ${backCX - 65} 186 C ${backCX - 62} 188 ${backCX - 58} 187 ${backCX - 56} 182 C ${backCX - 53} 170 ${backCX - 52} 159 ${backCX - 51} 150 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 58} 150 C ${backCX + 61} 162 ${backCX + 64} 174 ${backCX + 65} 186 C ${backCX + 62} 188 ${backCX + 58} 187 ${backCX + 56} 182 C ${backCX + 53} 170 ${backCX + 52} 159 ${backCX + 51} 150 Z`} fill={armsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Feminine Hands Back */}
                {renderHand(backCX, -1)}
                {renderHand(backCX, 1)}

                {/* ================= FEMALE GLUTES & LEGS BACK -> PIERNAS ================= */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  {/* Rounded Feminine Gluteus Maximus */}
                  <path d={`M ${backCX - 2} 180 C ${backCX - 15} 180 ${backCX - 29} 185 ${backCX - 30} 202 C ${backCX - 31} 218 ${backCX - 24} 230 ${backCX - 12} 233 C ${backCX - 5} 234 ${backCX - 2} 226 ${backCX - 2} 214 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 2} 180 C ${backCX + 15} 180 ${backCX + 29} 185 ${backCX + 30} 202 C ${backCX + 31} 218 ${backCX + 24} 230 ${backCX + 12} 233 C ${backCX + 5} 234 ${backCX + 2} 226 ${backCX + 2} 214 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Hamstrings */}
                  <path d={`M ${backCX - 28} 215 C ${backCX - 30} 231 ${backCX - 27} 248 ${backCX - 18} 266 L ${backCX - 12} 266 C ${backCX - 17} 248 ${backCX - 19} 230 ${backCX - 18} 217 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 18} 217 C ${backCX - 19} 231 ${backCX - 17} 248 ${backCX - 11} 266 L ${backCX - 6} 266 C ${backCX - 8} 252 ${backCX - 9} 238 ${backCX - 9} 228 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 9} 228 C ${backCX - 9} 238 ${backCX - 8} 252 ${backCX - 6} 266 L ${backCX - 1} 266 C ${backCX - 2} 252 ${backCX - 2} 239 ${backCX - 2} 229 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX + 28} 215 C ${backCX + 30} 231 ${backCX + 27} 248 ${backCX + 18} 266 L ${backCX + 12} 266 C ${backCX + 16} 248 ${backCX + 18} 230 ${backCX + 17} 217 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 18} 217 C ${backCX + 19} 231 ${backCX + 17} 248 ${backCX + 11} 266 L ${backCX + 6} 266 C ${backCX + 8} 252 ${backCX + 9} 238 ${backCX + 9} 228 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 9} 228 C ${backCX + 9} 238 ${backCX + 8} 252 ${backCX + 6} 266 L ${backCX + 1} 266 C ${backCX + 2} 252 ${backCX + 2} 239 ${backCX + 2} 229 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  {/* Calves Back */}
                  <path d={`M ${backCX - 13} 282 C ${backCX - 21} 297 ${backCX - 21} 315 ${backCX - 14} 333 L ${backCX - 9} 366 L ${backCX - 5} 366 L ${backCX - 9} 333 C ${backCX - 13} 317 ${backCX - 12} 301 ${backCX - 9} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX - 8} 284 L ${backCX - 9} 333 L ${backCX - 5} 366 L ${backCX - 2} 366 L ${backCX - 1} 333 C ${backCX + 1} 317 ${backCX + 1} 301 ${backCX - 3} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />

                  <path d={`M ${backCX + 13} 282 C ${backCX + 21} 297 ${backCX + 21} 315 ${backCX + 14} 333 L ${backCX + 9} 366 L ${backCX + 5} 366 L ${backCX + 9} 333 C ${backCX + 13} 317 ${backCX + 12} 301 ${backCX + 9} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                  <path d={`M ${backCX + 8} 284 L ${backCX + 9} 333 L ${backCX + 5} 366 L ${backCX + 2} 366 L ${backCX + 1} 333 C ${backCX - 1} 317 ${backCX - 1} 301 ${backCX + 3} 284 Z`} fill={legsColor} stroke={strokeColor} strokeWidth={sw} />
                </g>

                {/* Popliteal Fossa */}
                <path d={`M ${backCX - 10} 268 L ${backCX - 14} 274 L ${backCX - 10} 280 L ${backCX - 6} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${backCX + 10} 268 L ${backCX + 14} 274 L ${backCX + 10} 280 L ${backCX + 6} 274 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Calcaneus / Heels */}
                <path d={`M ${backCX - 10} 368 L ${backCX - 13} 387 L ${backCX - 1} 387 L ${backCX - 3} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d={`M ${backCX + 10} 368 L ${backCX + 14} 387 L ${backCX + 1} 387 L ${backCX + 3} 368 Z`} fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Official Heat Legend below model matching reference */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '12px',
          fontSize: '0.78rem',
          color: '#94a3b8',
          fontWeight: 600,
        }}
      >
        <span>Alta</span>
        <div
          style={{
            width: '70px',
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)',
          }}
        />
        <span>Baja</span>
      </div>
    </div>
  );
};
