import React, { useEffect, useState, useMemo } from "react";
import { fetchDashboardData, fetchModelKeys, BASE_URL } from "../api/models"; // helpers
import ModelStatusCard from "../components/ModelStatusCard";
import { fetchAttackHistory } from "../api/attacks";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LabelList, Legend, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { 
  FaExclamationTriangle, 
  FaDownload, 
  FaChartLine, 
  FaShieldAlt, 
  FaChartBar,
  FaBell,
  FaCog,
  FaFileAlt,
  FaMoon,
  FaSun,
  FaFilter,
  FaSearch,
  FaRobot,
  FaServer,
  FaUsers,
  FaEye,
  FaBars,
  FaTimes
} from "react-icons/fa";

// Enhanced Styled Components with Dark Mode Support
const Card = ({ children, className = "", animated = false }) => (
  <div className={`
    bg-white dark:bg-dark-800 
    rounded-2xl shadow-lg dark:shadow-neumorphic-dark 
    border border-white/30 dark:border-white/10 
    overflow-hidden transition-all duration-300 
    hover:shadow-xl hover:scale-[1.02] 
    shadow-[inset_4px_4px_10px_rgba(255,255,255,0.2),_inset_-4px_-4px_10px_rgba(0,0,0,0.1)]
    ${animated ? 'animate-fade-in' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`
    bg-glass dark:bg-dark-glass backdrop-blur-lg 
    rounded-2xl shadow-glass border border-white/20 dark:border-white/10
    transition-all duration-300 hover:shadow-xl
    ${className}
  `}>
    {children}
  </div>
);

const CardHeader = ({ title, icon, className = "", action }) => (
  <div className={`flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-700 ${className}`}>
    <div className="flex items-center">
      {icon && <span className="mr-3 text-accent-blue text-xl">{icon}</span>}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-white">{title}</h2>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default", animated = false }) => {
  const variants = {
    default: "bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200",
    primary: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
  };
  
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
      transition-all duration-200 
      ${variants[variant]} 
      ${animated ? 'animate-pulse-slow' : ''}
    `}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = "primary", className = "", size = "md", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white shadow-soft dark:shadow-soft-dark",
    secondary: "bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-800 dark:text-gray-200",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg",
    glass: "bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 text-gray-900 dark:text-gray-100 dark:text-white hover:bg-white/20 dark:hover:bg-white/10"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      className={`
        inline-flex items-center rounded-xl font-semibold 
        transition-all duration-200 transform hover:scale-105 
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

const StatCard = ({ title, value, icon, trend, color = "blue", animated = true }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600"
  };
  
  return (
    <Card animated={animated} className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-5`}></div>
      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 ${
                trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Sidebar = ({ isOpen, onClose, darkMode, toggleDarkMode, openReports }) => (
  <div className={`
    fixed inset-y-0 right-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    bg-white dark:bg-dark-900 shadow-2xl border-l border-gray-200 dark:border-dark-700
  `}>
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-white">الإعدادات</h2>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
      >
        <FaTimes className="text-gray-500 dark:text-gray-400 dark:text-gray-400" />
      </button>
    </div>
    
    <div className="p-6 space-y-6">
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {darkMode ? <FaMoon className="ml-3 text-blue-500" /> : <FaSun className="ml-3 text-yellow-500" />}
          <span className="text-gray-900 dark:text-gray-100 dark:text-white font-medium">الوضع الليلي</span>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full overflow-hidden transition-colors
            ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}
          `}
        >
          <span className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${darkMode ? 'translate-x-6' : 'translate-x-1'}
          `} />
        </button>
      </div>
      
      {/* Menu Items */}
      <div className="space-y-3">
        <SidebarItem icon={<FaBell />} title="التنبيهات" active />
        <div onClick={openReports}><SidebarItem icon={<FaFileAlt />} title="التقارير" /></div>
      </div>
    </div>
  </div>
);

const SidebarItem = ({ icon, title, active = false }) => (
  <div className={`
    flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
    ${active 
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800'
    }
  `}>
    <span className="ml-3">{icon}</span>
    <span className="font-medium">{title}</span>
  </div>
);


