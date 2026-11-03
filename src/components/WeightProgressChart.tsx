import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { WeightRecord } from '../types';
import { formatDateDDMM } from '../services/storage';

interface WeightProgressChartProps {
  records: WeightRecord[];
}

export const WeightProgressChart: React.FC<WeightProgressChartProps> = ({ records }) => {
  if (records.length < 2) {
    return (
      <IonCard style={{ margin: '0 0 16px', borderRadius: '16px', textAlign: 'center', padding: '16px' }}>
        <IonCardContent>
          <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
            Registra al menos 2 pesos en diferentes días para ver tu gráfica de evolución temporal.
          </p>
        </IonCardContent>
      </IonCard>
    );
  }

  // Sort chronologically for chart display (oldest to newest)
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weights = sorted.map((r) => r.weightKg);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);
  const weightRange = maxWeight - minWeight || 1;

  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 45;
  const paddingY = 30;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Calculate coordinates for points
  const points = sorted.map((item, index) => {
    const x = paddingX + (index / (sorted.length - 1)) * chartWidth;
    const y =
      svgHeight - paddingY - ((item.weightKg - minWeight) / weightRange) * chartHeight;
    return { x, y, record: item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Difference between first and latest
  const firstW = sorted[0].weightKg;
  const lastW = sorted[sorted.length - 1].weightKg;
  const diff = Number((lastW - firstW).toFixed(1));

  return (
    <IonCard style={{ margin: '0 0 16px', borderRadius: '16px' }}>
      <IonCardHeader style={{ padding: '14px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IonCardTitle style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Evolución del Peso
          </IonCardTitle>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: diff < 0 ? 'rgba(45,211,111,0.2)' : diff > 0 ? 'rgba(235,68,90,0.2)' : 'rgba(0,0,0,0.06)',
              color: diff < 0 ? 'var(--ion-color-success)' : diff > 0 ? 'var(--ion-color-danger)' : 'var(--ion-color-medium)',
            }}
          >
            {diff > 0 ? `+${diff}` : diff} kg total
          </span>
        </div>
      </IonCardHeader>

      <IonCardContent style={{ padding: '8px 12px 14px' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="weightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--ion-color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--ion-color-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="var(--ion-color-step-150, #e0e0e0)"
            strokeDasharray="4 4"
          />
          <text
            x={paddingX - 8}
            y={paddingY + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--ion-color-medium)"
          >
            {maxWeight} kg
          </text>

          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
            stroke="var(--ion-color-step-150, #e0e0e0)"
          />
          <text
            x={paddingX - 8}
            y={svgHeight - paddingY + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--ion-color-medium)"
          >
            {minWeight} kg
          </text>

          {/* Area fill under line */}
          <polygon
            points={`${points[0].x},${svgHeight - paddingY} ${polylinePoints} ${
              points[points.length - 1].x
            },${svgHeight - paddingY}`}
            fill="url(#weightGrad)"
          />

          {/* Trend line */}
          <polyline
            fill="none"
            stroke="var(--ion-color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={idx === points.length - 1 ? 6 : 4}
                fill={idx === points.length - 1 ? 'var(--ion-color-secondary)' : 'var(--ion-color-primary)'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="var(--ion-text-color, #222)"
              >
                {p.record.weightKg}
              </text>
              {/* Date label at bottom */}
              <text
                x={p.x}
                y={svgHeight - paddingY + 16}
                textAnchor="middle"
                fontSize="9"
                fill="var(--ion-color-medium)"
              >
                {formatDateDDMM(p.record.date)}
              </text>
            </g>
          ))}
        </svg>
      </IonCardContent>
    </IonCard>
  );
};

