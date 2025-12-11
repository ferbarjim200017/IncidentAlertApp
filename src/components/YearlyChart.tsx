import { Incident } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './YearlyChart.css';

interface YearlyChartProps {
  incidents: Incident[];
}

export const YearlyChart: React.FC<YearlyChartProps> = ({ incidents }) => {
  // Incidencias por mes del año actual
  const getYearlyIncidents = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const monthlyData = monthNames.map((month, index) => {
      const createdCount = incidents.filter(inc => {
        const created = new Date(inc.creationDate);
        return created.getFullYear() === currentYear && created.getMonth() === index;
      }).length;
      
      const closedCount = incidents.filter(inc => {
        const updated = new Date(inc.updatedAt);
        return inc.status === 'cerrada' && 
               updated.getFullYear() === currentYear && 
               updated.getMonth() === index;
      }).length;
      
      return {
        mes: month,
        creadas: createdCount,
        cerradas: closedCount,
      };
    });
    
    return monthlyData;
  };

  const yearlyData = getYearlyIncidents();

  return (
    <div className="yearly-chart-container">
      <h3>📈 Incidencias por Mes ({new Date().getFullYear()})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
          <XAxis dataKey="mes" stroke="#667eea" style={{ fontSize: '0.9rem' }} />
          <YAxis stroke="#667eea" style={{ fontSize: '0.9rem' }} />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #667eea',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="creadas" 
            fill="url(#colorGradient)" 
            radius={[8, 8, 0, 0]}
            name="Creadas"
          />
          <Bar 
            dataKey="cerradas" 
            fill="url(#closedGradient)" 
            radius={[8, 8, 0, 0]}
            name="Cerradas"
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#667eea" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#764ba2" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="closedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
