import { Incident, IncidentStatus } from '../types';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './IncidentChart.css';

interface IncidentChartProps {
  incidents: Incident[];
  onStatusClick: (status: IncidentStatus) => void;
  onNavigateToList: () => void;
}

export const IncidentChart: React.FC<IncidentChartProps> = ({ incidents, onStatusClick, onNavigateToList }) => {
  const statusColors = {
    abierta: '#1976d2',
    'en-progreso': '#f57c00',
    'puesto-en-test': '#8b5cf6',
    'verificado-en-test': '#06b6d4',
    resuelta: '#689f38',
    cerrada: '#7b1fa2',
  };

  const statusLabels = {
    abierta: 'Abierta',
    'en-progreso': 'En Progreso',
    'puesto-en-test': 'Puesto en Test',
    'verificado-en-test': 'Verificado en Test',
    resuelta: 'Resuelta',
    cerrada: 'Cerrada',
  };

  const chartData = [
    {
      name: statusLabels.abierta,
      value: incidents.filter(i => i.status === 'abierta').length,
      fill: statusColors.abierta,
      status: 'abierta' as IncidentStatus,
    },
    {
      name: statusLabels['en-progreso'],
      value: incidents.filter(i => i.status === 'en-progreso').length,
      fill: statusColors['en-progreso'],
      status: 'en-progreso' as IncidentStatus,
    },
    {
      name: statusLabels['puesto-en-test'],
      value: incidents.filter(i => i.status === 'puesto-en-test').length,
      fill: statusColors['puesto-en-test'],
      status: 'puesto-en-test' as IncidentStatus,
    },
    {
      name: statusLabels['verificado-en-test'],
      value: incidents.filter(i => i.status === 'verificado-en-test').length,
      fill: statusColors['verificado-en-test'],
      status: 'verificado-en-test' as IncidentStatus,
    },
    {
      name: statusLabels.resuelta,
      value: incidents.filter(i => i.status === 'resuelta').length,
      fill: statusColors.resuelta,
      status: 'resuelta' as IncidentStatus,
    },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="incident-chart-container">
        <h3>Distribución por Estado</h3>
        <div className="chart-empty">
          <p>No hay incidencias para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="incident-chart-container">
      <h3>Distribución por Estado</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onClick={(entry) => {
              onStatusClick(entry.status);
              onNavigateToList();
            }}
            style={{ cursor: 'pointer' }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value} incidencias`}
            contentStyle={{ background: '#fff', border: '2px solid #667eea', borderRadius: '8px' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