export default function Dashboard() {
  const [reportsOpen,setReportsOpen]=useState(false);
  const [reportFiles,setReportFiles]=useState([]);
  const openReports=()=>setReportsOpen(true);
  const closeReports=()=>setReportsOpen(false);

  useEffect(()=>{
    if(!reportsOpen) return;
    const base = BASE_URL;
    fetch(`${base}/log-files`).then(r=>r.json()).then(setReportFiles).catch(console.error);
  },[reportsOpen]);


  const formatAlertMessage = (msg, mdl) => {
    if (!msg) return '';
    // Remove trailing "from modelX"
    let cleaned = msg.replace(/from model\d+/i, '').trim();
    if (cleaned.endsWith(',')) cleaned = cleaned.slice(0,-1);
    if (cleaned.startsWith('attack')) {
      cleaned = cleaned.replace('attack', 'هجوم');
    } else {
      cleaned = cleaned.replace('normal', 'طبيعي');
    }
    return cleaned.trim();
  };
  const [newAlert, setNewAlert] = useState(false); // Detect new alerts for icon animation
  const [prevAlertCount, setPrevAlertCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelKeys, setModelKeys] = useState([]);
  const [stats, setStats] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all'); // all, high, medium, low
  const [periodFilter, setPeriodFilter] = useState('all'); // all, day, week, month


  // Detect system preference and listen for changes
  useEffect(() => {
    // If user had a stored preference, respect it; otherwise use system
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setDarkMode(stored === 'dark');
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(media.matches);
      const listener = (e) => setDarkMode(e.matches);
      // addEventListener is newer; fallback to addListener for older browsers
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else {
        media.addListener(listener);
      }
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener('change', listener);
        } else {
          media.removeListener(listener);
        }
      };
    }
  }, []);

  // Compute dynamic data for charts
  const daysAr = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const dailyTrendsData = useMemo(() => {
    if (!alerts.length) return null;
    const counts = Array(7).fill(0);
    alerts.forEach(a => {
      if (!a.timestamp) return;
      const date = new Date(a.timestamp.replace(' ','T'));
      const d = date.getDay(); // 0=Sun
      counts[d] += 1;
    });
    return counts.map((c,i)=>({ date: daysAr[i], attempts: c }));
  }, [alerts]);

  // Compute distribution of alerts per attack type.
  // We rely on an explicit `attack` field, falling back to parsing keywords in `message`.
  const attackDistribution = useMemo(() => {
    if (!alerts.length) return null;

    // Arabic labels used in the fallback sample data
    const typeMap = {
      ddos: 'حجب الخدمة',
      sql: 'حقن SQL',
      xss: 'XSS',
      login: 'محاولات تسجيل دخول',
      other: 'آخرون',
    };

    const counts = {};

    const detectType = (alert) => {
      if (alert.attack) return alert.attack; // backend explicit field
      const msg = (alert.message || '').toLowerCase();
      if (msg.includes('ddos') || msg.includes('حجب')) return typeMap.ddos;
      if (msg.includes('sql')) return typeMap.sql;
      if (msg.includes('xss')) return typeMap.xss;
      if (msg.includes('تسجيل') || msg.includes('login')) return typeMap.login;
      return typeMap.other;
    };

    alerts.forEach((a) => {
      const key = detectType(a);
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [alerts]);

  // Fallback chart data for daily trends if backend does not provide
  const fallbackDailyTrends = [
    { date: 'الإثنين', attempts: 0 },
    { date: 'الثلاثاء', attempts: 0 },
    { date: 'الأربعاء', attempts: 0 },
    { date: 'الخميس', attempts: 0 },
    { date: 'الجمعة', attempts: 0 },
    { date: 'السبت', attempts: 0 },
    { date: 'الأحد', attempts: 0 }
  ];

  useEffect(() => {
    let mounted = true;

    const fetchKeys = async () => {
      try {
        const keys = await fetchModelKeys();
        if (mounted) setModelKeys(keys);
      } catch {
        /* ignore */
      }
    };

    const loadDash = async () => {
      const { alerts: fetchedAlerts, stats: fetchedStats } = await fetchDashboardData();
      if (mounted) {
        setAlerts(fetchedAlerts || []);
        setStats({ todayAttempts:0, topAttack:'-', successRate:0, ...fetchedStats });
        setLoading(false);
      }
    };

    fetchKeys();
    loadDash();
    const id = setInterval(loadDash, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Helper to download a selected log file
  const downloadLogFile = (fname) => {
    const base = BASE_URL;
    window.open(`${base}/download-log?file=${fname}`, "_blank");
  };

  // Download attacks report as CSV
  const handleDownloadReport = async () => {
    try {
      const records = await fetchAttackHistory(1000);
      if (!records || !records.length) {
        alert("لا توجد سجلات هجمات متاحة للتنزيل");
        return;
      }
      const header = Object.keys(records[0]).join(",");
      const rows = records
        .map(r => Object.values(r).map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(","))
        .join("\n");
      const csvContent = [header, rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attack_report_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("فشل تنزيل التقرير، حاول مرة أخرى لاحقاً");
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sample data for enhanced charts
  const performanceData = [
    { name: 'الإثنين', requests: 4000, responses: 3800, errors: 200 },
    { name: 'الثلاثاء', requests: 3000, responses: 2900, errors: 100 },
    { name: 'الأربعاء', requests: 2000, responses: 1950, errors: 50 },
    { name: 'الخميس', requests: 2780, responses: 2700, errors: 80 },
    { name: 'الجمعة', requests: 1890, responses: 1850, errors: 40 },
    { name: 'السبت', requests: 2390, responses: 2300, errors: 90 },
    { name: 'الأحد', requests: 3490, responses: 3400, errors: 90 },
  ];

  const modelUsageData = [
    { name: 'GPT-4', value: 45, color: '#3b82f6' },
    { name: 'Claude', value: 30, color: '#8b5cf6' },
    { name: 'Gemini', value: 15, color: '#10b981' },
    { name: 'أخرى', value: 10, color: '#f59e0b' },
  ];

  const axisColor = darkMode ? '#CCCCCC' : '#6B7280';

  if (loading) {
    return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-900 dark:to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">جاري التحميل ...</p>
        </div>
      </div>
    </div>
   );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={toggleSidebar} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        openReports={openReports}
      />
      
      {/* Floating sidebar toggle icon */}
      <button onClick={toggleSidebar}
        className="fixed top-4 right-4 z-40 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <FaBars />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FaRobot className="text-3xl text-blue-600 dark:text-blue-400 ml-3" />
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  لوحة تحكم نظام الذكاء الاصطناعي
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">نظرة عامة شاملة على أداء النظام والتنبيهات</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-6 lg:mt-0">
              {/* Time Filter */}
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-500 dark:text-gray-400 dark:text-gray-400" />
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl px-4 py-2 text-gray-900 dark:text-gray-100 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">اليوم</option>
                  <option value="week">هذا الأسبوع</option>
                  <option value="month">هذا الشهر</option>
                  <option value="year">هذا العام</option>
                </select>
              </div>
              
              {/* Action Buttons */}
              {/* Header settings button replaced by floating icon */}
              
              <Button variant="primary" size="lg" className="shadow-xl" onClick={handleDownloadReport}>
                <FaDownload className="ml-2" />
                تحميل التقرير
              </Button>
            </div>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">عدد المحاولات اليوم</p>
                  <p className="text-2xl font-bold mt-1">{stats.todayAttempts || 0}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center">
                    <FaChartLine className="ml-1" /> 12% عن الأسبوع الماضي
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <FaChartBar className="text-blue-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">أعلى نوع هجوم</p>
                  <p className="text-xl font-bold mt-1">{stats.topAttack || "غير متوفر"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">آخر تحديث: منذ ساعة</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">نسبة النجاح</p>
                  <p className={`text-2xl font-bold mt-1 ${stats.successRate >= 80 ? 'text-green-500' : stats.successRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{stats.successRate || 0}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className={`${stats.successRate >= 80 ? 'bg-green-500' : stats.successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'} h-1.5 rounded-full`}
                      style={{ width: `${stats.successRate || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <FaShieldAlt className="text-green-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي الإنذارات</p>
                  <p className="text-2xl font-bold mt-1">{alerts.length}</p>
                  <p className="text-xs text-yellow-500 mt-1">
                    {alerts.filter(a => a.level === 'high').length} إنذار عالي
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <FaExclamationTriangle className="text-yellow-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Models status */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">حالة النماذج</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" id="modelsGrid">
            {modelKeys.map((k) => (
              <ModelStatusCard key={k} modelKey={k} />
            ))}
          </div>
        </div>
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader 
              title="احصائيات يومية" 
              icon={<FaChartBar />} 
            />
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={ dailyTrendsData || (stats.dailyTrends && stats.dailyTrends.length ? stats.dailyTrends : fallbackDailyTrends) }
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: axisColor }}
                      axisLine={{ stroke: axisColor }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: axisColor }}
                      axisLine={{ stroke: axisColor }}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      animationDuration={800} 
                      dataKey="attempts" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader 
              title="توزيع الهجمات" 
              icon={<FaExclamationTriangle />} 
            />
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                     layout="vertical"
                    data={attackDistribution || [
                       { name: 'حجب الخدمة', value: 12 },
                       { name: 'حقن SQL', value: 8 },
                       { name: 'XSS', value: 5 },
                       { name: 'محاولات تسجيل دخول', value: 15 },
                       { name: 'آخرون', value: 3 }
                      ]}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis
                       type="number"
                       domain={[0, 'dataMax']}
                       tick={{ fontSize: 12, fill: axisColor }}
                       axisLine={{ stroke: axisColor }}
                       tickLine={false}
                     />
                    <YAxis 
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fill: axisColor }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      animationDuration={800}
                      fill="#3b82f6"
                      barSize={24}
                      radius={[0, 4, 4, 0]}
                      label={{
                        position: 'right',
                        fill: darkMode ? '#FFFFFF' : '#1F2937',
                        formatter: (val) => val,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Table */}
        <Card>
          <CardHeader 
            title="التنبيهات الأخيرة" 
            action={(
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-md text-sm px-2 py-1">
                  <option value="all">كل المستويات</option>
                  <option value="high">عالي</option>
                  <option value="medium">متوسط</option>
                  <option value="low">منخفض</option>
                </select>
                <select value={periodFilter} onChange={e=>setPeriodFilter(e.target.value)} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-md text-sm px-2 py-1">
                  <option value="all">كل الأوقات</option>
                  <option value="day">اليوم</option>
                  <option value="week">هذا الأسبوع</option>
                  <option value="month">هذا الشهر</option>
                </select>
                <button onClick={()=>setAlerts([])} className="text-xs text-red-500 hover:underline">تجاهل الكل</button>
              </div>
            )}
            icon={<FaExclamationTriangle />}
            className="border-b border-gray-100"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الرسالة</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المصدر</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">التاريخ</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {alerts
                  .filter(alert => {
                    if (levelFilter !== 'all' && alert.level !== levelFilter) return false;
                     // Hide low-level alerts when "all" is selected
                     if (levelFilter === 'all' && alert.level === 'low') return false;
                    if (periodFilter === 'all') return true;
                    const alertDate = new Date(alert.timestamp.replace(' ', 'T'));
                    const now = new Date();
                    const diffMs = now - alertDate;
                    const dayMs = 24*60*60*1000;
                    if (periodFilter === 'day') return diffMs <= dayMs;
                    if (periodFilter === 'week') return diffMs <= 7*dayMs;
                    if (periodFilter === 'month') return diffMs <= 30*dayMs;
                    return true;
                  })
                  .map((alert, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatAlertMessage(alert.message, alert.model)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{alert.source || 'غير معروف'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{alert.timestamp}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        alert.level === 'high' ? 'danger' : 
                        alert.level === 'medium' ? 'warning' : 'default'
                      }>
                        {alert.level === 'high' ? 'عالي' : 
                         alert.level === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      لا توجد تنبيهات حالية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
    {reportsOpen && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-xl w-96 max-h-[80vh] overflow-auto p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">ملفات التقارير اليومية</h2>
        <ul className="space-y-3">
          {reportFiles.map(f=> (
            <li key={f.filename} className="flex items-center justify-between">
              <span className="text-sm text-gray-800 dark:text-gray-200">{f.date}</span>
              <a href={`${BASE_URL}/download-log?file=${encodeURIComponent(f.filename)}`} className="text-blue-600 hover:underline text-sm" download>
                تحميل
              </a>
            </li>
          ))}
          {!reportFiles.length && <p className="text-sm text-gray-500">لا توجد ملفات</p>}
        </ul>
        <button onClick={closeReports} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md w-full">إغلاق</button>
      </div>
    </div>
  )}
</div>
  );
} 
