import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Activity,
  CheckCircle,
  Database,
  Bell,
  Settings,
  ChevronRight,
  Folder,
  Clock,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Save,
  Search,
  Play,
  Calendar,
  X,
  Server,
  RefreshCw,
  FileCode,
  AlertOctagon,
  History,
  MoreHorizontal,
  Download,
  Plus,
  Users
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

// --- Mock Data ---

// 新增：專案列表資料
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
  // ... 其他資料保持不變
];

const MOCK_FIELDS = [
  { name: 'txn_time', type: 'timestamp', desc: '交易時間', status: '失敗' },
  { name: 'period_days', type: 'int', desc: '統計期間（天）', status: '失敗' },
  { name: 'lookback_start', type: 'date', desc: '統計窗格起始', status: '成功' },
  { name: 'party_id', type: 'string', desc: '客戶識別碼', status: '成功' },
  { name: 'acct_id', type: 'string', desc: '帳戶識別碼', status: '成功' },
  { name: 'txn_amount', type: 'decimal', desc: '單筆金額', status: '成功' },
  { name: 'txn_ccy', type: 'string', desc: '幣別', status: '成功' },
];

const MOCK_VERIFY_JOBS = [
  {
    id: 'V-2025Q4-001',
    title: '2025 Q4 分析 - 驗證 txna1101',
    createTime: '2025-11-19 10:00:00',
    startTime: '2025-11-20 10:00',
    endTime: '2025-11-21 10:00',
    status: 'Success',
    simulatedAlerts: 100,
    actualAlerts: 98,
    type1: 1, 
    type2: 1,
    params: { code: 'txna1101', limit: '1,000,000' }
  },
  // ... 其他資料保持不變
];

