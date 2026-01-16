import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Moon, 
  Sun, 
  Clock, 
  Plus, 
  Trash2, 
  Settings, 
  BarChart3, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const App = () => {
  // --- State ---
  const [sleepLogs, setSleepLogs] = useState([]);
  const [goalHours, setGoalHours] = useState(8);
  const [bedTime, setBedTime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'analytics'

  // --- Initialization ---
  useEffect(() => {
    const savedLogs = localStorage.getItem('sleep_logs');
    const savedGoal = localStorage.getItem('sleep_goal');
    if (savedLogs) setSleepLogs(JSON.parse(savedLogs));
    if (savedGoal) setGoalHours(Number(savedGoal));
  }, []);

  useEffect(() => {
    localStorage.setItem('sleep_logs', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    localStorage.setItem('sleep_goal', goalHours.toString());
  }, [goalHours]);

  // --- Helpers ---
  const calculateDuration = (start, end) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60; // Handle overnight sleep
    
    return parseFloat((diff / 60).toFixed(2));
  };

  const handleAddLog = () => {
    const duration = calculateDuration(bedTime, wakeTime);
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date().toISOString(),
      bedTime,
      wakeTime,
      duration
    };
    
    setSleepLogs([newLog, ...sleepLogs].slice(0, 30)); // Keep last 30 days
  };

  const deleteLog = (id) => {
    setSleepLogs(sleepLogs.filter(log => log.id !== id));
  };

  const stats = useMemo(() => {
    if (sleepLogs.length === 0) return { avg: 0, consistency: 0 };
    const avg = sleepLogs.reduce((acc, curr) => acc + curr.duration, 0) / sleepLogs.length;
    const metGoalCount = sleepLogs.filter(l => l.duration >= goalHours).length;
    const consistency = (metGoalCount / sleepLogs.length) * 100;
    return { avg: avg.toFixed(1), consistency: Math.round(consistency) };
  }, [sleepLogs, goalHours]);

  const chartData = [...sleepLogs].reverse();

  // --- Components ---
  const Card = ({ children, title, icon: Icon }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4 text-slate-400">
        {Icon && <Icon size={18} />}
        <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Sleep Catalyst
            </h1>
            <p className="text-slate-500 mt-1">Optimize your recovery, daily.</p>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'log' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Log Entry
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Analytics
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Controls */}
          <div className="md:col-span-1 space-y-6">
            <Card title="Input Sleep" icon={Moon}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Bedtime</label>
                  <input 
                    type="time" 
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Wake up</label>
                  <input 
                    type="time" 
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
                <button 
                  onClick={handleAddLog}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={20} /> Add to Log
                </button>
              </div>
            </Card>

            <Card title="Daily Goal" icon={Settings}>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{goalHours}h</span>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  step="0.5"
                  value={goalHours}
                  onChange={(e) => setGoalHours(Number(e.target.value))}
                  className="w-2/3 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">Recommended: 7-9 hours</p>
            </Card>

            <Card title="Quick Stats" icon={TrendingUp}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Average</p>
                  <p className="text-xl font-bold text-cyan-400">{stats.avg}h</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Goal Met</p>
                  <p className="text-xl font-bold text-indigo-400">{stats.consistency}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Viewport Content */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'log' ? (
              <Card title="Recent Logs" icon={Clock}>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {sleepLogs.length === 0 ? (
                    <div className="text-center py-10 text-slate-600">
                      <Moon className="mx-auto mb-2 opacity-20" size={48} />
                      <p>No sleep data recorded yet.</p>
                    </div>
                  ) : (
                    sleepLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-transparent hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${log.duration >= goalHours ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {log.duration >= goalHours ? <Sun size={18} /> : <AlertCircle size={18} />}
                          </div>
                          <div>
                            <p className="font-semibold">{log.date}</p>
                            <p className="text-xs text-slate-500">{log.bedTime} — {log.wakeTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-lg font-bold">{log.duration}h</span>
                          <button 
                            onClick={() => deleteLog(log.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card title="Sleep Trends" icon={BarChart3}>
                  <div className="h-[300px] w-full mt-4">
                    {sleepLogs.length < 2 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                        Log at least 2 entries to view trends.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#64748b" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            domain={[0, 'auto']}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#818cf8' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="duration" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorDur)" 
                          />
                          {/* Goal Line */}
                          <Line 
                            type="monotone" 
                            dataKey={() => goalHours} 
                            stroke="#f43f5e" 
                            strokeDasharray="5 5" 
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
                
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl flex items-start gap-4">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-100">Insight</h3>
                    <p className="text-sm text-indigo-200/70 mt-1 leading-relaxed">
                      {stats.avg >= goalHours 
                        ? "Great work! You are consistently hitting your sleep goal. Keep this rhythm to maintain high cognitive performance."
                        : `You're currently averaging ${stats.avg}h, which is ${Math.abs(goalHours - stats.avg).toFixed(1)}h below your target. Try moving bedtime 15 mins earlier.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default App;
