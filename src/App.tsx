import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Activity,
  CheckCircle,
  Database,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Save,
  Search,
  Play,
  Calendar,
  X,
  RefreshCw,
  AlertOctagon,
  History,
  MoreHorizontal,
  Download,
  Plus,
  Folder,
  ChevronRight,
  Code,
  User,
  Lock,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- Types ---
type AppState = 'login' | 'projects' | 'connect' | 'processing' | 'portal';
type Tab = 'overview' | 'fields' | 'params' | 'verify' | 'history';

// --- Mock Data ---

const MOCK_PROJECTS = [
  { id: 1, name: '雪梨 (Sydney)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
  { id: 2, name: '東京 (Tokyo)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
  { id: 3, name: '巴黎 (Paris)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
  { id: 4, name: '台北 (Taipei)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
];

const MOCK_VENDOR_PARAMS = [
  {
    id: 'txna1101',
    schedule: '月跑批',
    paramName: 'credit_limit',
    value: '1,000,000',
    duration: '2026/01/01 ~ 2026/03/31',
    updateTime: '2025-10-10 10:45:45',
  },
  {
    id: 'txna1101',
    schedule: '月跑批',
    paramName: 'debit_limit',
    value: '200,000',
    duration: '2026/01/01 ~ 2026/03/31',
    updateTime: '2025-10-10 10:45:45',
  },
];

const MOCK_FIELDS = [
  { name: 'txn_time', type: 'timestamp', desc: '交易時間', status: '失敗' },
  { name: 'period_days', type: 'int', desc: '統計期間（天）', status: '失敗' },
  { name: 'lookback_start', type: 'date', desc: '統計窗格起始', status: '成功' },
  { name: 'party_id', type: 'string', desc: '客戶識別碼', status: '成功' },
  { name: 'acct_id', type: 'string', desc: '帳戶識別碼', status: '成功' },
  { name: 'txn_amount', type: 'decimal', desc: '單筆金額', status: '成功' },
];

const MOCK_VERIFY_JOBS = [
  {
    id: 'V-2025Q4-001',
    title: '2025 Q4 分析 - 驗證 txna1101',
    createTime: '2025-11-19 10:00:00',
    startTime: '2025-01-01 00:00:00',
    endTime: '2025-05-31 23:59:59',
    status: 'Success',
    simulatedAlerts: 100,
    actualAlerts: 98,
    type1: 1, 
    type2: 1,
    params: { code: 'txna1101', limit: '1,000,000' },
    description: '此為 2025 年第四季之例行性驗證，主要針對 txna1101 態樣進行參數調整後之驗證。',
    notes: '驗證結果顯示 Type 1 錯誤較高，需進一步調查差異原因。',
    pid: '324834',
    scenarioCode: 'txna1101',
    scenarioSchedule: '月跑批',
    vendorParams: [
      { label: 'credit_limit', simulated: '1,000,000', actual: '1,000,000' },
      { label: 'debit_limit', simulated: '500,000', actual: '1,000,000' },
    ],
  },
  {
    id: 'V-2025Q4-002',
    title: '2025 Q4 分析 - 驗證 txna1102',
    createTime: '2025-11-20 14:00:00',
    startTime: '2025-01-01',
    endTime: '2025-05-31',
    status: 'In Progress',
    simulatedAlerts: 0,
    actualAlerts: 0,
    type1: 0,
    type2: 0,
    scenarioCode: 'txna1102',
    scenarioSchedule: '日跑批',
    vendorParams: [],
    description: '', notes: '', pid: ''
  }
];

const MOCK_HISTORY = [
  { dbName: 'TCA001', created: '2025-11-19 10:00:00', verifyCount: 100, scenarioCount: 100, range: '2025-01-01~2025-03-03' },
  { dbName: 'TCA002', created: '2025-10-15 09:30:00', verifyCount: 50, scenarioCount: 98, range: '2024-10-01~2024-12-31' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
      active
        ? 'bg-gray-800 text-white border-blue-500'
        : 'text-gray-400 border-transparent hover:bg-gray-800 hover:text-white'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Success: 'bg-green-100 text-green-700 border border-green-200',
    成功: 'bg-green-100 text-green-700 border border-green-200',
    Failed: 'bg-red-100 text-red-700 border border-red-200',
    失敗: 'bg-red-100 text-red-700 border border-red-200',
    'In Progress': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Not Started': 'bg-gray-100 text-gray-600 border border-gray-200',
    Active: 'bg-green-50 text-green-700 border border-green-200',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || 'bg-gray-100'
      }`}
    >
      {status}
    </span>
  );
};

// --- Mock Calendar Component for Report Tab ---
const ErrorCalendar = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-center text-xs font-medium text-gray-500 py-2">
        <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
      </div>
      <div className="grid grid-cols-7 text-sm bg-white">
        {/* Padding for start of month (e.g. starts on Thursday) */}
        <div className="h-24 border-b border-r p-2 bg-gray-50 text-gray-300">29</div>
        <div className="h-24 border-b border-r p-2 bg-gray-50 text-gray-300">30</div>
        <div className="h-24 border-b border-r p-2 bg-gray-50 text-gray-300">31</div>
        <div className="h-24 border-b border-r p-2 bg-gray-50 text-gray-300">32</div>
        
        {days.map(day => (
          <div key={day} className="h-24 border-b border-r border-gray-100 p-2 relative hover:bg-gray-50 transition-colors group">
            <span className="font-medium text-gray-700">{day}</span>
            {/* Mock Errors */}
            {(day === 1 || day === 4) && (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium truncate">型1錯誤: 50</div>
                <div className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium truncate">型2錯誤: 100</div>
              </div>
            )}
             {day === 17 && (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium truncate">型1錯誤: 50</div>
              </div>
            )}
             {day === 29 && (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium truncate">型2錯誤: 50</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Application ---

export default function AMLPortal() {
  // Global State
  const [appState, setAppState] = useState<AppState>('login'); 
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Project State
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Data Processing State
  const [processingStep, setProcessingStep] = useState(0); 
  
  // Field Mapping State
  const [fields, setFields] = useState(MOCK_FIELDS);
  const [editingField, setEditingField] = useState<any>(null);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [newFieldData, setNewFieldData] = useState({ name: '', desc: '', type: 'string' });
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'loading' | 'success'>('idle');

  // Verification State
  const [selectedVerify, setSelectedVerify] = useState<any>(null);
  const [isCreatingVerify, setIsCreatingVerify] = useState(false);
  const [verifyTab, setVerifyTab] = useState('report'); 

  // --- Helpers ---
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(username && password) {
        setAppState('projects');
    }
  };

  const handleCreateProject = () => {
    if (!newProjectName) return;
    const newProj = {
      id: Date.now(),
      name: newProjectName,
      created: new Date().toLocaleDateString('zh-TW'),
      lastEdited: new Date().toLocaleDateString('zh-TW'),
      status: 'Active'
    };
    setProjects([newProj, ...projects]);
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  const handleSelectProject = (project: any) => {
    setCurrentProject(project);
    setAppState('connect');
  };

  const checkFieldName = (name: string) => {
    const exists = fields.some(f => f.name === name);
    setIsNameDuplicate(exists);
    setNewFieldData({ ...newFieldData, name });
  };

  const handleSaveNewField = () => {
    if (!newFieldData.name || isNameDuplicate) return;
    const newField = {
      name: newFieldData.name,
      type: newFieldData.type,
      desc: newFieldData.desc,
      status: '失敗' 
    };
    setFields([...fields, newField]);
    setIsCreatingField(false);
    setNewFieldData({ name: '', desc: '', type: 'string' });
    setEditingField(newField);
  };

  const runTest = () => {
    setTestResult('loading');
    setTimeout(() => {
        setTestResult('success');
    }, 1000);
  };

  // Logic Simulation
  useEffect(() => {
    if (appState === 'processing') {
      const timer = setInterval(() => {
        setProcessingStep(prev => {
          if (prev >= 3) {
            clearInterval(timer);
            return 3;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [appState]);

  // --- Render Functions ---

  const renderLogin = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="text-center mb-8">
                <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                    <Activity size={28} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">XX Bank AML Portal</h1>
                <p className="text-gray-500 text-sm mt-2">請登入以存取反洗錢驗證系統</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors">
                    登入
                </button>
            </form>
        </div>
    </div>
  );

  const renderProjectList = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
           <Activity className="text-blue-500" />
           XX Bank AML Portal
        </div>
        <button onClick={() => setAppState('login')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
           <LogOut size={16} /> 登出
        </button>
      </div>
      <div className="flex-1 overflow-auto p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">專案列表</h1>
              <p className="text-gray-500">選擇一個專案以開始進行資料驗證，或建立新的專案。</p>
            </div>
            <button 
              onClick={() => setIsCreatingProject(true)}
              className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus size={18} /> 建立專案
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                 <tr>
                   <th className="p-6">專案名稱</th>
                   <th className="p-6">建立時間</th>
                   <th className="p-6">上次編輯時間</th>
                   <th className="p-6 w-20"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 text-sm">
                 {projects.map((proj) => (
                   <tr key={proj.id} onClick={() => handleSelectProject(proj)} className="hover:bg-blue-50 cursor-pointer transition-colors group">
                     <td className="p-6"><div className="font-bold text-gray-900 text-lg group-hover:text-blue-700 flex items-center gap-3"><Folder className="text-gray-400 group-hover:text-blue-500" size={20} />{proj.name}</div></td>
                     <td className="p-6 text-gray-500 font-mono">{proj.created}</td>
                     <td className="p-6 text-gray-500 font-mono">{proj.lastEdited}</td>
                     <td className="p-6 text-gray-400 text-right"><ChevronRight className="group-hover:text-blue-500" /></td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
      {isCreatingProject && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-900">建立新專案</h3>
                 <button onClick={() => setIsCreatingProject(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">專案名稱</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} autoFocus placeholder="未命名專案" />
                 </div>
                 <div className="pt-2 flex justify-end gap-3">
                    <button onClick={() => setIsCreatingProject(false)} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg">取消</button>
                    <button onClick={handleCreateProject} className="px-4 py-2 text-sm text-white font-medium bg-black hover:bg-gray-800 rounded-lg">確定</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderConnect = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 items-center justify-center font-sans relative">
      <button onClick={() => { setAppState('projects'); setCurrentProject(null); }} className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /> 返回專案列表</button>
      <div className="bg-white p-10 rounded-xl shadow-xl border border-gray-200 w-full max-w-lg">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-3"><Folder size={12} /> {currentProject?.name}</div>
           <h2 className="text-2xl font-bold text-gray-900">連接資料庫</h2>
        </div>
        <div className="space-y-6">
          <div><label className="block text-sm font-bold text-gray-700 mb-2">資料庫類型</label><select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"><option value="sas">SAS</option><option value="northwind">Northwind</option></select></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2">資料夾路徑</label><input type="text" defaultValue="/XX/XXXXX/2025Q3_Trade_Data" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2">專案起訖日</label><div className="flex gap-2"><input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm" /><input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm" /></div></div>
          <div className="pt-4 flex gap-4"><button onClick={() => setAppState('projects')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg border border-gray-300">取消</button><button onClick={() => setAppState('processing')} className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg">確定</button></div>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 items-center justify-center font-sans">
      <div className="bg-white p-12 rounded-xl shadow-xl border border-gray-200 w-full max-w-3xl">
         <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8"><RefreshCw size={24} className={processingStep < 3 ? 'animate-spin text-blue-600' : 'text-green-600'} /> {processingStep < 3 ? '資料處理中...' : '資料處理完成'}</h2>
         <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm font-bold text-gray-700">Step 1. 擷取 (Extract)</span> 
                <span className={`text-sm font-medium ${processingStep >= 1 ? 'text-green-600 flex items-center gap-1' : 'text-gray-400'}`}>
                    {processingStep >= 1 ? <><CheckCircle size={14}/> 完成</> : '...'}
                </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm font-bold text-gray-700">Step 2. 標準化 (Transform)</span> 
                <span className={`text-sm font-medium ${processingStep >= 2 ? 'text-green-600 flex items-center gap-1' : 'text-gray-400'}`}>
                    {processingStep >= 2 ? <><CheckCircle size={14}/> 完成</> : '...'}
                </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm font-bold text-gray-700">Step 3. 載入 (Load)</span> 
                <span className={`text-sm font-medium ${processingStep >= 3 ? 'text-green-600 flex items-center gap-1' : 'text-gray-400'}`}>
                    {processingStep >= 3 ? <><CheckCircle size={14}/> 完成</> : '...'}
                </span>
            </div>
         </div>
         <div className="mt-12 flex justify-end gap-3">
            {processingStep < 3 && <button onClick={() => setAppState('connect')} className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">停止串接</button>}
            <button disabled={processingStep < 3} onClick={() => setAppState('portal')} className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${processingStep < 3 ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800'}`}>進入系統</button>
         </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="p-8 space-y-8 w-full max-w-7xl mx-auto font-sans">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center animate-fade-in-down">
         <div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-full"><CheckCircle size={20} className="text-green-600" /></div><div><div className="text-xs text-gray-500">已成功串接資料源</div><div className="font-bold text-gray-900">2025Q3 交易資料 (SAS)</div></div></div>
         <div className="flex gap-3"><button onClick={() => setActiveTab('verify')} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">開始驗證</button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"><div className="text-gray-500 text-sm font-medium uppercase tracking-wider">發生錯誤</div><div className="text-4xl font-bold text-red-600 mt-2">12</div><div className="text-xs text-gray-400 mt-2">Last 7 days</div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"><div className="text-gray-500 text-sm font-medium uppercase tracking-wider">正在進行中</div><div className="text-4xl font-bold text-blue-600 mt-2">5</div><div className="text-xs text-gray-400 mt-2">Last 7 days</div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"><div className="text-gray-500 text-sm font-medium uppercase tracking-wider">已完成驗證</div><div className="text-4xl font-bold text-green-600 mt-2">128</div><div className="text-xs text-gray-400 mt-2">Last 7 days</div></div>
      </div>
    </div>
  );

  // 4.0 欄位對映 (Field Mapping) - 3 Column Layout
  const renderFields = () => {
    // 4.2 Create Field Mode
    if (isCreatingField) {
      return (
        <div className="flex flex-col h-full w-full bg-gray-50 font-sans">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => { setIsCreatingField(false); setIsNameDuplicate(false); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-lg font-bold text-gray-900">新增標準化欄位</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setIsCreatingField(false); setIsNameDuplicate(false); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg">取消</button>
              <button onClick={handleSaveNewField} className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 shadow-sm">儲存</button>
            </div>
          </div>
          
          <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">標準化欄位名稱 <span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   placeholder="需以英文命名，並以底線隔開 (例如: user_id)"
                   className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 outline-none ${isNameDuplicate ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                   value={newFieldData.name}
                   onChange={(e) => checkFieldName(e.target.value)}
                 />
                 {isNameDuplicate && <div className="text-red-500 text-xs mt-1">此欄位名稱已存在，請使用不同的名稱</div>}
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">欄位簡述 <span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   placeholder="輸入中文欄位名稱"
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   value={newFieldData.desc}
                   onChange={(e) => setNewFieldData({...newFieldData, desc: e.target.value})}
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">資料型態 <span className="text-red-500">*</span></label>
                 <select 
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                   value={newFieldData.type}
                   onChange={(e) => setNewFieldData({...newFieldData, type: e.target.value})}
                 >
                   <option value="string">string</option>
                   <option value="int">int</option>
                   <option value="decimal">decimal</option>
                   <option value="timestamp">timestamp</option>
                   <option value="date">date</option>
                 </select>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">腳本程式 (Javascript/SQL) <span className="text-red-500">*</span></label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden h-40 bg-gray-900">
                     <textarea className="w-full h-full p-4 font-mono text-sm bg-transparent text-green-400 outline-none resize-none" defaultValue="// Input your logic here..." />
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
    }

    // 4.1 Edit/Detail Mode (3 Column Layout)
    if (editingField) {
      return (
        <div className="flex flex-col w-full h-full bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => setEditingField(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {editingField.name} 
                  <span className="text-gray-400 font-normal">| {editingField.desc}</span>
                </h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                   <span>資料型態: <span className="font-mono text-gray-700 bg-gray-100 px-1 rounded">{editingField.type}</span></span>
                </div>
              </div>
              <StatusBadge status={editingField.status} />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg">重置</button>
              <button onClick={() => setEditingField(null)} className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 shadow-sm flex items-center gap-2"><Save size={14}/> 儲存</button>
            </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Source Browser */}
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">來源資料表</div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                  <input type="text" placeholder="搜尋來源資料表..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-4">
                <div>
                  <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase flex justify-between">
                    交易明細檔 <span className="text-gray-400 bg-gray-100 px-1 rounded">3 Fields</span>
                  </div>
                  {['Txn_Amt', 'Txn_Type', 'Txn_Date'].map(col => (
                    <div key={col} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded cursor-pointer group transition-colors">
                      <Database size={12} className="text-gray-400 group-hover:text-blue-400" />
                      {col}
                    </div>
                  ))}
                </div>
                <div>
                   <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase flex justify-between">
                    匯率檔 <span className="text-gray-400 bg-gray-100 px-1 rounded">2 Fields</span>
                   </div>
                    {['Rate', 'Currency'].map(col => (
                    <div key={col} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded cursor-pointer group transition-colors">
                      <Database size={12} className="text-gray-400 group-hover:text-blue-400" />
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle: Rule Editor */}
            <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
              <div className="p-6 h-full flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">轉換規則說明</label>
                  <textarea 
                    className="w-full text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    defaultValue="加總當日所有幣別交易，並依據當日中價匯率轉換為台幣，排除手續費交易碼 '999'"
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-gray-700">腳本程式</label>
                     <div className="flex gap-2">
                       <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded bg-white">
                         <Code size={12}/> Javascript
                       </button>
                     </div>
                  </div>
                  <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden flex flex-col relative border border-gray-800 shadow-inner">
                     <textarea 
                      className="w-full h-full bg-transparent text-green-400 font-mono text-sm p-4 outline-none resize-none"
                      defaultValue={`// 轉換規則邏輯
if (row.Txn_Type !== '999') {
  return row.Currency === 'TWD' 
    ? row.Txn_Amt 
    : row.Txn_Amt * row.Rate;
} else {
  return 0;
}`}
                     ></textarea>
                  </div>
                  {editingField.status === '失敗' && (
                    <div className="mt-2 text-red-500 text-xs flex items-center gap-1 bg-red-50 p-2 rounded border border-red-100">
                      <AlertOctagon size={12} /> 上次驗證失敗，請檢查邏輯後重新測試
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="w-1/4 bg-white flex flex-col">
               <div className="p-4 border-b border-gray-200">
                 <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Play size={16} className="text-blue-500" /> 轉換預覽
                 </h4>
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs text-gray-500 font-bold mb-1 block">開始時間</label>
                     <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" defaultValue="2026-01-01" />
                   </div>
                   <div>
                     <label className="text-xs text-gray-500 font-bold mb-1 block">結束時間</label>
                     <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" defaultValue="2026-03-31" />
                   </div>
                   <button 
                     onClick={runTest}
                     className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                   >
                     {testResult === 'loading' ? <RefreshCw className="animate-spin" size={14}/> : <Play size={14}/>} 
                     {testResult === 'loading' ? '測試中...' : '開始測試轉換'}
                   </button>
                 </div>
               </div>
               <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                 {!testResult || testResult === 'idle' ? (
                   <div className="text-center text-gray-400 text-xs mt-10">
                     請輸入測試 Key 或日期區間<br/>點擊「開始測試轉換」以查看結果
                   </div>
                 ) : testResult === 'success' && (
                    <div className="space-y-3 animate-fade-in-up">
                        <div className="text-xs font-bold text-green-600 uppercase flex justify-between items-center mb-2">
                            Output Result <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px]">OK</span>
                        </div>
                        {[10000, 3999, 100, 10, 13903].map((val, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 p-3 rounded text-sm font-mono text-gray-600 shadow-sm flex justify-between">
                                <span>Row {idx+1}</span>
                                <span className="font-bold text-gray-800">{val.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      );
    }

    // 4.0 List Mode
    return (
      <div className="p-8 w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">欄位對映 (Field Mapping)</h2>
            <p className="text-gray-500 text-sm mt-1">總共 {fields.length} 個標準欄位，請設定轉換規則</p>
          </div>
          <button 
            onClick={() => { setIsCreatingField(true); setNewFieldData({name:'', desc:'', type:'string'}); }}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm flex items-center gap-2"
          >
            <Plus size={16} /> 新增標準化欄位
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-5">標準化欄位名稱</th>
                <th className="p-5">資料型態</th>
                <th className="p-5">欄位簡述</th>
                <th className="p-5">對映狀態</th>
                <th className="p-5 text-right">動作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {fields.map((field, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 font-mono font-medium text-blue-700">{field.name}</td>
                  <td className="p-5 text-gray-500 font-mono text-xs"><span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">{field.type}</span></td>
                  <td className="p-5 text-gray-700">{field.desc}</td>
                  <td className="p-5"><StatusBadge status={field.status} /></td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => { setEditingField(field); setTestResult('idle'); }}
                      className="text-gray-500 hover:text-blue-600 font-medium text-xs border border-gray-200 px-3 py-1.5 rounded bg-white hover:bg-blue-50 transition-colors"
                    >
                      編輯規則
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVendorParams = () => (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-900">原廠態樣參數</h2></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-5 w-24">態樣</th>
                <th className="p-5 w-24">AML 排程規則</th>
                <th className="p-5">參數 (Value)</th>
                <th className="p-5">啟用期間</th>
                <th className="p-5">更新時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {MOCK_VENDOR_PARAMS.map((param, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-5 font-mono font-medium text-gray-900">{param.id}</td>
                  <td className="p-5"><span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">{param.schedule}</span></td>
                  <td className="p-5 font-mono text-blue-700 font-medium">{param.paramName}: {param.value}</td>
                  <td className="p-5 text-gray-600">{param.duration}</td>
                  <td className="p-5 text-gray-400 text-xs">{param.updateTime}</td>
                </tr>
              ))}
            </tbody>
         </table>
      </div>
    </div>
  );

  // 6.0 態樣驗證
  const renderVerification = () => {

    // 6.4 Verification Report Detail View
    const renderVerifyReportTab = (selectedVerify: any) => {
      const chartData = [
        { name: '1月', simulated: 200, actual: 195, type1: 5, type2: 3 },
        { name: '2月', simulated: 250, actual: 247, type1: 3, type2: 1 },
        { name: '3月', simulated: 300, actual: 294, type1: 6, type2: 2 },
        { name: '4月', simulated: 180, actual: 178, type1: 2, type2: 0 },
        { name: '5月', simulated: 220, actual: 216, type1: 4, type2: 1 },
      ];
      
      const mockType2Errors = [
        { id: '309999', title: '異常交易 (大額)', reason: '交易金額誤判', status: 'In Progress', date: '2025-02-10 10:00:00' },
        { id: '310000', title: '異常交易 (小額)', reason: '交易時間誤判', status: 'Not Started', date: '2025-02-12 11:30:00' },
        { id: '310001', title: '異常交易 (現金)', reason: '幣別錯誤', status: 'In Progress', date: '2025-02-15 09:15:00' },
      ];

      return (
        <div className="flex gap-6 animate-fade-in">
          {/* Left Column (Verification Info) */}
          <div className="w-80 space-y-4 flex-shrink-0">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={selectedVerify.status} />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 font-medium text-xs uppercase mb-1">標題</div>
                  <div className="text-gray-900 font-bold">{selectedVerify.title}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium text-xs uppercase mb-1">描述</div>
                  <div className="text-gray-600">{selectedVerify.description || '無描述'}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium text-xs uppercase mb-1">期間</div>
                  <div className="text-gray-700 font-mono text-xs bg-gray-50 p-2 rounded border border-gray-100">
                    {selectedVerify.startTime}<br />~ {selectedVerify.endTime}
                  </div>
                </div>
              </div>
            </div>

            {/* System Comparison Counts */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">系統交集數量</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">本系統 (模擬)</span>
                        <span className="font-mono font-bold">10,000</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">行內 AML (實際)</span>
                        <span className="font-mono font-bold">9,999</span>
                    </div>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium">互相交集</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-green-700">9,998</span>
                            <button className="text-[10px] bg-gray-100 px-1.5 rounded hover:bg-gray-200">查看</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-red-600 font-medium">無交集</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-red-700">100</span>
                            <button className="text-[10px] bg-gray-100 px-1.5 rounded hover:bg-gray-200">查看</button>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column (Errors and Reports) */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Search/Filter Block */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="font-bold text-gray-800">驗證結果分析</h4>
                 <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><Filter size={14}/> 篩選</button>
                    <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 shadow-sm"><Download size={14} /> 匯出 Excel</button>
                 </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-xs text-gray-500 uppercase font-bold">模擬產生 Alert</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">100</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-xs text-gray-500 uppercase font-bold">實際產生 Alert</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">98</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex gap-4">
                      <div>
                        <div className="text-xs text-red-500 uppercase font-bold">型1錯誤</div>
                        <div className="text-2xl font-bold text-red-600 mt-1">1</div>
                      </div>
                      <div className="w-px bg-gray-200"></div>
                      <div>
                        <div className="text-xs text-orange-500 uppercase font-bold">型2錯誤</div>
                        <div className="text-2xl font-bold text-orange-600 mt-1">1</div>
                      </div>
                  </div>
              </div>
            </div>

            {/* Error Calendar */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={18}/> 錯誤概覽行事曆</h4>
                    <span className="text-xs text-gray-500">2026年 1月</span>
                </div>
                <ErrorCalendar />
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 gap-6">
                {/* Type 1 Error Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-red-50/50">
                        <h4 className="font-bold text-red-700 flex items-center gap-2 text-sm"><AlertOctagon size={16} /> 型1錯誤 (本系統有, 實際無)</h4>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr><th className="px-4 py-3">月份</th><th className="px-4 py-3 text-right">數量</th><th className="px-4 py-3 text-right">佔比</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {chartData.map((d, i) => (
                                <tr key={i} className="hover:bg-red-50 transition-colors">
                                    <td className="px-4 py-3 font-medium">{d.name}</td>
                                    <td className="px-4 py-3 text-right font-mono text-red-600">{d.type1}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{((d.type1/d.simulated)*100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Type 2 Error Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/50">
                        <h4 className="font-bold text-orange-700 flex items-center gap-2 text-sm"><AlertOctagon size={16} /> 型2錯誤 (本系統無, 實際有)</h4>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">原因</th><th className="px-4 py-3 text-right">狀態</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockType2Errors.map((d, i) => (
                                <tr key={i} className="hover:bg-orange-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs">{d.id}</td>
                                    <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]">{d.reason}</td>
                                    <td className="px-4 py-3 text-right"><StatusBadge status={d.status}/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </div>
      );
    };

    if (isCreatingVerify) {
      return (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
             <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900">新增驗證</h2><button onClick={() => setIsCreatingVerify(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
             <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <div><label className="block text-sm font-bold text-gray-700 mb-2">標題 <span className="text-red-500">*</span></label><input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue="2025 Q4 驗證" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">敘述 <span className="text-red-500">*</span></label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20" defaultValue="2025 Q4 驗證說明..." /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">資料區間 <span className="text-red-500">*</span></label><div className="flex gap-2 items-center"><input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-12-01T00:00" /><span>~</span><input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-12-10T00:00" /></div></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">態樣 <span className="text-red-500">*</span></label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"><option>txna1101 (月跑批)</option></select></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">原廠態樣參數 vs 預計驗證參數</label><div className="border border-gray-200 rounded-lg overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="p-3 border-b border-gray-200">參數名稱</th><th className="p-3 border-b border-gray-200">原廠設定</th><th className="p-3 border-b border-gray-200">預計驗證參數</th></tr></thead><tbody className="divide-y divide-gray-100"><tr><td className="p-3 font-mono">credit_limit</td><td className="p-3 text-gray-500 font-mono">1,000,000</td><td className="p-3"><input type="text" className="w-full border border-blue-300 bg-blue-50 rounded px-2 py-1 text-blue-800 font-medium font-mono text-right" defaultValue="1,000,000" /></td></tr></tbody></table></div></div>
             </div>
             <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3"><button onClick={() => setIsCreatingVerify(false)} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-lg">取消</button><button onClick={() => setIsCreatingVerify(false)} className="px-4 py-2 text-sm text-white font-medium bg-black hover:bg-gray-800 rounded-lg flex items-center gap-2">儲存</button></div>
          </div>
        </div>
      );
    }

    // 6.3 Detail View
    if (selectedVerify) {
      return (
        <div className="flex flex-col h-full w-full bg-gray-100 font-sans">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-4">
               <button onClick={() => setSelectedVerify(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ArrowLeft size={20} /></button>
               <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedVerify.title}</h2>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1 items-center"><span>建立時間: {selectedVerify.createTime}</span></div>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-700 bg-white shadow-sm"><MoreHorizontal size={16} /> 更多</button>
               <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm"><Download size={16} /> 匯出報告</button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-gray-50 border-b border-gray-200 px-8">
            <nav className="flex gap-4">
              {['設定', '驗證報告', '差異調查紀錄'].map(tab => {
                const mapKey = tab === '設定' ? 'setting' : tab === '驗證報告' ? 'report' : 'diff';
                const isSelected = verifyTab === mapKey;
                return (
                  <button 
                    key={tab} 
                    onClick={() => setVerifyTab(mapKey)} 
                    className={`py-4 px-2 text-sm font-medium border-b-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-[1600px] mx-auto">
              {/* 6.4 Report Tab Content */}
              {verifyTab === 'report' && renderVerifyReportTab(selectedVerify)}
              
              {/* 6.3 Setting Tab Content */}
              {verifyTab === 'setting' && (
                  <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6 animate-fade-in">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">驗證設定</h3>
                      <div className="space-y-5">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">標題</label>
                              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={selectedVerify.title} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">描述</label>
                              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" defaultValue={selectedVerify.description} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">資料區間</label>
                              <div className="flex gap-2 items-center">
                                  <input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue={selectedVerify.startTime.replace(' ', 'T').substring(0, 16)} />
                                  <span>~</span>
                                  <input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue={selectedVerify.endTime.replace(' ', 'T').substring(0, 16)} />
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">態樣</label>
                              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" defaultValue={selectedVerify.scenarioCode}>
                                  <option>{selectedVerify.scenarioCode} ({selectedVerify.scenarioSchedule})</option>
                              </select>
                          </div>
                          <div className="pt-6 flex justify-end border-t border-gray-100">
                              <button className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md flex items-center gap-2"><Save size={16} /> 儲存修改</button>
                          </div>
                      </div>
                  </div>
              )}

              {/* 6.5 Diff Log Tab Content */}
              {verifyTab === 'diff' && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold text-gray-900">差異調查紀錄</h2>
                          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm flex items-center gap-2"><Plus size={16} /> 新增調查</button>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <table className="w-full text-left">
                              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                                  <tr>
                                      <th className="p-4">ID</th>
                                      <th className="p-4">警示/差異 ID</th>
                                      <th className="p-4">差異類型</th>
                                      <th className="p-4">調查描述</th>
                                      <th className="p-4">建立時間</th>
                                      <th className="p-4 text-right">狀態</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-sm">
                                  {[
                                      { id: 'I-001', diffId: '309999', type: '型2錯誤', desc: '確認交易時間誤判，已排除。', time: '2025-06-01 11:30', status: 'In Progress' },
                                      { id: 'I-002', diffId: 'A-002', type: '型1錯誤', desc: '檢查參數設定，已確認為預期差異。', time: '2025-06-02 10:00', status: 'Success' },
                                  ].map((log, i) => (
                                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                                          <td className="p-4 font-mono font-medium text-gray-900">{log.id}</td>
                                          <td className="p-4 text-blue-700 font-mono text-xs hover:underline cursor-pointer">{log.diffId}</td>
                                          <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-medium ${log.type === '型1錯誤' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{log.type}</span></td>
                                          <td className="p-4 text-gray-700">{log.desc}</td>
                                          <td className="p-4 text-gray-500 text-xs font-mono">{log.time}</td>
                                          <td className="p-4 text-right"><StatusBadge status={log.status} /></td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 6.0 List View
    return (
      <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">態樣驗證</h2>
            <button onClick={() => setIsCreatingVerify(true)} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm flex items-center gap-2 hover:scale-105 transition-transform"><Plus size={16}/> 新增驗證</button>
        </div>
        
        {/* Search Bar for List */}
        <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="搜尋態樣驗證..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white outline-none">
                <option>全部狀態</option>
                <option>Success</option>
                <option>In Progress</option>
                <option>Failed</option>
            </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold"><tr><th className="p-5">標題</th><th className="p-5">建立時間</th><th className="p-5">驗證起訖時間</th><th className="p-5 text-right">型1錯誤</th><th className="p-5 text-right">型2錯誤</th><th className="p-5">驗證狀態</th><th className="p-5"></th></tr></thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {MOCK_VERIFY_JOBS.map(job => (
                    <tr key={job.id} onClick={() => setSelectedVerify(job)} className="hover:bg-blue-50 cursor-pointer transition-colors group">
                        <td className="p-5 font-medium text-gray-900 group-hover:text-blue-700">{job.title}</td>
                        <td className="p-5 text-gray-500 text-xs font-mono">{job.createTime}</td>
                        <td className="p-5 text-gray-500 text-xs font-mono">
                            <div className="flex items-center gap-1"><span className="w-1 h-1 bg-green-400 rounded-full"></span> {job.startTime.split(' ')[0]}</div>
                            <div className="flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full"></span> {job.endTime.split(' ')[0]}</div>
                        </td>
                        <td className="p-5 text-right font-mono text-red-600 font-bold">{job.type1}</td>
                        <td className="p-5 text-right font-mono text-orange-600 font-bold">{job.type2}</td>
                        <td className="p-5"><StatusBadge status={job.status} /></td>
                        <td className="p-5 text-gray-400 text-right"><ChevronRight size={18} className="group-hover:text-blue-500"/></td>
                    </tr>
                ))}
              </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
      <h2 className="text-2xl font-bold text-gray-900">歷史紀錄</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold"><tr><th className="p-5">DB 名稱</th><th className="p-5">建立時間</th><th className="p-5 text-right">已建立驗證數</th><th className="p-5 text-right">驗證的態樣數</th><th className="p-5">專案起訖日</th></tr></thead>
           <tbody className="divide-y divide-gray-100 text-sm">{MOCK_HISTORY.map((h, i) => (<tr key={i} className="hover:bg-gray-50"><td className="p-5 font-medium text-gray-900 flex items-center gap-2"><Database size={14} className="text-gray-400"/> {h.dbName}</td><td className="p-5 text-gray-500 font-mono">{h.created}</td><td className="p-5 text-right font-mono">{h.verifyCount}</td><td className="p-5 text-right font-mono">{h.scenarioCount}</td><td className="p-5 text-gray-500 font-mono">{h.range}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );

  // --- Main Logic Switch ---

  if (appState === 'login') return renderLogin();
  if (appState === 'projects') return renderProjectList();
  if (appState === 'connect') return renderConnect();
  if (appState === 'processing') return renderProcessing();

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <div className="w-64 bg-gray-900 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="text-white font-bold text-lg tracking-wide flex items-center gap-2"><Activity className="text-blue-500" />AML Portal</div>
          <div className="text-gray-500 text-xs mt-2 flex items-center gap-1 bg-gray-800 py-1 px-2 rounded"><Folder size={12} /> {currentProject?.name}</div>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="總覽" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={Database} label="欄位對映" active={activeTab === 'fields'} onClick={() => { setActiveTab('fields'); setEditingField(null); setIsCreatingField(false); }} />
          <SidebarItem icon={FileText} label="原廠態樣參數" active={activeTab === 'params'} onClick={() => setActiveTab('params')} />
          <SidebarItem icon={CheckCircle} label="態樣驗證" active={activeTab === 'verify'} onClick={() => { setActiveTab('verify'); setSelectedVerify(null); setIsCreatingVerify(false); }} />
          <SidebarItem icon={History} label="歷史紀錄" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors" onClick={() => { setAppState('projects'); setCurrentProject(null); }}>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">U1</div>
             <div className="text-sm overflow-hidden flex-1">
                 <div className="text-gray-200 font-medium truncate">User001</div>
                 <div className="text-xs text-gray-500">切換專案</div>
             </div>
             <LogOut size={16} />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-8 shadow-sm z-10 flex-shrink-0">
           <div className="flex items-center gap-2 text-sm text-gray-500">
             <span className="font-bold text-gray-800 text-lg">
               {activeTab === 'overview' && '總覽'}
               {activeTab === 'fields' && '欄位對映'}
               {activeTab === 'params' && '原廠態樣參數'}
               {activeTab === 'verify' && '態樣驗證'}
               {activeTab === 'history' && '歷史紀錄'}
             </span>
           </div>
           {activeTab === 'overview' && <button onClick={() => setAppState('connect')} className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md"><RefreshCw size={14}/> 重新串接資料源</button>}
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 w-full relative">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'fields' && renderFields()}
          {activeTab === 'params' && renderVendorParams()}
          {activeTab === 'verify' && renderVerification()}
          {activeTab === 'history' && renderHistory()}
        </main>
      </div>
    </div>
  );
}
