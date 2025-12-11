import { Incident, IncidentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './IncidentStats.css';

interface IncidentStatsProps {
  incidents: Incident[];
}

export function IncidentStats({ incidents }: IncidentStatsProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Contar incidencias creadas este mes
  const createdThisMonth = incidents.filter((inc) => {
    const createdDate = new Date(inc.creationDate);
    return (
      createdDate.getFullYear() === currentYear &&
      createdDate.getMonth() + 1 === currentMonth
    );
  }).length;

  // Contar incidencias abiertas (todos los estados excepto cerrada)
  const openIncidents = incidents.filter(
    (inc) => inc.status !== 'cerrada'
  ).length;

  // Contar incidencias cerradas
  const closedIncidents = incidents.filter((inc) => inc.status === 'cerrada').length;

  const data = [
    {
      name: 'Este mes',
      'Creadas': createdThisMonth,
      'Abiertas': openIncidents,
      'Cerradas': closedIncidents,
    },
  ];

  return (
    <div className="incident-stats-container">
      <div className="stats-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.2)" />
            <XAxis dataKey="name" stroke="#667eea" />
            <YAxis stroke="#667eea" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #667eea',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              }}
              labelStyle={{ color: '#333' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
            <Bar dataKey="Creadas" fill="#667eea" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Abiertas" fill="#f093fb" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Cerradas" fill="#764ba2" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
