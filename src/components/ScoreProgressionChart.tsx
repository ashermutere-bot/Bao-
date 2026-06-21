import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Award, Calendar, Users } from 'lucide-react';

interface Assessment {
  id?: string;
  score: number;
  matches: string[];
  answers: Record<string, number>;
  createdAt: any;
}

interface ScoreProgressionChartProps {
  assessments: Assessment[];
}

const getScoreInfo = (score: number) => {
  if (score < 40) return { label: 'Inception Phase', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500', rawColor: '#f43f5e' };
  if (score < 60) return { label: 'Scale Phase', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500', rawColor: '#f59e0b' };
  if (score < 75) return { label: 'Venture Ready', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500', rawColor: '#3b82f6' };
  return { label: 'Excellent Exit Readiness', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500', rawColor: '#10b981' };
};

export default function ScoreProgressionChart({ assessments }: ScoreProgressionChartProps) {
  // Chronological sort: oldest to newest
  const sortedData = [...assessments]
    .map(item => {
      const parsedDate = new Date(item.createdAt);
      return {
        ...item,
        dateObject: parsedDate,
        dateFormatted: parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        dateFull: parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        timeFormatted: parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: item.score,
        matchesCount: item.matches ? item.matches.length : 0
      };
    })
    .sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime());

  if (sortedData.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
        <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
        <p className="font-bold text-slate-750">No Historical Progression Data</p>
        <p className="text-xs max-w-xs mt-1">
          Take your first 15-question readiness evaluation to establish a scoring trend.
        </p>
      </div>
    );
  }

  // Custom tooltip content render
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const scoreMeta = getScoreInfo(data.score);
      return (
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xl max-w-xs text-xs font-sans">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            {data.dateFull} @ {data.timeFormatted}
          </div>
          
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="font-medium text-slate-305">Readiness score:</span>
            <span className="text-lg font-black text-white">{data.score}/100</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: scoreMeta.rawColor }} />
            <span className={`font-extrabold uppercase tracking-wide text-[9px] px-2 py-0.5 rounded ${scoreMeta.bg} ${scoreMeta.color}`}>
              {scoreMeta.label}
            </span>
          </div>

          <div className="border-t border-slate-800 pt-2 mt-2 flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> Suitors matched:
            </span>
            <strong className="text-white">{data.matchesCount}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  const latestAssessment = sortedData[sortedData.length - 1];
  const firstAssessment = sortedData[0];
  const scoreDiff = latestAssessment.score - firstAssessment.score;

  return (
    <div id="readiness-progression-panel" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Score Progression
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Historical trend of your exit readiness scorecard evaluations</p>
          </div>

          {sortedData.length > 1 && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              scoreDiff >= 0 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-700'
            }`}>
              {scoreDiff >= 0 ? '+' : ''}{scoreDiff} pts change
            </div>
          )}
        </div>

        {/* Recharts Container */}
        <div className="h-64 sm:h-72 w-full mt-4 -ml-4">
          <ResponsiveContainer width="103%" height="100%">
            <LineChart
              data={sortedData}
              margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="dateFormatted" 
                stroke="#94a3b8" 
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickCount={6}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              {/* Reference Lines for readiness milestones */}
              <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" opacity={0.4} />
              <ReferenceLine y={40} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.3} />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                activeDot={{ r: 8, strokeWidth: 2, stroke: '#ffffff' }}
                dot={{ r: 5, strokeWidth: 2, fill: '#10b981', stroke: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-y-2 items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent Readiness (&ge;75)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Inception (&lt;40)
          </span>
        </div>
        <span>Chronological Evaluation Tracker</span>
      </div>
    </div>
  );
}