const MOCK_HISTORY = [
  { dbName: 'TCA001', created: '2025-11-19 10:00:00', verifyCount: 100, scenarioCount: 100, range: '2025-01-01~2025-03-03' },
  { dbName: 'TCA002', created: '2025-10-15 09:30:00', verifyCount: 50, scenarioCount: 98, range: '2024-10-01~2024-12-31' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
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

const StatusBadge = ({ status }) => {
  const styles = {
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

// --- Main Application ---

export default function AMLPortal() {
  // Global State
  // 修改狀態流程: projects -> connect -> processing -> portal
  const [appState, setAppState] = useState('projects'); 
  const [activeTab, setActiveTab] = useState('overview');
  
  // Project State
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [currentProject, setCurrentProject] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Data Processing State
  const [processingStep, setProcessingStep] = useState(0); 
  
  // Field Mapping State
  const [editingField, setEditingField] = useState(null);

  // Verification State
  const [selectedVerify, setSelectedVerify] = useState(null);
  const [isCreatingVerify, setIsCreatingVerify] = useState(false);
  const [verifyTab, setVerifyTab] = useState('report');

  // --- Helpers ---
  
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

  const handleSelectProject = (project) => {
    setCurrentProject(project);
    setAppState('connect'); // 進入連接資料庫畫面
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

  // --- Views ---

  // 0. Project List View (新增的頁面)
  const renderProjectList = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 font-sans">
      {/* Top Bar for Project List */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
           <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">XX</div>
           XX Bank AML Portal
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
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
              className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-lg flex items-center gap-2 transition-transform active:scale-95"
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
                   <tr 
                     key={proj.id} 
                     onClick={() => handleSelectProject(proj)}
                     className="hover:bg-blue-50 cursor-pointer transition-colors group"
                   >
                     <td className="p-6">
                        <div className="font-bold text-gray-900 text-lg group-hover:text-blue-700 flex items-center gap-3">
                           <Folder className="text-gray-400 group-hover:text-blue-500" size={20} />
                           {proj.name}
                        </div>
                     </td>
                     <td className="p-6 text-gray-500 font-mono">{proj.created}</td>
                     <td className="p-6 text-gray-500 font-mono">{proj.lastEdited}</td>
                     <td className="p-6 text-gray-400 text-right">
                        <ChevronRight className="group-hover:text-blue-500" />
                     </td>
                   </tr>
                 ))}
                 {projects.length === 0 && (
                   <tr>
                     <td colSpan="4" className="p-12 text-center text-gray-400">
                        目前沒有專案，請點擊「建立專案」開始使用。
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreatingProject && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-900">建立新專案</h3>
                 <button onClick={() => setIsCreatingProject(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">專案名稱</label>
                    <input 
                      type="text" 
                      placeholder="請輸入專案名稱 (例如: 倫敦分行)" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      autoFocus
                    />
                 </div>
                 <div className="pt-2 flex justify-end gap-3">
                    <button onClick={() => setIsCreatingProject(false)} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg">取消</button>
                    <button onClick={handleCreateProject} className="px-4 py-2 text-sm text-white font-medium bg-black hover:bg-gray-800 rounded-lg">確定建立</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  // 1. Data Connection View (修改過，加入返回專案列表)
  const renderConnect = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 items-center justify-center font-sans relative">
      <button 
        onClick={() => { setAppState('projects'); setCurrentProject(null); }}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} /> 返回專案列表
      </button>

      <div className="bg-white p-10 rounded-xl shadow-xl border border-gray-200 w-full max-w-lg">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-3">
              <Folder size={12} /> {currentProject?.name}
           </div>
           <h2 className="text-2xl font-bold text-gray-900">連接資料庫</h2>
           <p className="text-gray-500 text-sm mt-2">請設定此專案的資料來源以進行分析</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">資料庫類型</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="sas">SAS</option>
              <option value="northwind">Northwind</option>
              <option value="oracle">Oracle DB</option>
            </select>
          </div>

           <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">資料夾路徑</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                defaultValue="/XX/XXXXX/2025Q3_Trade_Data"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-3 rounded-lg border border-gray-300">
                <Folder size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">專案起訖日</label>
            <div className="flex gap-2 items-center">
               <input type="date" className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm" defaultValue="2025-01-01" />
               <span className="text-gray-400">~</span>
               <input type="date" className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm" defaultValue="2025-03-31" />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => setAppState('projects')}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg border border-gray-300 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={() => setAppState('processing')}
              className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              確定 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Data Processing View (保持不變)
  const renderProcessing = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 items-center justify-center font-sans">
      <div className="bg-white p-12 rounded-xl shadow-xl border border-gray-200 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className={`p-2 rounded-full ${processingStep < 3 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
               <RefreshCw size={24} className={processingStep < 3 ? 'animate-spin' : ''} /> 
            </div>
            {processingStep < 3 ? '資料處理中...' : '資料處理完成'}
          </h2>
          <span className="text-gray-500 font-mono text-sm">2025Q3 交易資料</span>
        </div>
        
        <div className="space-y-10">
          {/* Step 1: Extract */}
          <div className="relative">
            <div className="flex justify-between items-end mb-2">
              <span className={`text-sm font-bold uppercase tracking-wider ${processingStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Step 1. 擷取 (Extract)</span>
              {processingStep === 0 && <span className="text-blue-600 text-xs animate-pulse">正在讀取 DB...</span>}
              {processingStep >= 1 && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={12}/> 完成</span>}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${processingStep >= 1 ? 'bg-green-500 w-full' : processingStep === 0 ? 'bg-blue-500 w-1/2' : 'w-0'}`}
              ></div>
            </div>
          </div>

          {/* Step 2: Transform */}
          <div className="relative">
             <div className="flex justify-between items-end mb-2">
              <span className={`text-sm font-bold uppercase tracking-wider ${processingStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Step 2. 標準化 (Transform)</span>
              {processingStep === 1 && <span className="text-blue-600 text-xs animate-pulse">檢查資料格式，進行欄位對映...</span>}
              {processingStep >= 2 && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={12}/> 完成</span>}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                 className={`h-full transition-all duration-700 ease-out ${processingStep >= 2 ? 'bg-green-500 w-full' : processingStep === 1 ? 'bg-blue-500 w-2/3' : 'w-0'}`}
              ></div>
            </div>
          </div>

          {/* Step 3: Load */}
          <div className="relative">
             <div className="flex justify-between items-end mb-2">
              <span className={`text-sm font-bold uppercase tracking-wider ${processingStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Step 3. 載入 (Load)</span>
              {processingStep === 2 && <span className="text-blue-600 text-xs animate-pulse">寫入驗證資料庫...</span>}
              {processingStep >= 3 && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={12}/> 完成</span>}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-700 ease-out ${processingStep >= 3 ? 'bg-green-500 w-full' : processingStep === 2 ? 'bg-blue-500 w-3/4' : 'w-0'}`}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end gap-3">
           <button 
             onClick={() => setAppState('connect')}
             className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100"
           >
             停止串接
           </button>
           <button 
            disabled={processingStep < 3}
            onClick={() => setAppState('portal')}
            className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              processingStep < 3 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800 text-white shadow-lg'
            }`}
          >
            進入系統 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // 3. Portal Views (保持不變)

  // 3.1 總覽 (Dashboard)
  const renderOverview = () => (
    <div className="p-8 space-y-8 animate-fade-in w-full max-w-7xl mx-auto font-sans">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
               <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
               <div className="text-xs text-gray-500">已成功串接資料源</div>
               <div className="font-bold text-gray-900">2025Q3 交易資料 (SAS)</div>
            </div>
         </div>
         <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
               查看原廠參數
            </button>
            <button onClick={() => setActiveTab('verify')} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
               開始驗證
            </button>
         </div>
      </div>

      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-900">驗證總覽</h2>
        <div className="text-sm text-gray-500">Last updated: 2025-11-21 14:30</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertOctagon size={80} className="text-red-500" />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">發生錯誤 (Last 7 days)</div>
            <div className="text-4xl font-bold text-gray-800 mt-2">12 <span className="text-lg font-normal text-gray-400">件</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded font-medium">Type 1: 8</span>
            <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded font-medium">Type 2: 4</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={80} className="text-blue-500" />
          </div>
          <div>
             <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">正在進行中</div>
             <div className="text-4xl font-bold text-gray-800 mt-2">5 <span className="text-lg font-normal text-gray-400">件</span></div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
             <div className="bg-blue-500 h-1.5 rounded-full w-2/3"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle size={80} className="text-green-500" />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">已完成驗證 (Last 7 days)</div>
            <div className="text-4xl font-bold text-gray-800 mt-2">128 <span className="text-lg font-normal text-gray-400">件</span></div>
          </div>
          <div className="mt-4 text-green-600 text-sm font-medium flex items-center gap-1">
            <CheckCircle size={14} /> 98% Pass Rate
          </div>
        </div>
      </div>
    </div>
  );

  // 3.2 欄位對映 (Field Mapping)
  const renderFields = () => (
    <div className="flex h-full w-full font-sans">
      {editingField ? (
        // Field Editor Mode (3.1 標準化欄位詳細)
        <div className="flex flex-col w-full h-full bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setEditingField(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {editingField.name} 
                  <span className="text-gray-400 font-normal">| {editingField.desc}</span>
                </h3>
              </div>
              <StatusBadge status={editingField.status} />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg">重置</button>
              <button onClick={() => setEditingField(null)} className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 shadow-sm">儲存</button>
            </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Source Browser */}
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                  <input type="text" placeholder="搜尋來源資料表..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                <div className="mb-4">
                  <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase flex justify-between">
                    交易明細檔 <span className="text-gray-400">3 Fields</span>
                  </div>
                  {['Txn_Amt', 'Txn_Type', 'Txn_Date'].map(col => (
                    <div key={col} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded cursor-pointer group">
                      <Database size={12} className="text-gray-400 group-hover:text-blue-400" />
                      {col}
                    </div>
                  ))}
                </div>
                <div>
                   <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase flex justify-between">
                    匯率檔 <span className="text-gray-400">2 Fields</span>
                   </div>
                    {['Rate', 'Currency'].map(col => (
                    <div key={col} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded cursor-pointer group">
                      <Database size={12} className="text-gray-400 group-hover:text-blue-400" />
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle: Rule Editor */}
            <div className="flex-1 flex flex-col border-r border-gray-200">
              <div className="p-6 h-full flex flex-col">
                <label className="block text-sm font-bold text-gray-700 mb-2">轉換規則說明</label>
                <div className="mb-4 text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                  加總當日所有幣別交易，並依據當日中價匯率轉換為台幣，排除手續費交易碼 '999'
                </div>

                <label className="block text-sm font-bold text-gray-700 mb-2">腳本程式 (Javascript/SQL)</label>
                <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden flex flex-col relative">
                   <div className="absolute top-2 right-2 flex gap-2">
                      <button className="text-xs text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded">Copy</button>
                   </div>
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
              </div>
            </div>

            {/* Right: Preview */}
            <div className="w-1/4 bg-white flex flex-col">
               <div className="p-4 border-b border-gray-200">
                 <h4 className="font-bold text-gray-800 mb-4">轉換預覽</h4>
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs text-gray-500 font-bold mb-1 block">開始時間</label>
                     <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" defaultValue="2026-01-01" />
                   </div>
                   <div>
                     <label className="text-xs text-gray-500 font-bold mb-1 block">結束時間</label>
                     <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" defaultValue="2026-03-31" />
                   </div>
                   <button className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                     <Play size={14}/> 開始測試轉換
                   </button>
                 </div>
               </div>
               <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                 <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-400 uppercase">Output Result</div>
                    <div className="bg-white border border-gray-200 p-3 rounded text-sm font-mono text-gray-600">
                      10,000
                    </div>
                     <div className="bg-white border border-gray-200 p-3 rounded text-sm font-mono text-gray-600">
                      3,999
                    </div>
                     <div className="bg-white border border-gray-200 p-3 rounded text-sm font-mono text-gray-600">
                      100
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        // Field List Mode
        <div className="p-8 w-full max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">欄位對映 (Field Mapping)</h2>
              <p className="text-gray-500 text-sm mt-1">總共 49 個標準欄位，已完成 47 個欄位的配對，剩餘 2 個欄位無法判斷</p>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm flex items-center gap-2">
              + 新增欄位
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
                {MOCK_FIELDS.map((field, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-mono font-medium text-blue-700">{field.name}</td>
                    <td className="p-5 text-gray-500 font-mono text-xs">{field.type}</td>
                    <td className="p-5 text-gray-700">{field.desc}</td>
                    <td className="p-5"><StatusBadge status={field.status} /></td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => setEditingField(field)}
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
      )}
    </div>
  );

  // 3.3 原廠態樣參數 (Vendor Parameters) - Replaces Rules
  const renderVendorParams = () => (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">原廠態樣參數</h2>
        {/* PDF shows just a list, maybe read-only or minimal actions */}
      </div>

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
                  <td className="p-5">
                     <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">{param.schedule}</span>
                  </td>
                  <td className="p-5 font-mono text-blue-700 font-medium">
                    {param.paramName}: {param.value}
                  </td>
                  <td className="p-5 text-gray-600">{param.duration}</td>
                  <td className="p-5 text-gray-400 text-xs">{param.updateTime}</td>
                </tr>
              ))}
            </tbody>
         </table>
         <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
           顯示 1 - {MOCK_VENDOR_PARAMS.length} 筆，共 {MOCK_VENDOR_PARAMS.length} 筆
         </div>
      </div>
    </div>
  );

  // 3.4 態樣驗證 (Verification)
  const renderVerification = () => {
    // 1. Create/Edit Verification Modal
    if (isCreatingVerify) {
      return (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
             <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-900">新增驗證</h2>
               <button onClick={() => setIsCreatingVerify(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
             </div>
             
             <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">標題 <span className="text-red-500">*</span></label>
                 <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue="2025 Q4 驗證" />
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">敘述 <span className="text-red-500">*</span></label>
                 <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20" defaultValue="2025 Q4 驗證說明..." />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">資料區間 <span className="text-red-500">*</span></label>
                 <div className="flex gap-2 items-center">
                    <input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-12-01T00:00" />
                    <span>~</span>
                    <input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-12-10T00:00" />
                 </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">態樣 <span className="text-red-500">*</span></label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option>txna1101 (月跑批)</option>
                    <option>txna1102 (日跑批)</option>
                  </select>
               </div>
               
               {/* Parameter Overrides Table */}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">原廠態樣參數 vs 預計驗證參數</label>
                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                       <tr>
                         <th className="p-3 border-b border-gray-200">參數名稱</th>
                         <th className="p-3 border-b border-gray-200">原廠設定</th>
                         <th className="p-3 border-b border-gray-200">預計驗證參數</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       <tr>
                         <td className="p-3">credit_limit</td>
                         <td className="p-3 text-gray-500">1,000,000</td>
                         <td className="p-3">
                           <input type="text" className="w-full border border-blue-300 bg-blue-50 rounded px-2 py-1 text-blue-800 font-medium" defaultValue="1,000,000" />
                         </td>
                       </tr>
                       <tr>
                         <td className="p-3">debit_limit</td>
                         <td className="p-3 text-gray-500">200,000</td>
                         <td className="p-3">
                           <input type="text" className="w-full border border-blue-300 bg-blue-50 rounded px-2 py-1 text-blue-800 font-medium" defaultValue="200,000" />
                         </td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>

             <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
               <button onClick={() => setIsCreatingVerify(false)} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-lg">取消</button>
               <button onClick={() => setIsCreatingVerify(false)} className="px-4 py-2 text-sm text-white font-medium bg-black hover:bg-gray-800 rounded-lg flex items-center gap-2">
                 儲存
               </button>
             </div>
          </div>
        </div>
      );
    }

    // 2. Verification Detail (Report)
    if (selectedVerify) {
      return (
        <div className="flex flex-col h-full w-full bg-gray-50 font-sans">
           {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
               <button onClick={() => setSelectedVerify(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedVerify.title}</h2>
                <div className="flex gap-4 text-xs text-gray-500 mt-1 items-center">
                  <StatusBadge status={selectedVerify.status} />
                  <span>建立時間: {selectedVerify.createTime}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-700 bg-white">
                <Download size={16} /> 匯出報告
              </button>
              {selectedVerify.status === 'In Progress' && (
                 <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 shadow-sm">
                   停止驗證
                 </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 px-8">
            <nav className="flex gap-6 -mb-px">
              {['設定', '驗證報告', '差異調查紀錄'].map(tab => (
                 <button
                   key={tab}
                   onClick={() => setVerifyTab(tab === '設定' ? 'setting' : tab === '驗證報告' ? 'report' : 'diff')}
                   className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                     (verifyTab === 'setting' && tab === '設定') || 
                     (verifyTab === 'report' && tab === '驗證報告') || 
                     (verifyTab === 'diff' && tab === '差異調查紀錄')
                       ? 'border-black text-black'
                       : 'border-transparent text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   {tab}
                 </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {verifyTab === 'report' && (
              <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Year/Month Difference Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-800 mb-4">年月差異表</h3>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                       <tr>
                         <th className="p-3">年</th>
                         <th className="p-3">月</th>
                         <th className="p-3 text-right">模擬產生 alert 數量</th>
                         <th className="p-3 text-right">實際產生 alert 數量</th>
                         <th className="p-3 text-right text-red-600">型1錯誤數量</th>
                         <th className="p-3 text-right text-orange-600">型2錯誤數量</th>
                       </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3">2025</td>
                        <td className="p-3">10</td>
                        <td className="p-3 text-right font-mono">100</td>
                        <td className="p-3 text-right font-mono">98</td>
                        <td className="p-3 text-right font-mono text-red-600 font-bold">1</td>
                        <td className="p-3 text-right font-mono text-orange-600 font-bold">1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Venn / Statistics Cards */}
                <div className="grid grid-cols-4 gap-6">
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="text-sm text-gray-500 mb-2">本系統 (模擬)</div>
                     <div className="text-3xl font-bold text-gray-900">10,000</div>
                     <div className="text-xs text-gray-400 mt-1">客戶數量</div>
                   </div>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <div className="text-sm text-gray-500 mb-2">行內 AML (實際)</div>
                     <div className="text-3xl font-bold text-gray-900">9,999</div>
                     <div className="text-xs text-gray-400 mt-1">客戶數量</div>
                   </div>
                   <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-green-700 font-bold mb-2">互相交集</div>
                          <div className="text-3xl font-bold text-green-800">9,998</div>
                        </div>
                        <button className="text-xs bg-white text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100">查看</button>
                     </div>
                   </div>
                   <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-red-700 font-bold mb-2">無交集 (差異)</div>
                          <div className="text-3xl font-bold text-red-800">2</div>
                        </div>
                        <button className="text-xs bg-white text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100">查看</button>
                     </div>
                   </div>
                </div>

                {/* Calendar View (Error Overview) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-800">錯誤概覽 (2025年 10月)</h3>
                     <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-3 h-3 bg-red-100 rounded-sm"></div> 型1錯誤</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-3 h-3 bg-orange-100 rounded-sm"></div> 型2錯誤</span>
                     </div>
                  </div>
                  
                  {/* Mock Calendar Grid */}
                  <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    {['週日', '週一', '週二', '週三', '週四', '週五', '週六'].map(d => (
                      <div key={d} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500">{d}</div>
                    ))}
                    {Array.from({length: 31}).map((_, i) => {
                       const day = i + 1;
                       const hasError1 = day === 4 || day === 17;
                       const hasError2 = day === 4 || day === 29;
                       return (
                         <div key={i} className="bg-white min-h-[80px] p-2 hover:bg-gray-50 transition-colors relative">
                           <span className="text-sm text-gray-700 font-medium">{day}</span>
                           <div className="mt-2 space-y-1">
                             {hasError1 && <div className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded">型1錯誤: 50</div>}
                             {hasError2 && <div className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded">型2錯誤: 100</div>}
                           </div>
                         </div>
                       )
                    })}
                    {/* Fillers */}
                    {[1,2,3,4].map(i => <div key={`fill-${i}`} className="bg-gray-50 min-h-[80px]"></div>)}
                  </div>
                </div>

              </div>
            )}
            {verifyTab === 'setting' && (
              <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">標題</label>
                   <div className="text-gray-900">{selectedVerify.title}</div>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">驗證期間</label>
                   <div className="text-gray-900 font-mono">2025-10-01 ~ 2025-10-31</div>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">參數設定</label>
                   <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm space-y-2">
                      <div className="flex justify-between"><span>Code:</span> <span>{selectedVerify.params.code}</span></div>
                      <div className="flex justify-between text-blue-600 font-bold"><span>Limit:</span> <span>{selectedVerify.params.limit}</span></div>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. List Mode
    return (
      <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">態樣驗證</h2>
          <button 
             onClick={() => setIsCreatingVerify(true)}
             className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm flex items-center gap-2"
          >
            + 新增驗證
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
           {['全部 (19)', '已完成 (5)', '正在進行 (10)', '發生錯誤 (4)'].map((f, i) => (
             <button key={f} className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${i===0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
           ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-5">標題</th>
                  <th className="p-5">建立時間</th>
                  <th className="p-5">驗證起訖時間</th>
                  <th className="p-5 text-right">型1錯誤</th>
                  <th className="p-5 text-right">型2錯誤</th>
                  <th className="p-5">驗證狀態</th>
                  <th className="p-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {MOCK_VERIFY_JOBS.map(job => (
                  <tr 
                    key={job.id} 
                    onClick={() => setSelectedVerify(job)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="p-5 font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="p-5 text-gray-500 text-xs font-mono">{job.createTime}</td>
                    <td className="p-5 text-gray-500 text-xs font-mono">
                      <div>Start: {job.startTime}</div>
                      <div>End: {job.endTime}</div>
                    </td>
                    <td className="p-5 text-right font-mono text-red-600 font-bold">{job.type1 > 0 ? job.type1 : '-'}</td>
                    <td className="p-5 text-right font-mono text-orange-600 font-bold">{job.type2 > 0 ? job.type2 : '-'}</td>
                    <td className="p-5"><StatusBadge status={job.status} /></td>
                    <td className="p-5 text-gray-400 text-right"><ChevronRight size={18}/></td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 3.5 歷史紀錄 (History)
  const renderHistory = () => (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
      <h2 className="text-2xl font-bold text-gray-900">歷史紀錄</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
             <tr>
               <th className="p-5">DB 名稱</th>
               <th className="p-5">建立時間</th>
               <th className="p-5 text-right">已建立驗證數</th>
               <th className="p-5 text-right">驗證的態樣數</th>
               <th className="p-5">專案起訖日</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100 text-sm">
             {MOCK_HISTORY.map((h, i) => (
               <tr key={i} className="hover:bg-gray-50">
                 <td className="p-5 font-medium text-gray-900">{h.dbName}</td>
                 <td className="p-5 text-gray-500 font-mono">{h.created}</td>
                 <td className="p-5 text-right font-mono">{h.verifyCount}</td>
                 <td className="p-5 text-right font-mono">{h.scenarioCount}</td>
                 <td className="p-5 text-gray-500 font-mono">{h.range}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );

  // --- Layout Render ---

  if (appState === 'projects') return renderProjectList();
  if (appState === 'connect') return renderConnect();
  if (appState === 'processing') return renderProcessing();

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
            <Activity className="text-blue-500" />
            AML Portal
          </div>
          <div className="text-gray-500 text-xs mt-2 flex items-center gap-1">
             <Folder size={12} /> {currentProject?.name}
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} label="總覽" 
            active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} 
          />
          <SidebarItem 
            icon={Database} label="欄位對映" 
            active={activeTab === 'fields'} onClick={() => { setActiveTab('fields'); setEditingField(null); }} 
          />
          <SidebarItem 
            icon={FileText} label="原廠態樣參數" 
            active={activeTab === 'params'} onClick={() => setActiveTab('params')} 
          />
          <SidebarItem 
            icon={CheckCircle} label="態樣驗證" 
            active={activeTab === 'verify'} onClick={() => { setActiveTab('verify'); setSelectedVerify(null); setIsCreatingVerify(false); }} 
          />
           <SidebarItem 
            icon={History} label="歷史紀錄" 
            active={activeTab === 'history'} onClick={() => setActiveTab('history')} 
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors" onClick={() => { setAppState('projects'); setCurrentProject(null); }}>
             <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-blue-200 font-bold text-xs">
              U1
            </div>
            <div className="text-sm overflow-hidden flex-1">
              <div className="text-gray-300 font-medium truncate">User001</div>
              <div className="text-xs">返回專案列表</div>
            </div>
            <LogOut size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Header */}
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
           
           {activeTab === 'overview' && (
             <button 
               onClick={() => setAppState('connect')}
               className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
             >
               重新串接資料源
             </button>
           )}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-100 w-full relative">
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
