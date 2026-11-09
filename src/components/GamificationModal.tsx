import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonBadge,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useApp } from '../context/AppContext';
import { ATHLETE_RANKS } from '../services/gamificationService';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'missions' | 'achievements' | 'tonnage';
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'missions',
}) => {
  const { gamification } = useApp();
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements' | 'tonnage'>(initialTab);

  const {
    activeStreakDays,
    workoutStreakDays,
    nutritionStreakDays,
    shieldsAvailable,
    totalXp,
    level,
    currentLevelXp,
    nextLevelXp,
    levelProgressPercent,
    rank,
    nextRank,
    totalVolumeKg,
    currentTonnageMilestone,
    nextTonnageMilestone,
    tonnageProgressPercent,
    allMilestones,
    achievements,
    unlockedAchievementsCount,
    dailyMissions,
    weeklyChallenges,
    completedDailyMissionsCount,
    totalPRsCount,
    weeklyMuscleGroupsTrained,
  } = gamification;

  const muscleLabels: Record<string, string> = {
    pecho: 'Pecho',
    espalda: 'Espalda',
    piernas: 'Piernas',
    hombros: 'Hombros',
    brazos: 'Brazos',
    core: 'Core',
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar className="fit-navbar" style={{ ['--background' as any]: '#10141d' }}>
          <IonTitle style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
            Centro de Atleta & Logros
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} color="medium">
              <IonIcon icon={closeOutline} style={{ fontSize: '1.5rem' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ ['--background' as any]: '#0d1117' }}>
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', color: '#f8fafc' }}>
          {/* ================= HERO LEVEL & RANK CARD ================= */}
          <div
            style={{
              background: rank.gradient,
              borderRadius: '20px',
              padding: '20px 18px',
              marginBottom: '16px',
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '18px',
                    background: 'rgba(15, 23, 42, 0.45)',
                    border: '2px solid rgba(255, 255, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    flexShrink: 0,
                  }}
                >
                  {rank.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.9px',
                      fontWeight: 800,
                      color: 'rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    RANGO ACTUAL • NIVEL {level}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px' }}>
                    {rank.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>
                    ⚡ {totalXp.toLocaleString()} XP totales • 🏆 {totalPRsCount} Récords (PRs)
                  </div>
                </div>
              </div>
            </div>

            {/* Level XP Bar */}
            <div style={{ marginTop: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: 'rgba(255, 255, 255, 0.92)',
                }}
              >
                <span>Progreso a Nivel {level + 1}</span>
                <span>
                  {currentLevelXp} / {nextLevelXp} XP ({levelProgressPercent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${levelProgressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #fde047 0%, #f97316 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              {nextRank && (
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '0.73rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    Próximo rango: <strong>{nextRank.icon} {nextRank.title}</strong> (Nivel {nextRank.minLevel})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ================= STREAKS & SHIELDS GRID ================= */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                background: '#161b24',
                border: '1px solid #263042',
                borderRadius: '14px',
                padding: '10px 6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem' }}>🔥</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fb923c', marginTop: '2px' }}>
                {activeStreakDays}d
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>Racha General</div>
            </div>

            <div
              style={{
                background: '#161b24',
                border: '1px solid #263042',
                borderRadius: '14px',
                padding: '10px 6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem' }}>🏋️</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                {workoutStreakDays}d
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>Racha Gym</div>
            </div>

            <div
              style={{
                background: '#161b24',
                border: '1px solid #263042',
                borderRadius: '14px',
                padding: '10px 6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem' }}>🥗</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
                {nutritionStreakDays}d
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>Racha Dieta</div>
            </div>

            <div
              style={{
                background: '#161b24',
                border: '1px solid #263042',
                borderRadius: '14px',
                padding: '10px 6px',
                textAlign: 'center',
              }}
              title="Ganas 1 escudo cada 3 entrenamientos para proteger tu racha en días de descanso"
            >
              <div style={{ fontSize: '1.25rem' }}>🛡️</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#a78bfa', marginTop: '2px' }}>
                {shieldsAvailable}/3
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>Escudos</div>
            </div>
          </div>

          {/* ================= NAVIGATION TABS ================= */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              background: '#141923',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid #232c3d',
              marginBottom: '18px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('missions')}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'missions' ? '#2563eb' : 'transparent',
                color: activeTab === 'missions' ? '#ffffff' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              🎯 Misiones ({completedDailyMissionsCount}/3)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'achievements' ? '#2563eb' : 'transparent',
                color: activeTab === 'achievements' ? '#ffffff' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              🏆 Medallas ({unlockedAchievementsCount}/{achievements.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tonnage')}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'tonnage' ? '#2563eb' : 'transparent',
                color: activeTab === 'tonnage' ? '#ffffff' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              🦖 Tonelaje Épico
            </button>
          </div>

          {/* ================= TAB 1: MISSIONS & WEEKLY CHALLENGES ================= */}
          {activeTab === 'missions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>⚡ Misiones Diarias (Hoy)</h3>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                  Se reinician cada medianoche
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                {dailyMissions.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: m.completed ? 'rgba(16, 185, 129, 0.1)' : '#161b24',
                      border: m.completed ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1px solid #232c3d',
                      borderRadius: '14px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: m.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.45rem',
                        flexShrink: 0,
                      }}
                    >
                      {m.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.94rem', color: m.completed ? '#34d399' : '#f8fafc' }}>
                          {m.title}
                        </strong>
                        <IonBadge
                          color={m.completed ? 'success' : 'primary'}
                          style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: '8px' }}
                        >
                          {m.completed ? '✓ Completada' : `+${m.xpReward} XP`}
                        </IonBadge>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Challenges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>🔥 Retos de la Semana (Últimos 7 días)</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {weeklyChallenges.map((ch) => {
                  const pct = Math.min(100, Math.round((ch.progress / ch.maxProgress) * 100));
                  return (
                    <div
                      key={ch.id}
                      style={{
                        background: ch.completed ? 'rgba(59, 130, 246, 0.12)' : '#161b24',
                        border: ch.completed ? '1.5px solid rgba(59, 130, 246, 0.5)' : '1px solid #232c3d',
                        borderRadius: '16px',
                        padding: '15px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.35rem' }}>{ch.icon}</span>
                          <strong style={{ fontSize: '0.95rem' }}>{ch.title}</strong>
                        </div>
                        <IonBadge color={ch.completed ? 'success' : 'warning'} style={{ borderRadius: '8px', padding: '4px 8px' }}>
                          +{ch.xpReward} XP
                        </IonBadge>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#94a3b8' }}>{ch.description}</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px', color: '#cbd5e1', fontWeight: 700 }}>
                        <span>Progreso</span>
                        <span>
                          {ch.progress} / {ch.maxProgress} ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#0d1117', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: ch.completed ? '#10b981' : '#3b82f6',
                            borderRadius: '999px',
                          }}
                        />
                      </div>

                      {ch.id === 'weekly_muscle_heatmap' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                          {Object.entries(muscleLabels).map(([key, label]) => {
                            const trained = weeklyMuscleGroupsTrained.includes(key as any);
                            return (
                              <span
                                key={key}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '3px 9px',
                                  borderRadius: '999px',
                                  fontWeight: 700,
                                  background: trained ? 'rgba(59, 130, 246, 0.22)' : 'rgba(255,255,255,0.04)',
                                  color: trained ? '#60a5fa' : '#64748b',
                                  border: trained ? '1px solid rgba(59, 130, 246, 0.45)' : '1px solid #1e293b',
                                }}
                              >
                                {trained ? '✓ ' : ''}{label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rest Shield Info Box */}
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  fontSize: '0.79rem',
                  color: '#d8b4fe',
                  lineHeight: 1.45,
                }}
              >
                <strong>🛡️ ¿Cómo funcionan los Escudos de Descanso?</strong>
                <br />
                Cada 3 entrenamientos completados ganas 1 Escudo Protector (máximo 3). Si tomas un día de descanso sin registrar actividad, el escudo se activa automáticamente para que tu racha no se pierda.
              </div>
            </div>
          )}

          {/* ================= TAB 2: ACHIEVEMENTS & BADGES ================= */}
          {activeTab === 'achievements' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  🏆 Vitrina de Trofeos ({unlockedAchievementsCount} de {achievements.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {achievements.map((badge) => {
                  const pct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));
                  return (
                    <div
                      key={badge.id}
                      style={{
                        background: badge.unlocked
                          ? 'linear-gradient(180deg, rgba(30, 58, 138, 0.35) 0%, #161b24 100%)'
                          : '#131720',
                        border: badge.unlocked ? '1.5px solid #3b82f6' : '1px solid #1e2636',
                        borderRadius: '16px',
                        padding: '14px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        opacity: badge.unlocked ? 1 : 0.72,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              background: badge.unlocked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.45rem',
                              filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                            }}
                          >
                            {badge.icon}
                          </div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '3px 7px',
                              borderRadius: '6px',
                              background: badge.unlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                              color: badge.unlocked ? '#34d399' : '#94a3b8',
                            }}
                          >
                            {badge.unlocked ? '✓ Desbloqueado' : `+${badge.xpReward} XP`}
                          </span>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff', marginBottom: '4px' }}>
                          {badge.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.35, marginBottom: '10px' }}>
                          {badge.description}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 700 }}>
                          <span>{badge.unlocked ? 'Completado' : 'Progreso'}</span>
                          <span>
                            {badge.progress.toLocaleString()} / {badge.maxProgress.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#0d1117', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: badge.unlocked ? '#10b981' : '#3b82f6',
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Athlete Ranks Reference */}
              <h3 style={{ margin: '18px 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>
                👑 Escalafón de Rangos de Atleta
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {ATHLETE_RANKS.map((r) => {
                  const isCurrent = r.title === rank.title;
                  const unlocked = level >= r.minLevel;
                  return (
                    <div
                      key={r.title}
                      style={{
                        background: isCurrent ? 'rgba(59, 130, 246, 0.16)' : '#161b24',
                        border: isCurrent ? '1.5px solid #3b82f6' : '1px solid #232c3d',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: unlocked ? 1 : 0.55,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.35rem' }}>{r.icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>{r.title}</div>
                          <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>Requiere Nivel {r.minLevel}+</div>
                        </div>
                      </div>
                      {isCurrent && (
                        <IonBadge color="primary" style={{ fontSize: '0.7rem' }}>
                          Rango Actual
                        </IonBadge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: EPIC TONNAGE MILESTONES ================= */}
          {activeTab === 'tonnage' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  border: '1px solid #334155',
                  borderRadius: '18px',
                  padding: '18px',
                  textAlign: 'center',
                  marginBottom: '18px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  VOLUMEN HISTÓRICO ACUMULADO
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                  {totalVolumeKg.toLocaleString()} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>kg</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '14px' }}>
                  {currentTonnageMilestone ? (
                    <>
                      ¡Ya superaste el peso de un <strong>{currentTonnageMilestone.icon} {currentTonnageMilestone.title}</strong>!
                    </>
                  ) : (
                    <>
                      Rumbo a tu primer gran hito: <strong>{nextTonnageMilestone.icon} {nextTonnageMilestone.title}</strong>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '5px', color: '#93c5fd' }}>
                  <span>Próximo Hito: {nextTonnageMilestone.icon} {nextTonnageMilestone.title}</span>
                  <span>
                    {totalVolumeKg.toLocaleString()} / {nextTonnageMilestone.targetKg.toLocaleString()} kg ({tonnageProgressPercent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#090d14', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${tonnageProgressPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>

              <h3 style={{ margin: '0 0 12px', fontSize: '0.96rem', fontWeight: 800 }}>
                🦖 Comparaciones Épicas de Fuerza
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {allMilestones.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: m.unlocked ? 'rgba(16, 185, 129, 0.1)' : '#161b24',
                      border: m.unlocked ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1px solid #232c3d',
                      borderRadius: '14px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      opacity: m.unlocked ? 1 : 0.65,
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: m.unlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        flexShrink: 0,
                      }}
                    >
                      {m.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.95rem', color: m.unlocked ? '#34d399' : '#ffffff' }}>
                          {m.title}
                        </strong>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: m.unlocked ? '#10b981' : '#94a3b8' }}>
                          {m.targetKg.toLocaleString()} kg
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.79rem', color: '#94a3b8' }}>{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
