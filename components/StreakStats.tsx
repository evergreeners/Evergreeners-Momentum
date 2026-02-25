
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Flame, Trophy, Calendar, Target } from 'lucide-react';

const StreakStats: React.FC = () => {
  const data = [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 7 },
    { day: 'Wed', count: 3 },
    { day: 'Thu', count: 12 },
    { day: 'Fri', count: 2 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 1 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricBox icon={<Flame className="text-orange-500" />} label="Current Streak" value="8 Days" sub="Best: 14 Days" />
        <MetricBox icon={<Trophy className="text-yellow-500" />} label="Total Improvements" value="42" sub="+5 this week" />
        <MetricBox icon={<Calendar className="text-blue-500" />} label="Yearly Commits" value="248" sub="Top 15% of devs" />
        <MetricBox icon={<Target className="text-indigo-500" />} label="Goal Progress" value="84%" sub="Maintain 5 days/wk" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h4 className="text-xl font-bold text-white mb-8">Weekly Activity</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#6366f1' : '#27272a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h4 className="text-xl font-bold text-white mb-6">Milestones</h4>
          <div className="space-y-6">
            <Milestone title="Documentation Pro" desc="10 READMEs generated" progress={80} />
            <Milestone title="Consistent Coder" desc="30-day commit streak" progress={25} />
            <Milestone title="Hygiene Hero" desc="Remove 50 TODO comments" progress={65} />
            <Milestone title="Security First" desc="Add 5 SECURITY.md files" progress={40} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 to-zinc-900 border border-indigo-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="p-6 bg-indigo-500/10 rounded-full">
          <Flame className="w-16 h-16 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Streaks aren't just for points.</h3>
          <p className="text-indigo-100/60 max-w-xl">
            Each day you improve a repository, you're building a more professional portfolio. GitMomentum helps you stay consistent while ensuring your commits provide real value to your projects.
          </p>
        </div>
        <button className="whitespace-nowrap px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors mt-4 md:mt-0">
          Set Weekly Goal
        </button>
      </div>
    </div>
  );
};

const MetricBox: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string }> = ({ icon, label, value, sub }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
      <span className="text-sm font-medium text-zinc-400">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-zinc-500">{sub}</div>
  </div>
);

const Milestone: React.FC<{ title: string; desc: string; progress: number }> = ({ title, desc, progress }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-[10px] text-zinc-500">{desc}</p>
      </div>
      <span className="text-[10px] font-bold text-indigo-400">{progress}%</span>
    </div>
    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div 
        className="h-full bg-indigo-500 transition-all duration-1000" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default StreakStats;
