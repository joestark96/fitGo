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
    if (val === 0) return '#2d3748'; // Neutral slate facet
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
  const neutralColor = '#2d3748';
  const strokeColor = '#0f131a';

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
          viewBox="0 0 360 330"
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
              {/* FRONT VIEW (CX = 95) */}
              <g id="male-front">
                {/* Head & Neck */}
                <path d="M 87 22 C 81 23 76 30 76 41 C 76 50 79 58 84 63 L 90 68 L 95 69 L 100 68 L 106 63 C 111 58 114 50 114 41 C 114 30 109 23 103 22 C 99 21 91 21 87 22 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 87 67 L 79 79 L 85 79 L 91 68 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 103 67 L 111 79 L 105 79 L 99 68 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 93 69 L 91 79 L 99 79 L 97 69 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Trapezius Slopes (Front) -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 77 76 C 68 79 56 86 49 93 L 53 98 C 63 90 75 84 84 81 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 113 76 C 122 79 134 86 141 93 L 137 98 C 127 90 115 84 106 81 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Shoulders / Deltoids -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 48 93 C 38 102 35 114 36 126 C 37 132 41 137 47 138 C 51 130 55 121 56 111 C 57 103 55 96 50 94 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 142 93 C 152 102 155 114 154 126 C 153 132 149 137 143 138 C 139 130 135 121 134 111 C 133 103 135 96 140 94 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Pectorals / Chest -> PECHO */}
                <g onClick={() => toggleMuscle('pecho')} style={{ cursor: 'pointer' }} filter={isSel('pecho') ? 'url(#glow)' : undefined}>
                  <path d="M 92 83 C 78 83 63 88 55 99 C 56 113 59 123 64 129 C 74 132 84 131 92 126 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 83 C 112 83 127 88 135 99 C 134 113 131 123 126 129 C 116 132 106 131 98 126 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d="M 46 139 C 41 145 37 152 33 160 C 38 163 43 162 47 159 C 52 151 53 144 52 139 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 37 128 C 32 137 31 146 30 154 L 35 156 C 38 149 41 140 45 133 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 144 139 C 149 145 153 152 157 160 C 152 163 147 162 143 159 C 138 151 137 144 138 139 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 153 128 C 158 137 159 146 160 154 L 155 156 C 152 149 149 140 145 133 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 32 162 C 27 172 22 182 17 192 C 20 194 24 194 27 192 C 33 182 38 172 41 162 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 42 163 C 38 173 34 183 29 193 C 32 194 35 194 38 191 C 44 181 48 171 49 162 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 158 162 C 163 172 168 182 173 192 C 170 194 166 194 163 192 C 157 182 152 172 149 162 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 148 163 C 152 173 156 183 161 193 C 158 194 155 194 152 191 C 146 181 142 171 141 162 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Hands */}
                <path d="M 16 194 L 9 202 L 12 205 L 17 198 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 19 195 L 12 208 L 15 210 L 21 197 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 22 195 L 17 210 L 19 211 L 24 196 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 25 194 L 22 209 L 24 209 L 27 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 27 192 L 28 205 L 30 204 L 29 191 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                <path d="M 174 194 L 181 202 L 178 205 L 173 198 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 171 195 L 178 208 L 175 210 L 169 197 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 168 195 L 173 210 L 171 211 L 166 196 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 165 194 L 168 209 L 166 209 L 163 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 163 192 L 162 205 L 160 204 L 161 191 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Core / 6-Pack + Obliques -> CORE */}
                <g onClick={() => toggleMuscle('core')} style={{ cursor: 'pointer' }} filter={isSel('core') ? 'url(#glow)' : undefined}>
                  <path d="M 92 130 L 79 132 L 79 142 L 92 141 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 130 L 111 132 L 111 142 L 98 141 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 92 144 L 80 144 L 80 155 L 92 154 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 144 L 110 144 L 110 155 L 98 154 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 92 157 L 81 157 L 82 169 L 92 169 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 157 L 109 157 L 108 169 L 98 169 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 92 171 L 84 171 L 89 184 L 92 184 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 171 L 106 171 L 101 184 L 98 184 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 68 131 C 63 137 61 143 60 148 L 76 144 L 76 133 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 61 150 C 62 157 65 164 68 170 L 78 161 L 78 149 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 69 172 C 72 178 76 183 81 188 L 83 175 L 80 163 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 122 131 C 127 137 129 143 130 148 L 114 144 L 114 133 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 129 150 C 128 157 125 164 122 170 L 112 161 L 112 149 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 121 172 C 118 178 114 183 109 188 L 107 175 L 110 163 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Pelvis / Groin */}
                <path d="M 93 185 L 89 197 L 101 197 L 97 185 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Legs Front -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  <path d="M 78 187 C 69 198 66 212 68 226 C 69 232 72 238 76 244 L 79 238 C 77 227 77 212 81 197 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 83 197 C 79 210 79 225 81 238 L 87 242 C 87 230 88 214 89 198 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 90 200 C 89 212 89 227 88 240 L 92 244 C 93 236 94 223 93 208 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 112 187 C 121 198 124 212 122 226 C 121 232 118 238 114 244 L 111 238 C 113 227 113 212 109 197 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 107 197 C 111 210 111 225 109 238 L 103 242 C 103 230 102 214 101 198 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 100 200 C 101 212 101 227 102 240 L 98 244 C 97 236 96 223 97 208 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 82 260 L 79 274 L 80 293 L 83 293 L 84 274 L 85 260 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 76 257 C 71 266 71 276 74 286 L 78 283 C 75 275 75 267 79 259 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 87 259 C 90 267 90 276 87 285 L 85 285 C 86 276 86 267 86 259 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 80 295 L 79 304 L 84 304 L 83 295 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 108 260 L 111 274 L 110 293 L 107 293 L 106 274 L 105 260 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 114 257 C 119 266 119 276 116 286 L 112 283 C 115 275 115 267 111 259 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 103 259 C 100 267 100 276 103 285 L 105 285 C 104 276 104 267 104 259 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 110 295 L 111 304 L 106 304 L 107 295 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Knees */}
                <path d="M 81 246 L 77 251 L 81 257 L 85 251 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 87 246 L 86 254 L 90 254 L 91 246 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 109 246 L 113 251 L 109 257 L 105 251 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 103 246 L 104 254 L 100 254 L 99 246 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Feet */}
                <path d="M 78 306 L 74 318 L 84 318 L 85 306 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 112 306 L 116 318 L 106 318 L 105 306 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>

              {/* BACK VIEW (CX = 265) */}
              <g id="male-back">
                {/* Head Back */}
                <path d="M 257 22 C 251 23 246 30 246 41 C 246 50 249 58 254 63 L 260 68 L 265 69 L 270 68 L 276 63 C 281 58 284 50 284 41 C 284 30 279 23 273 22 C 269 21 261 21 257 22 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 261 68 L 260 78 L 270 78 L 269 68 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Trapezius / Back / Lats -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 260 78 L 251 88 L 262 88 L 263 78 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 270 78 L 279 88 L 268 88 L 267 78 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 263 90 L 247 90 C 235 94 225 100 220 107 L 232 109 C 241 103 253 97 263 95 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 267 90 L 283 90 C 295 94 305 100 310 107 L 298 109 C 289 103 277 97 267 95 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 263 97 C 256 107 251 117 250 128 L 263 142 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 267 97 C 274 107 279 117 280 128 L 267 142 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 233 111 C 241 118 247 126 249 135 L 235 138 C 231 129 231 120 232 112 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 297 111 C 289 118 283 126 281 135 L 295 138 C 299 129 299 120 298 112 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 249 138 C 249 149 251 160 253 171 C 258 174 263 174 263 167 C 262 157 262 146 263 145 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 233 140 C 237 152 242 163 249 174 L 251 172 C 247 160 245 149 246 137 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 281 138 C 281 149 279 160 277 171 C 272 174 267 174 267 167 C 268 157 268 146 267 145 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 297 140 C 293 152 288 163 281 174 L 279 172 C 283 160 285 149 284 137 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 260 173 L 258 186 L 263 186 L 263 173 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 270 173 L 272 186 L 267 186 L 267 173 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Rear Deltoids -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 219 108 C 212 116 209 125 210 135 C 215 136 221 133 225 127 C 228 119 228 112 227 108 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 311 108 C 318 116 321 125 320 135 C 315 136 309 133 305 127 C 302 119 302 112 303 108 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms Back -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d="M 209 137 C 204 145 200 153 197 161 C 201 164 207 162 211 159 C 215 151 217 143 218 137 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 219 138 C 219 146 217 154 214 161 L 219 163 C 223 155 224 146 223 138 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 321 137 C 326 145 330 153 333 161 C 329 164 323 162 319 159 C 315 151 313 143 312 137 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 311 138 C 311 146 313 154 316 161 L 311 163 C 307 155 306 146 307 138 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 198 163 C 192 173 187 184 182 195 C 185 197 189 197 192 195 C 198 184 204 174 207 164 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 208 164 C 204 174 199 185 194 196 C 196 198 200 197 203 194 C 209 183 213 173 215 163 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 332 163 C 338 173 343 184 348 195 C 345 197 341 197 338 195 C 332 184 326 174 323 164 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 322 164 C 326 174 331 185 336 196 C 334 198 330 197 327 194 C 321 183 317 173 315 163 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Hands Back */}
                <path d="M 181 197 L 174 205 L 177 208 L 183 201 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 184 198 L 177 211 L 180 213 L 186 200 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 187 198 L 182 213 L 184 214 L 189 199 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 190 197 L 188 212 L 190 212 L 192 196 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                <path d="M 349 197 L 356 205 L 353 208 L 347 201 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 346 198 L 353 211 L 350 213 L 344 200 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 343 198 L 338 213 L 336 214 L 341 199 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 340 197 L 342 212 L 340 212 L 338 196 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Gluteus Maximus, Hamstrings & Calves -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  <path d="M 263 188 C 255 188 243 190 238 198 C 234 206 234 215 237 224 C 243 231 254 232 263 232 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 267 188 C 275 188 287 190 292 198 C 296 206 296 215 293 224 C 287 231 276 232 267 232 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 239 234 C 237 244 239 254 244 264 L 250 262 C 247 253 246 244 247 234 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 248 234 C 248 244 250 254 254 263 L 259 261 C 257 252 256 242 255 234 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 256 234 C 257 243 258 251 260 260 L 260 234 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 291 234 C 293 244 291 254 286 264 L 280 262 C 283 253 284 244 283 234 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 282 234 C 282 244 280 254 276 263 L 271 261 C 273 252 274 242 275 234 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 274 234 C 273 243 272 251 270 260 L 270 234 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 246 274 C 241 283 241 294 244 304 L 249 302 C 247 293 247 284 250 275 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 275 C 254 285 254 295 253 304 L 257 304 C 259 295 259 285 256 275 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 249 306 L 248 320 L 254 320 L 253 306 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 284 274 C 289 283 289 294 286 304 L 281 302 C 283 293 283 284 280 275 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 278 275 C 276 285 276 295 277 304 L 273 304 C 271 295 271 285 274 275 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 281 306 L 282 320 L 276 320 L 277 306 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Back of Knees */}
                <path d="M 247 265 L 257 265 L 254 272 L 249 272 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 283 265 L 273 265 L 276 272 L 281 272 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Heels */}
                <path d="M 248 322 L 245 330 L 253 330 L 254 322 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 282 322 L 285 330 L 277 330 L 276 322 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>
            </g>
          ) : (
            /* ======================= FEMALE MODEL ======================= */
            <g className="female-model">
              {/* FRONT VIEW (CX = 95) */}
              <g id="female-front">
                <path d="M 88 23 C 83 24 79 30 79 40 C 79 48 81 56 86 61 L 91 66 L 95 67 L 99 66 L 104 61 C 109 56 111 48 111 40 C 111 30 107 24 102 23 C 98 22 92 22 88 23 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 88 66 L 82 77 L 87 78 L 92 67 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 102 66 L 108 77 L 103 78 L 98 67 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 93 68 L 91 78 L 99 78 L 97 68 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Trapezius -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 80 75 C 72 78 63 84 58 90 L 62 94 C 69 88 78 83 86 80 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 110 75 C 118 78 127 84 132 90 L 128 94 C 121 88 112 83 104 80 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Deltoids -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 57 91 C 49 98 46 108 47 119 C 48 125 52 129 56 131 C 60 125 62 117 63 108 C 64 100 62 94 58 92 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 133 91 C 141 98 144 108 143 119 C 142 125 138 129 134 131 C 130 125 128 117 127 108 C 126 100 128 94 132 92 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Chest / Sports Bra -> PECHO */}
                <g onClick={() => toggleMuscle('pecho')} style={{ cursor: 'pointer' }} filter={isSel('pecho') ? 'url(#glow)' : undefined}>
                  <path d="M 92 81 C 81 81 70 86 62 97 C 62 110 65 122 71 129 C 78 132 86 130 92 124 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 81 C 109 81 120 86 128 97 C 128 110 125 122 119 129 C 112 132 104 130 98 124 Z" fill={chestColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d="M 55 132 C 50 139 46 147 43 156 C 47 159 51 158 55 155 C 59 147 60 139 59 133 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 47 122 C 43 130 41 140 40 149 L 44 151 C 47 143 50 134 52 127 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 135 132 C 140 139 144 147 147 156 C 143 159 139 158 135 155 C 131 147 130 139 131 133 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 143 122 C 147 130 149 140 150 149 L 146 151 C 143 143 140 134 138 127 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 42 159 C 37 170 32 181 27 192 C 30 194 33 194 36 192 C 42 181 46 170 49 160 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 50 160 C 47 171 42 182 37 193 C 40 195 43 194 46 191 C 51 180 55 169 56 160 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 148 159 C 153 170 158 181 163 192 C 160 194 157 194 154 192 C 148 181 144 170 141 160 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 140 160 C 143 171 148 182 153 193 C 150 195 147 194 144 191 C 139 180 135 169 134 160 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Slender Hands */}
                <path d="M 26 194 L 19 203 L 22 206 L 27 198 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 29 196 L 23 209 L 26 211 L 31 198 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 32 196 L 27 210 L 29 211 L 34 197 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 35 194 L 35 208 L 38 207 L 37 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                <path d="M 164 194 L 171 203 L 168 206 L 163 198 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 161 196 L 167 209 L 164 211 L 159 198 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 158 196 L 163 210 L 161 211 L 156 197 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 155 194 L 155 208 L 152 207 L 153 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Core / Waist -> CORE */}
                <g onClick={() => toggleMuscle('core')} style={{ cursor: 'pointer' }} filter={isSel('core') ? 'url(#glow)' : undefined}>
                  <path d="M 92 127 L 79 129 L 81 141 L 92 140 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 127 L 111 129 L 109 141 L 98 140 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 92 142 L 82 143 L 84 156 L 92 155 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 142 L 108 143 L 106 156 L 98 155 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 92 158 L 84 159 L 88 172 L 92 172 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 98 158 L 106 159 L 102 172 L 98 172 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 74 130 C 70 137 68 144 69 151 L 79 146 L 77 134 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 69 153 C 70 162 73 171 78 178 L 82 168 L 79 156 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 116 130 C 120 137 122 144 121 151 L 111 146 L 113 134 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 121 153 C 120 162 117 171 112 178 L 108 168 L 111 156 Z" fill={coreColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Pelvis & Hips */}
                <path d="M 93 174 L 89 187 L 101 187 L 97 174 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 79 176 C 72 182 68 190 67 199 L 75 198 C 76 190 80 183 83 179 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 111 176 C 118 182 122 190 123 199 L 115 198 C 114 190 110 183 107 179 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Quads & Legs -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  <path d="M 75 200 C 67 211 65 225 67 239 C 69 246 72 252 76 258 L 79 252 C 76 240 76 224 80 208 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 82 208 C 78 221 78 236 80 250 L 85 254 C 86 242 87 225 88 209 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 90 211 C 89 223 88 238 88 252 L 92 256 C 93 248 94 235 93 220 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 115 200 C 123 211 125 225 123 239 C 121 246 118 252 114 258 L 111 252 C 114 240 114 224 110 208 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 108 208 C 112 221 112 236 110 250 L 105 254 C 104 242 103 225 102 209 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 100 211 C 101 223 102 238 102 252 L 98 256 C 97 248 96 235 97 220 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 81 273 L 79 288 L 80 306 L 83 306 L 83 288 L 84 273 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 76 271 C 72 280 72 290 75 300 L 78 298 C 76 289 76 281 78 273 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 86 273 C 88 281 88 290 86 299 L 84 299 C 85 290 85 281 85 273 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 80 308 L 79 317 L 83 317 L 82 308 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 109 273 L 111 288 L 110 306 L 107 306 L 107 288 L 106 273 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 114 271 C 118 280 118 290 115 300 L 112 298 C 114 289 114 281 112 273 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 104 273 C 102 281 102 290 104 299 L 106 299 C 105 290 105 281 105 273 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 110 308 L 111 317 L 107 317 L 108 308 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Knees */}
                <path d="M 81 260 L 77 265 L 81 271 L 85 265 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 109 260 L 113 265 L 109 271 L 105 265 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Feet */}
                <path d="M 78 319 L 75 330 L 83 330 L 84 319 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 112 319 L 115 330 L 107 330 L 106 319 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
              </g>

              {/* BACK VIEW (CX = 265) */}
              <g id="female-back">
                <path d="M 258 23 C 253 24 249 30 249 40 C 249 48 251 56 256 61 L 261 66 L 265 67 L 269 66 L 274 61 C 279 56 281 48 281 40 C 281 30 277 24 272 23 C 268 22 262 22 258 23 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 262 67 L 261 77 L 269 77 L 268 67 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Trapezius & Lats -> ESPALDA */}
                <g onClick={() => toggleMuscle('espalda')} style={{ cursor: 'pointer' }} filter={isSel('espalda') ? 'url(#glow)' : undefined}>
                  <path d="M 260 77 L 253 86 L 262 86 L 263 77 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 270 77 L 277 86 L 268 86 L 267 77 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 263 88 L 249 88 C 240 92 232 97 228 103 L 238 105 C 246 99 255 94 263 92 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 267 88 L 281 88 C 290 92 298 97 302 103 L 292 105 C 284 99 275 94 267 92 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 263 95 C 257 103 254 113 253 122 L 263 134 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 267 95 C 273 103 276 113 277 122 L 267 134 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 237 107 C 244 113 248 120 250 128 L 238 131 C 235 123 235 115 236 108 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 293 107 C 286 113 282 120 280 128 L 292 131 C 295 123 295 115 294 108 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 250 131 C 250 140 251 150 253 160 C 257 163 261 163 261 157 C 260 148 260 139 261 138 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 238 133 C 241 143 244 153 250 162 L 252 160 C 249 151 247 141 248 131 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 280 131 C 280 140 279 150 277 160 C 273 163 269 163 269 157 C 270 148 270 139 269 138 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 292 133 C 289 143 286 153 280 162 L 278 160 C 281 151 283 141 282 131 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 261 162 L 259 172 L 263 172 L 263 162 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 269 162 L 271 172 L 267 172 L 267 162 Z" fill={backColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Rear Delts -> HOMBROS */}
                <g onClick={() => toggleMuscle('hombros')} style={{ cursor: 'pointer' }} filter={isSel('hombros') ? 'url(#glow)' : undefined}>
                  <path d="M 227 104 C 222 111 220 119 221 127 C 226 128 230 125 233 120 C 235 113 235 107 235 104 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 303 104 C 308 111 310 119 309 127 C 304 128 300 125 297 120 C 295 113 295 107 295 104 Z" fill={shouldersColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Arms Back -> BRAZOS */}
                <g onClick={() => toggleMuscle('brazos')} style={{ cursor: 'pointer' }} filter={isSel('brazos') ? 'url(#glow)' : undefined}>
                  <path d="M 221 129 C 217 136 214 144 212 152 C 215 154 219 153 223 150 C 225 143 227 136 228 130 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 309 129 C 313 136 316 144 318 152 C 315 154 311 153 307 150 C 305 143 303 136 302 130 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 212 155 C 208 165 204 177 200 188 C 202 190 205 190 207 188 C 212 178 216 167 218 156 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 318 155 C 322 165 326 177 330 188 C 328 190 325 190 323 188 C 318 178 314 167 312 156 Z" fill={armsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Hands Back */}
                <path d="M 199 191 L 193 199 L 196 202 L 201 194 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 202 192 L 196 204 L 198 206 L 203 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 331 191 L 337 199 L 334 202 L 329 194 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />
                <path d="M 328 192 L 334 204 L 332 206 L 327 193 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="0.8" />

                {/* Gluteus Maximus, Hamstrings & Calves -> PIERNAS */}
                <g onClick={() => toggleMuscle('piernas')} style={{ cursor: 'pointer' }} filter={isSel('piernas') ? 'url(#glow)' : undefined}>
                  <path d="M 263 174 C 255 174 241 177 236 186 C 231 194 231 205 235 214 C 242 222 254 223 263 223 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 267 174 C 275 174 289 177 294 186 C 299 194 299 205 295 214 C 288 222 276 223 267 223 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 237 226 C 235 235 237 244 242 252 L 247 250 C 244 243 243 234 244 226 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 246 226 C 246 235 248 244 252 252 L 256 250 C 254 242 253 233 253 226 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 293 226 C 295 235 293 244 288 252 L 283 250 C 286 243 287 234 286 226 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 284 226 C 284 235 282 244 278 252 L 274 250 C 276 242 277 233 277 226 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 246 263 C 242 272 242 283 245 294 L 249 292 C 247 282 247 273 249 264 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 252 264 C 254 274 254 284 253 294 L 256 294 C 258 284 258 274 255 264 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 249 296 L 248 315 L 253 315 L 252 296 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />

                  <path d="M 284 263 C 288 272 288 283 285 294 L 281 292 C 283 282 283 273 281 264 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 278 264 C 276 274 276 284 277 294 L 274 294 C 272 284 272 274 275 264 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                  <path d="M 281 296 L 282 315 L 277 315 L 278 296 Z" fill={legsColor} stroke={strokeColor} strokeWidth="1.2" />
                </g>

                {/* Back of Knees */}
                <path d="M 246 254 L 255 254 L 252 261 L 248 261 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 284 254 L 275 254 L 278 261 L 282 261 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />

                {/* Heels */}
                <path d="M 248 317 L 245 329 L 252 329 L 253 317 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
                <path d="M 282 317 L 285 329 L 278 329 L 277 317 Z" fill={neutralColor} stroke={strokeColor} strokeWidth="1" />
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
            background: 'linear-gradient(to right, #3b82f6 0%, #2563eb 45%, #1d4ed8 75%, #2d3748 100%)',
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
