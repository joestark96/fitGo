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
    if (val === 0) return '#2a3444'; // Neutral slate facet
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
  const neutralColor = '#2a3444';
  const strokeColor = '#10141d';

  const isSel = (g: string) => selectedMuscle === g;
  const toggleMuscle = (g: string) => setSelectedMuscle(selectedMuscle === g ? null : g);

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
          viewBox="0 0 340 350"
          style={{
            width: '100%',
            maxWidth: '360px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5))',
          }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* ======================= MALE MODEL ======================= */}
          {gender === 'male' ? (
            <g className="male-model">
              {/* FRONT VIEW */}
              <g id="male-front">
                {/* Head with athletic jawline & chin */}
                <path d="M 83 24 C 79 25 75 30 75 41 C 75 49 77 56 82 61 L 86 65 L 90 66 L 94 65 L 98 61 C 103 56 105 49 105 41 C 105 30 101 25 97 24 C 94 23 86 23 83 24 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 74 39 C 73 43 73 48 75 51 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 106 39 C 107 43 107 48 105 51 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                {/* Neck */}
                <path d="M 83 65 L 76 76 L 81 76 L 86 66 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 97 65 L 104 76 L 99 76 L 94 66 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 88 67 L 86 76 L 94 76 L 92 67 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Trapezius (Front Slope) -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 74 74 C 67 77 59 82 54 87 L 57 91 C 64 85 74 79 81 77 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 106 74 C 113 77 121 82 126 87 L 123 91 C 116 85 106 79 99 77 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Deltoids Front/Lateral -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 53 88 C 45 95 42 105 43 116 C 44 122 47 126 51 127 C 54 121 57 114 58 106 C 59 98 58 92 54 89 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 127 88 C 135 95 138 105 137 116 C 136 122 133 126 129 127 C 126 121 123 114 122 106 C 121 98 122 92 126 89 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Chest / Pectorals -> PECHO */}
                <g onClick={() => toggleMuscle('pecho')} style={{ cursor: 'pointer' }} filter={isSel('pecho') ? 'url(#glow)' : undefined}>
                  <path d="M 87 79 C 77 79 66 83 58 92 C 59 103 61 111 64 116 C 73 119 82 118 88 114 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 79 C 103 79 114 83 122 92 C 121 103 119 111 116 116 C 107 119 98 118 92 114 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  {/* Biceps & Triceps Lateral */}
                  <path d="M 50 128 C 46 133 42 141 38 150 C 42 153 47 153 51 150 C 55 142 56 134 55 128 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 43 118 C 39 126 38 134 36 143 L 40 146 C 43 137 46 129 48 123 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 130 128 C 134 133 138 141 142 150 C 138 153 133 153 129 150 C 125 142 124 134 125 128 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 137 118 C 141 126 142 134 144 143 L 140 146 C 137 137 134 129 132 123 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Forearms */}
                  <path d="M 38 153 C 33 164 28 176 23 188 C 26 190 29 190 32 188 C 38 176 43 165 46 154 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 47 154 C 44 165 39 176 34 188 C 36 190 39 189 42 186 C 47 174 50 164 52 153 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 142 153 C 147 164 152 176 157 188 C 154 190 151 190 148 188 C 142 176 137 165 134 154 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 133 154 C 136 165 141 176 146 188 C 144 190 141 189 138 186 C 133 174 130 164 128 153 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Hands */}
                <path d="M 22 190 L 16 199 L 19 202 L 24 194 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 25 192 L 18 205 L 21 207 L 27 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 27 192 L 22 208 L 24 209 L 29 192 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 29 191 L 27 207 L 29 207 L 31 190 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 32 189 L 32 203 L 34 202 L 34 188 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                <path d="M 158 190 L 164 199 L 161 202 L 156 194 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 155 192 L 162 205 L 159 207 L 153 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 153 192 L 158 208 L 156 209 L 151 192 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 151 191 L 153 207 L 151 207 L 149 190 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 148 189 L 148 203 L 146 202 L 146 188 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Core / Abs / Serratus -> CORE */}
                <g onClick={() => toggleMuscle('core')} style={{ cursor: 'pointer' }} filter={isSel('core') ? 'url(#glow)' : undefined}>
                  <path d="M 87 117 L 75 119 L 75 129 L 87 128 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 117 L 105 119 L 105 129 L 93 128 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 131 L 76 131 L 76 143 L 87 142 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 131 L 104 131 L 104 143 L 93 142 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 145 L 77 145 L 78 157 L 87 157 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 145 L 103 145 L 102 157 L 93 157 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 159 L 79 159 L 84 173 L 87 173 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 159 L 101 159 L 96 173 L 93 173 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Serratus / Obliques */}
                  <path d="M 67 118 C 63 123 62 128 61 133 L 73 130 L 73 121 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 61 135 C 62 142 63 148 65 154 L 74 146 L 74 134 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 66 156 C 68 163 71 169 75 174 L 77 161 L 75 149 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 113 118 C 117 123 118 128 119 133 L 107 130 L 107 121 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 119 135 C 118 142 117 148 115 154 L 106 146 L 106 134 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 114 156 C 112 163 109 169 105 174 L 103 161 L 105 149 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Groin / Pelvis */}
                <path d="M 88 175 L 85 187 L 95 187 L 92 175 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Legs Front -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  {/* Quads */}
                  <path d="M 74 176 C 66 187 63 203 65 220 C 66 228 69 235 72 242 L 75 236 C 73 222 73 204 77 186 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 79 186 C 75 201 75 219 77 235 L 83 239 C 83 225 84 205 85 187 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 189 C 86 203 85 221 85 237 L 89 241 C 90 233 90 217 89 199 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 106 176 C 114 187 117 203 115 220 C 114 228 111 235 108 242 L 105 236 C 107 222 107 204 103 186 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 101 186 C 105 201 105 219 103 235 L 97 239 C 97 225 96 205 95 187 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 189 C 94 203 95 221 95 237 L 91 241 C 90 233 90 217 91 199 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  {/* Calves & Shins */}
                  <path d="M 78 259 L 75 276 L 76 297 L 79 297 L 80 276 L 81 259 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 72 256 C 67 266 67 278 71 289 L 74 286 C 71 276 72 267 75 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 83 258 C 86 267 86 277 83 287 L 81 287 C 82 277 82 267 82 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 76 299 L 75 309 L 80 309 L 79 299 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 102 259 L 105 276 L 104 297 L 101 297 L 100 276 L 99 259 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 108 256 C 113 266 113 278 109 289 L 106 286 C 109 276 108 267 105 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 97 258 C 94 267 94 277 97 287 L 99 287 C 98 277 98 267 98 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 104 299 L 105 309 L 100 309 L 101 299 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Knees */}
                <path d="M 77 244 L 73 250 L 77 256 L 81 250 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 83 244 L 82 253 L 86 253 L 87 244 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 103 244 L 107 250 L 103 256 L 99 250 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 97 244 L 98 253 L 94 253 L 93 244 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Feet Front */}
                <path d="M 74 311 L 70 325 L 80 325 L 81 311 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 106 311 L 110 325 L 100 325 L 99 311 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>

              {/* BACK VIEW */}
              <g id="male-back">
                {/* Head Back */}
                <path d="M 243 24 C 239 25 235 30 235 41 C 235 49 237 56 242 61 L 246 65 L 250 66 L 254 65 L 258 61 C 263 56 265 49 265 41 C 265 30 261 25 257 24 C 254 23 246 23 243 24 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 247 63 L 246 73 L 254 73 L 253 63 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Back / Trapezius / Lats -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 245 72 L 237 82 L 247 82 L 249 72 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 255 72 L 263 82 L 253 82 L 251 72 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 248 84 L 234 84 C 224 88 215 93 211 99 L 222 101 C 230 95 240 90 248 88 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 84 L 266 84 C 276 88 285 93 289 99 L 278 101 C 270 95 260 90 252 88 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 248 90 C 242 99 238 109 237 119 L 248 133 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 90 C 258 99 262 109 263 119 L 252 133 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Scapular */}
                  <path d="M 221 103 C 228 109 233 116 235 125 L 222 128 C 219 119 219 111 220 104 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 279 103 C 272 109 267 116 265 125 L 278 128 C 281 119 281 111 280 104 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Lats Wings */}
                  <path d="M 235 128 C 235 138 236 149 238 159 C 242 162 247 162 247 156 C 246 146 246 136 247 135 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 221 130 C 224 141 227 152 234 162 L 236 160 C 233 149 232 138 232 127 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 265 128 C 265 138 264 149 262 159 C 258 162 253 162 253 156 C 254 146 254 136 253 135 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 279 130 C 276 141 273 152 266 162 L 264 160 C 267 149 268 138 268 127 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Lower Back */}
                  <path d="M 245 161 L 243 173 L 248 173 L 248 161 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 255 161 L 257 173 L 252 173 L 252 161 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Rear Deltoids -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 210 100 C 205 107 203 115 204 124 C 208 125 213 122 216 117 C 218 110 218 104 219 100 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 290 100 C 295 107 297 115 296 124 C 292 125 287 122 284 117 C 282 110 282 104 281 100 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms Back (Triceps / Forearms) -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d="M 203 126 C 199 134 196 142 193 150 C 197 152 202 151 206 148 C 209 140 211 132 212 126 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 213 127 C 213 135 211 142 208 149 L 213 151 C 216 143 217 135 216 127 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 297 126 C 301 134 304 142 307 150 C 303 152 298 151 294 148 C 291 140 289 132 288 126 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 287 127 C 287 135 289 142 292 149 L 287 151 C 284 143 283 135 284 127 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Forearms Back */}
                  <path d="M 194 153 C 189 163 184 175 179 187 C 182 189 185 189 188 187 C 194 175 199 164 202 154 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 203 154 C 200 164 195 175 190 187 C 192 189 195 188 198 185 C 203 174 206 164 208 153 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 306 153 C 311 163 316 175 321 187 C 318 189 315 189 312 187 C 306 175 301 164 298 154 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 297 154 C 300 164 305 175 310 187 C 308 189 305 188 302 185 C 297 174 294 164 292 153 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Hands Back */}
                <path d="M 178 189 L 172 198 L 175 201 L 180 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 181 191 L 174 204 L 177 206 L 183 192 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 183 191 L 178 207 L 180 208 L 185 191 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 185 190 L 183 206 L 185 206 L 187 189 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 188 188 L 188 202 L 190 201 L 190 187 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                <path d="M 322 189 L 328 198 L 325 201 L 320 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 319 191 L 326 204 L 323 206 L 317 192 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 317 191 L 322 207 L 320 208 L 315 191 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 315 190 L 317 206 L 315 206 L 313 189 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 312 188 L 312 202 L 310 201 L 310 187 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Glutes, Hamstrings & Calves -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  {/* Gluteus Maximus */}
                  <path d="M 248 175 C 241 175 229 177 225 184 C 221 191 221 200 224 208 C 229 214 240 215 248 215 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 175 C 259 175 271 177 275 184 C 279 191 279 200 276 208 C 271 214 260 215 252 215 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  {/* Hamstrings */}
                  <path d="M 226 218 C 224 227 226 237 231 246 L 236 244 C 233 236 232 227 233 218 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 235 218 C 235 227 237 236 241 245 L 245 243 C 243 235 242 226 241 218 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 243 218 C 244 226 245 234 247 242 L 247 218 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 274 218 C 276 227 274 237 269 246 L 264 244 C 267 236 268 227 267 218 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 265 218 C 265 227 263 236 259 245 L 255 243 C 257 235 258 226 259 218 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 257 218 C 256 226 255 234 253 242 L 253 218 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  {/* Calves Back (Iconic Split Gastrocnemius bellies) */}
                  <path d="M 233 257 C 228 266 228 277 231 288 L 236 286 C 234 276 234 267 237 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 239 258 C 241 268 241 278 240 288 L 244 288 C 246 278 246 268 243 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 236 290 L 235 309 L 241 309 L 240 290 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 267 257 C 272 266 272 277 269 288 L 264 286 C 266 276 266 267 263 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 261 258 C 259 268 259 278 260 288 L 256 288 C 254 278 254 268 257 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 264 290 L 265 309 L 259 309 L 260 290 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Back of Knees */}
                <path d="M 234 247 L 243 247 L 240 255 L 236 255 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 266 247 L 257 247 L 260 255 L 264 255 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Heels */}
                <path d="M 235 311 L 232 325 L 240 325 L 241 311 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 265 311 L 268 325 L 260 325 L 259 311 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>
            </g>
          ) : (
            /* ======================= FEMALE MODEL ======================= */
            <g className="female-model">
              {/* FRONT VIEW */}
              <g id="female-front">
                {/* Head: softer feminine oval */}
                <path d="M 84 25 C 80 26 77 31 77 41 C 77 48 79 55 83 59 L 87 64 L 90 65 L 93 64 L 97 59 C 101 55 103 48 103 41 C 103 31 100 26 96 25 C 93 24 87 24 84 25 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                {/* Slender neck */}
                <path d="M 84 64 L 79 74 L 83 75 L 87 65 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 96 64 L 101 74 L 97 75 L 93 65 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 88 66 L 87 75 L 93 75 L 92 66 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Trapezius / Clavicle slope -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 77 73 C 71 76 64 81 60 86 L 63 89 C 69 84 76 79 82 76 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 103 73 C 109 76 116 81 120 86 L 117 89 C 111 84 104 79 98 76 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Shoulders / Deltoids (athletic, toned feminine) -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 59 87 C 52 93 50 102 51 112 C 52 117 55 120 58 122 C 61 117 63 111 64 103 C 65 96 64 91 60 88 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 121 87 C 128 93 130 102 129 112 C 128 117 125 120 122 122 C 119 117 117 111 116 103 C 115 96 116 91 120 88 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Chest / Pectorals / Sports-Bra aesthetic -> PECHO */}
                <g onClick={() => toggleMuscle('pecho')} style={{ cursor: 'pointer' }} filter={isSel('pecho') ? 'url(#glow)' : undefined}>
                  <path d="M 87 77 C 79 77 71 81 64 90 C 64 99 66 109 70 115 C 76 117 83 115 88 111 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 77 C 101 77 109 81 116 90 C 116 99 114 109 110 115 C 104 117 97 115 92 111 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d="M 57 123 C 53 129 49 137 46 146 C 49 149 53 148 56 145 C 59 138 61 130 60 124 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 51 114 C 48 121 46 130 45 139 L 48 141 C 51 133 53 125 55 119 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 123 123 C 127 129 131 137 134 146 C 131 149 127 148 124 145 C 121 138 119 130 120 124 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 129 114 C 132 121 134 130 135 139 L 132 141 C 129 133 127 125 125 119 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Forearms */}
                  <path d="M 45 149 C 41 160 36 172 32 184 C 34 186 37 186 39 184 C 44 173 48 162 51 151 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 52 150 C 49 161 45 172 41 184 C 43 186 46 185 48 182 C 53 171 56 161 57 150 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 135 149 C 139 160 144 172 148 184 C 146 186 143 186 141 184 C 136 173 132 162 129 151 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 128 150 C 131 161 135 172 139 184 C 137 186 134 185 132 182 C 127 171 124 161 123 150 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Slender Hands */}
                <path d="M 31 186 L 25 194 L 28 197 L 33 189 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 34 187 L 28 199 L 30 201 L 35 188 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 36 187 L 32 201 L 34 202 L 38 187 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 39 185 L 40 197 L 42 196 L 41 184 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                <path d="M 149 186 L 155 194 L 152 197 L 147 189 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 146 187 L 152 199 L 150 201 L 145 188 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 144 187 L 148 201 L 146 202 L 142 187 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 141 185 L 140 197 L 138 196 L 139 184 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Core / Slim Feminine Waist -> CORE */}
                <g onClick={() => toggleMuscle('core')} style={{ cursor: 'pointer' }} filter={isSel('core') ? 'url(#glow)' : undefined}>
                  <path d="M 87 114 L 76 116 L 77 127 L 87 126 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 114 L 104 116 L 103 127 L 93 126 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 128 L 78 129 L 80 142 L 87 141 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 128 L 102 129 L 100 142 L 93 141 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 143 L 80 144 L 83 158 L 87 158 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 143 L 100 144 L 97 158 L 93 158 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Obliques */}
                  <path d="M 72 117 C 69 123 68 129 68 135 L 75 132 L 75 122 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 68 137 C 68 144 70 152 74 160 L 78 150 L 76 137 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 108 117 C 111 123 112 129 112 135 L 105 132 L 105 122 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 112 137 C 112 144 110 152 106 160 L 102 150 L 104 137 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Pelvis & Hips */}
                <path d="M 88 160 L 85 174 L 95 174 L 92 160 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 75 162 C 70 167 66 174 65 182 L 72 181 C 73 174 76 168 79 164 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 105 162 C 110 167 114 174 115 182 L 108 181 C 107 174 104 168 101 164 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Quads & Legs -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  <path d="M 72 183 C 65 194 63 208 65 222 C 67 229 69 235 73 241 L 76 235 C 73 222 73 206 77 190 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 79 190 C 76 203 76 218 78 233 L 83 237 C 83 224 84 207 85 191 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 192 C 86 204 85 220 85 235 L 89 239 C 90 231 90 217 89 201 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 108 183 C 115 194 117 208 115 222 C 113 229 111 235 107 241 L 104 235 C 107 222 107 206 103 190 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 101 190 C 104 203 104 218 102 233 L 97 237 C 97 224 96 207 95 191 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 93 192 C 94 204 95 220 95 235 L 91 239 C 90 231 90 217 91 201 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  {/* Calves & Shins */}
                  <path d="M 78 258 L 76 275 L 77 296 L 80 296 L 80 275 L 81 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 73 256 C 69 265 69 276 72 287 L 75 285 C 73 275 73 266 75 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 83 258 C 85 267 85 276 83 286 L 81 286 C 82 276 82 267 82 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 77 298 L 76 308 L 80 308 L 79 298 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 102 258 L 104 275 L 103 296 L 100 296 L 100 275 L 99 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 107 256 C 111 265 111 276 108 287 L 105 285 C 107 275 107 266 105 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 97 258 C 95 267 95 276 97 286 L 99 286 C 98 276 98 267 98 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 103 298 L 104 308 L 100 308 L 101 298 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Knees */}
                <path d="M 78 243 L 74 249 L 78 255 L 82 249 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 102 243 L 106 249 L 102 255 L 98 249 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Feet */}
                <path d="M 75 310 L 72 324 L 80 324 L 81 310 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 105 310 L 108 324 L 100 324 L 99 310 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>

              {/* BACK VIEW */}
              <g id="female-back">
                {/* Head Back */}
                <path d="M 244 25 C 240 26 237 31 237 41 C 237 48 239 55 243 59 L 247 64 L 250 65 L 253 64 L 257 59 C 261 55 263 48 263 41 C 263 31 260 26 256 25 C 253 24 247 24 244 25 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 247 64 L 246 73 L 254 73 L 253 64 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Trapezius & Lats -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 245 73 L 238 82 L 247 82 L 248 73 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 255 73 L 262 82 L 253 82 L 252 73 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 248 84 L 235 84 C 227 88 220 93 216 98 L 225 100 C 232 95 240 90 248 88 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 84 L 265 84 C 273 88 280 93 284 98 L 275 100 C 268 95 260 90 252 88 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 248 90 C 243 98 240 108 239 117 L 248 131 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 90 C 257 98 260 108 261 117 L 252 131 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Scapular */}
                  <path d="M 224 102 C 230 108 234 115 236 123 L 225 126 C 223 118 223 110 224 103 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 276 102 C 270 108 266 115 264 123 L 275 126 C 277 118 277 110 276 103 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Lats Wings */}
                  <path d="M 236 126 C 236 135 237 145 239 155 C 243 158 247 158 247 152 C 246 143 246 134 247 133 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 225 128 C 227 138 230 148 236 157 L 238 155 C 235 146 234 136 234 126 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 264 126 C 264 135 263 145 261 155 C 257 158 253 158 253 152 C 254 143 254 134 253 133 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 275 128 C 273 138 270 148 264 157 L 262 155 C 265 146 266 136 266 126 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  {/* Lower Back */}
                  <path d="M 246 157 L 244 167 L 248 167 L 248 157 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 254 157 L 256 167 L 252 167 L 252 157 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Rear Delts -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 215 99 C 211 106 209 113 210 121 C 214 122 218 119 221 115 C 223 109 223 103 223 99 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 285 99 C 289 106 291 113 290 121 C 286 122 282 119 279 115 C 277 109 277 103 277 99 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms Back -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d="M 209 123 C 205 130 202 138 200 146 C 203 148 207 147 211 144 C 213 137 215 130 216 124 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 291 123 C 295 130 298 138 300 146 C 297 148 293 147 289 144 C 287 137 285 130 284 124 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 200 149 C 196 159 192 171 188 183 C 190 185 193 185 195 183 C 200 172 204 161 207 150 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 300 149 C 304 159 308 171 312 183 C 310 185 307 185 305 183 C 300 172 296 161 293 150 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Hands Back */}
                <path d="M 187 186 L 181 194 L 184 197 L 189 189 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 190 187 L 184 199 L 186 201 L 191 188 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 313 186 L 319 194 L 316 197 L 311 189 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 310 187 L 316 199 L 314 201 L 309 188 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Glutes, Hamstrings & Calves -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  {/* Gluteus Maximus */}
                  <path d="M 248 169 C 240 169 227 172 222 180 C 218 188 218 199 222 208 C 228 216 240 217 248 217 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 169 C 260 169 273 172 278 180 C 282 188 282 199 278 208 C 272 216 260 217 252 217 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  {/* Hamstrings */}
                  <path d="M 224 220 C 222 229 224 238 229 246 L 234 244 C 231 237 230 228 231 220 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 233 220 C 233 229 235 238 239 246 L 243 244 C 241 236 240 227 240 220 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 276 220 C 278 229 276 238 271 246 L 266 244 C 269 237 270 228 269 220 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 267 220 C 267 229 265 238 261 246 L 257 244 C 259 236 260 227 260 220 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  {/* Calves Back */}
                  <path d="M 233 257 C 229 266 229 277 232 288 L 236 286 C 234 276 234 267 236 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 239 258 C 241 268 241 278 240 288 L 243 288 C 245 278 245 268 242 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 236 290 L 235 309 L 240 309 L 239 290 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 267 257 C 271 266 271 277 268 288 L 264 286 C 266 276 266 267 264 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 261 258 C 259 268 259 278 260 288 L 257 288 C 255 278 255 268 258 258 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 264 290 L 265 309 L 260 309 L 261 290 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Back of Knees */}
                <path d="M 233 248 L 242 248 L 239 255 L 235 255 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 267 248 L 258 248 L 261 255 L 265 255 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Heels */}
                <path d="M 235 311 L 232 325 L 239 325 L 240 311 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 265 311 L 268 325 L 261 325 L 260 311 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Heatmap Legend Bar (Exact Match to Reference: Alta [Blue Gradient Bar] Baja) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '12px',
        }}
      >
        <span
          style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#94a3b8',
            letterSpacing: '0.3px',
          }}
        >
          Alta
        </span>
        <div
          style={{
            width: '100px',
            height: '9px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #3b82f6 0%, #2563eb 45%, #1d4ed8 75%, #2a3444 100%)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
          }}
        />
        <span
          style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#94a3b8',
            letterSpacing: '0.3px',
          }}
        >
          Baja
        </span>
      </div>
    </div>
  );
};
