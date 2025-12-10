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
  Users,
  Code,
  Edit
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

const MOCK_PROJECTS = [
  { id: 1, name: '雪梨 (Sydney)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
  { id: 2, name: '東京 (Tokyo)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
  { id: 3, name: '巴黎 (Paris)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
  { id: 4, name: '台北 (Taipei)', created: '2026/01/01', lastEdited: '2026/01/01', status: 'Active' },
];

// MODIFICATION 2.0: 重構原廠態樣參數資料結構 (Group by ID/Scenario)
const MOCK_VENDOR_PARAMS = [
  {
    id: 'txna1101',
    scenarioSchedule: '月跑批',
    params: [
        { 
            paramName: 'credit_limit', 
            value: '1,000,000', 
            duration: '2026/01/01 ~ 2026/03/31', 
            updateTime: '2025-10-10 10:45:45' 
        },
        { 
            paramName: 'debit_limit', 
            value: '200,000', 
            duration: '2026/01/01 ~ 2026/03/31', 
            updateTime: '2025-10-10 10:45:45' 
        },
        { 
            paramName: 'txn_amount', 
            value: '500,000', 
            duration: '2026/04/01 ~ 9999-01-01', // 9999-01-01 表示持續使用中 [cite: 63, 64]
            updateTime: '2025-10-10 10:45:45' 
        },
    ]
  },
  {
    id: 'txna1702',
    scenarioSchedule: '日跑批',
    params: [
        { 
            paramName: 'max_daily_txn_count', 
            value: '5', 
            duration: '2026/01/01 ~ 9999-01-01', 
            updateTime: '2025-11-01 09:00:00' 
        },
    ]
  },
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
    // 驗證報告數據
    simulatedAlerts: 10000, // 模擬產生
    actualAlerts: 9999,      // 實際產生
    intersectionAlerts: 9998, // 互相交集
    diffAlerts: 2,           // 無交集 (差異)
    type1: 1, // 差異表數據
    type2: 1, // 差異表數據
    params: { code: 'txna1101', limit: '1,000,000' }
  },
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
  const [fields, setFields] = useState(MOCK_FIELDS);
  const [editingField, setEditingField] = useState(null);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [newFieldData, setNewFieldData] = useState({ name: '', desc: '', type: 'string' });
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Verification State
  const [selectedVerify, setSelectedVerify] = useState(null);
  const [isCreatingVerify, setIsCreatingVerify] = useState(false);
  const [verifyTab, setVerifyTab] = useState('report'); // MODIFICATION 3.0: 驗證報告預設為 'report'

  // Vendor Params State
  const [editingVendorParam, setEditingVendorParam] = useState(null); // MODIFICATION 2.0: 控制原廠參數編輯彈窗
  const [tempEditParam, setTempEditParam] = useState(null); // MODIFICATION 2.0: 暫存編輯中的參數數據


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
    setAppState('connect');
  };

  const checkFieldName = (name) => {
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
      status: '失敗' // Default new field status
    };
    setFields([...fields, newField]);
    setIsCreatingField(false);
    setNewFieldData({ name: '', desc: '', type: 'string' });
    // Optionally open the new field in edit mode
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


  // MODIFICATION 2.0: 處理原廠參數編輯的儲存
  const handleSaveVendorParam = () => {
      // 這裡應該包含更新 MOCK_VENDOR_PARAMS 的邏輯
      // 由於 MOCK_VENDOR_PARAMS 是常量，我們在 Mock 中只關閉彈窗
      console.log('Saving param:', tempEditParam);
      setEditingVendorParam(null);
      setTempEditParam(null);
  };

  // --- Views ---

  // ... (ProjectList, Processing views preserved from previous code) ...
  const renderProjectList = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
           <Activity className="text-blue-500" />
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
              className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-lg flex items-center gap-2"
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
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-900">建立新專案</h3>
                 <button onClick={() => setIsCreatingProject(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">專案名稱</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} autoFocus />
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

  const renderConnect = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 items-center justify-center font-sans relative">
      <button onClick={() => { setAppState('projects'); setCurrentProject(null); }} className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /> 返回專案列表</button>
      <div className="bg-white p-10 rounded-xl shadow-xl border border-gray-200 w-full max-w-lg">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-3"><Folder size={12} /> {currentProject?.name}</div>
           <h2 className="text-2xl font-bold text-gray-900">連接資料庫</h2>
        </div>
        <div className="space-y-6">
          <div><label className="block text-sm font-bold text-gray-700 mb-2">資料庫類型</label><select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"><option value="sas">SAS</option></select></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2">資料夾路徑</label><input type="text" defaultValue="/XX/XXXXX/2025Q3_Trade_Data" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm" /></div>
          {/* MODIFICATION 1.0: 新增「專案起訖日」欄位 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">專案起訖日</label>
            <div className="flex gap-2 items-center">
              <input type="date" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-07-01" />
              <span>~</span>
              <input type="date" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-09-30" />
            </div>
          </div>
          {/* END MODIFICATION 1.0 */}
          <div className="pt-4 flex gap-4"><button onClick={() => setAppState('projects')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg border border-gray-300">取消</button><button onClick={() => setAppState('processing')} className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg">確定</button></div>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50 items-center justify-center font-sans">
      <div className="bg-white p-12 rounded-xl shadow-xl border border-gray-200 w-full max-w-3xl">
         <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8"><RefreshCw size={24} className={processingStep < 3 ? 'animate-spin' : ''} /> {processingStep < 3 ? '資料處理中...' : '資料處理完成'}</h2>
         <div className="space-y-6">
            <div className="text-sm font-bold">Step 1. 擷取 (Extract) <span className={`float-right ${processingStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>{processingStep >= 1 ? '完成' : '...'}</span></div>
            <div className="text-sm font-bold">Step 2. 標準化 (Transform) <span className={`float-right ${processingStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>{processingStep >= 2 ? '完成' : '...'}</span></div>
            <div className="text-sm font-bold">Step 3. 載入 (Load) <span className={`float-right ${processingStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>{processingStep >= 3 ? '完成' : '...'}</span></div>
         </div>
         <div className="mt-12 flex justify-end"><button disabled={processingStep < 3} onClick={() => setAppState('portal')} className={`px-8 py-2.5 rounded-lg text-sm font-medium ${processingStep < 3 ? 'bg-gray-100 text-gray-400' : 'bg-black text-white'}`}>進入系統</button></div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="p-8 space-y-8 animate-fade-in w-full max-w-7xl mx-auto font-sans">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
         <div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-full"><CheckCircle size={20} className="text-green-600" /></div><div><div className="text-xs text-gray-500">已成功串接資料源</div><div className="font-bold text-gray-900">2025Q3 交易資料 (SAS)</div></div></div>
         <div className="flex gap-3"><button onClick={() => setActiveTab('verify')} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">開始驗證</button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><div className="text-gray-500 text-sm font-medium uppercase">發生錯誤</div><div className="text-4xl font-bold text-gray-800 mt-2">12</div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><div className="text-gray-500 text-sm font-medium uppercase">正在進行中</div><div className="text-4xl font-bold text-gray-800 mt-2">5</div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><div className="text-gray-500 text-sm font-medium uppercase">已完成驗證</div><div className="text-4xl font-bold text-gray-800 mt-2">128</div></div>
      </div>
    </div>
  );

  // 3.2 欄位對映 (Field Mapping) - Content unchanged
  const renderFields = () => {
    // 3.2.1 Create Field Mode
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
                 <label className="block text-sm font-bold text-gray-700 mb-2">轉換規則說明</label>
                 <textarea 
                   placeholder="輸入轉換規則 (例如: 加總當日所有幣別交易...)"
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                 />
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">轉換規則程式 (Script) <span className="text-red-500">*</span></label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden h-40 bg-gray-50">
                     <textarea className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 outline-none resize-none" defaultValue="// Input your logic here..." />
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
    }

    // 3.2.2 Edit/Detail Mode
    if (editingField) {
      return (
        <div className="flex flex-col w-full h-full bg-gray-50">
          {/* Header */}
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
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                   <span>資料型態: <span className="font-mono text-gray-700">{editingField.type}</span></span>
                </div>
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
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">來源資料表</div>
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
              <div className="p-6 h-full flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">轉換規則說明</label>
                  <textarea 
                    className="w-full text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                    defaultValue="加總當日所有幣別交易，並依據當日中價匯率轉換為台幣，排除手續費交易碼 '999'"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-gray-700">腳本程式 (Javascript/SQL)</label>
                     <div className="flex gap-2">
                       <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded bg-white">
                         <Code size={12}/> JavaScript
                       </button>
                     </div>
                  </div>
                  <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden flex flex-col relative border border-gray-800">
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
                    <div className="mt-2 text-red-500 text-xs flex items-center gap-1">
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
                     <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" defaultValue="2026-01-01" />
                   </div>
                   <div>
                     <label className="text-xs text-gray-500 font-bold mb-1 block">結束時間</label>
                     <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" defaultValue="2026-03-31" />
                   </div>
                   <button 
                     onClick={runTest}
                     className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                   >
                     {testResult === 'loading' ? <RefreshCw className="animate-spin" size={14}/> : <Play size={14}/>} 
                     {testResult === 'loading' ? '測試中...' : '開始測試轉換'}
                   </button>
                 </div>
               </div>
               <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                 {!testResult && (
                   <div className="text-center text-gray-400 text-xs mt-10">
                     請點擊「開始測試轉換」<br/>以查看結果
                   </div>
                 )}
                 {testResult === 'success' && (
                    <div className="space-y-2 animate-fade-in">
                        <div className="text-xs font-bold text-green-600 uppercase flex justify-between items-center mb-2">
                            Output Result <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px]">OK</span>
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded text-sm font-mono text-gray-600 shadow-sm">
                        10,000
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded text-sm font-mono text-gray-600 shadow-sm">
                        3,999
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded text-sm font-mono text-gray-600 shadow-sm">
                        100
                        </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      );
    }

    // 3.2.3 List Mode
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
                  <td className="p-5 text-gray-500 font-mono text-xs">{field.type}</td>
                  <td className="p-5 text-gray-700">{field.desc}</td>
                  <td className="p-5"><StatusBadge status={field.status} /></td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => { setEditingField(field); setTestResult(null); }}
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

  // MODIFICATION 2.0: 重寫原廠態樣參數視圖
  const renderVendorParams = () => (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">原廠態樣參數</h2>
        <div className="text-sm text-gray-500">此資料為 AML 系統內可調整參數的「原廠設定」[cite: 58, 59]。</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-5 w-24">態樣</th>
                <th className="p-5 w-24">AML 排程規則</th>
                <th className="p-5">參數 (Value)</th>
                <th className="p-5 w-32">更新時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {MOCK_VENDOR_PARAMS.map((scenario, idx) => (
                <tr key={idx} className="hover:bg-gray-50 align-top">
                  {/* 態樣 ID 和排程規則只需顯示一次 */}
                  <td className="p-5 font-mono font-medium text-gray-900 border-r border-gray-100" rowSpan={scenario.params.length}>
                    {scenario.id}
                  </td>
                  <td className="p-5 border-r border-gray-100" rowSpan={scenario.params.length}>
                    <span className="px-2 py-1 bg-blue-50 rounded text-xs text-blue-700 font-medium border border-blue-200">{scenario.scenarioSchedule}</span>
                  </td>
                  
                  {/* 第一個參數 */}
                  <td className="p-5">
                      <div className="flex items-center justify-between">
                         <div className="font-mono text-gray-700">
                             <span className="font-bold">{scenario.params[0].paramName}:</span> <span className="text-blue-600">{scenario.params[0].value}</span>
                         </div>
                         <button 
                             onClick={() => { setEditingVendorParam(scenario); setTempEditParam(scenario.params[0]); }}
                             className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-100"
                             title="編輯參數"
                         >
                             <Edit size={14} />
                         </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                          啟用期間: {scenario.params[0].duration}
                      </div>
                  </td>
                  <td className="p-5 text-gray-400 text-xs border-l border-gray-100" rowSpan={scenario.params.length}>
                    {scenario.params[0].updateTime}
                  </td>
                </tr>
              ))}
              {/* 渲染同一個態樣下的其他參數 */}
              {MOCK_VENDOR_PARAMS.flatMap(scenario => 
                scenario.params.slice(1).map((param, paramIdx) => (
                  <tr key={`${scenario.id}-${paramIdx + 1}`} className="hover:bg-gray-50">
                    <td className="hidden"></td> {/* 態樣 ID */}
                    <td className="hidden"></td> {/* AML 排程規則 */}
                    <td className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="font-mono text-gray-700">
                                <span className="font-bold">{param.paramName}:</span> <span className="text-blue-600">{param.value}</span>
                            </div>
                            <button 
                                onClick={() => { setEditingVendorParam(scenario); setTempEditParam(param); }}
                                className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-100"
                                title="編輯參數"
                            >
                                <Edit size={14} />
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            啟用期間: {param.duration}
                        </div>
                    </td>
                    <td className="hidden"></td> {/* 更新時間 */}
                  </tr>
                ))
              )}
            </tbody>
         </table>
      </div>

      {/* MODIFICATION 2.0: 編輯參數彈窗 */}
      {editingVendorParam && tempEditParam && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-900">編輯參數: {tempEditParam.paramName}</h3>
                      <button onClick={() => setEditingVendorParam(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div className="flex justify-between items-center">
                          <label className="block text-sm font-bold text-gray-700">態樣 ID</label>
                          <span className="font-mono text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">{editingVendorParam.id}</span>
                      </div>
                      
                      {/* 編輯 AML 排程規則 */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">AML 排程規則 [cite: 69, 70, 71, 73]</label>
                          <select 
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              value={editingVendorParam.scenarioSchedule}
                              onChange={(e) => setEditingVendorParam({...editingVendorParam, scenarioSchedule: e.target.value})}
                          >
                              <option value="月跑批">月跑批 (月)</option>
                              <option value="日跑批">日跑批 (日)</option>
                          </select>
                      </div>

                      {/* 編輯 Value */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">參數值 ({tempEditParam.paramName})</label>
                          <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                              defaultValue={tempEditParam.value}
                              onChange={(e) => setTempEditParam({...tempEditParam, value: e.target.value})}
                          />
                      </div>

                      {/* 編輯 啟用期間 */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">啟用期間 (開始~結束時間) [cite: 61]</label>
                        <div className="text-xs text-gray-500 mb-2">結束時間為 <code className="font-mono text-gray-700">9999-01-01</code> 表示「還在使用中」[cite: 63, 64]</div>
                          <div className="flex gap-2 items-center">
                              <input type="date" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue={tempEditParam.duration.split(' ~ ')[0].replace(/\//g, '-')} />
                              <span>~</span>
                              <input type="date" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue={tempEditParam.duration.split(' ~ ')[1].replace(/\//g, '-')} />
                          </div>
                      </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                      <button onClick={() => setEditingVendorParam(null)} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg">取消</button>
                      <button onClick={handleSaveVendorParam} className="px-4 py-2 text-sm text-white font-medium bg-black hover:bg-gray-800 rounded-lg">確定儲存</button>
                  </div>
              </div>
          </div>
      )}
      {/* END MODIFICATION 2.0 */}
    </div>
  );


  // MODIFICATION 3.0: 重寫態樣驗證視圖
  const renderVerification = () => {
    if (isCreatingVerify) {
      return (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
             <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900">新增驗證</h2><button onClick={() => setIsCreatingVerify(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
             <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <div><label className="block text-sm font-bold text-gray-700 mb-2">標題 <span className="text-red-500">*</span></label><input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue="2025 Q4 驗證" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">敘述 <span className="text-red-500">*</span></label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20" defaultValue="2025 Q4 驗證說明..." /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">資料區間 <span className="text-red-500">*</span></label><div className="flex gap-2 items-center"><input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-12-01T00:00" /><span>~</span><input type="datetime-local" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="2025-12-10T00:00" /></div></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">態樣 <span className="text-red-500">*</span></label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"><option>txna1101 (月跑批)</option></select></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">原廠態樣參數 vs 預計驗證參數</label><div className="border border-gray-200 rounded-lg overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="p-3 border-b border-gray-200">參數名稱</th><th className="p-3 border-b border-gray-200">原廠設定</th><th className="p-3 border-b border-gray-200">預計驗證參數</th></tr></thead><tbody className="divide-y divide-gray-100"><tr><td className="p-3">credit_limit</td><td className="p-3 text-gray-500">1,000,000</td><td className="p-3"><input type="text" className="w-full border border-blue-300 bg-blue-50 rounded px-2 py-1 text-blue-800 font-medium" defaultValue="1,000,000" /></td></tr></tbody></table></div></div>
             </div>
             <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3"><button onClick={() => setIsCreatingVerify(false)} className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-lg">取消</button><button onClick={() => setIsCreatingVerify(false)} className="px-4 py-2 text-sm text-white font-medium bg-black hover:bg-gray-800 rounded-lg flex items-center gap-2">儲存</button></div>
          </div>
        </div>
      );
    }

    if (selectedVerify) {
      return (
        <div className="flex flex-col h-full w-full bg-gray-50 font-sans">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setSelectedVerify(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedVerify.title}</h2>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1 items-center">
                        <StatusBadge status={selectedVerify.status} />
                        <span>建立時間: {selectedVerify.createTime}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-700 bg-white"><Download size={16} /> 匯出報告</button>
            </div>
          </div>
          
          {/* Tab Navigation (MODIFICATION 3.0) */}
          <div className="bg-white border-b border-gray-200 px-8">
              <nav className="flex gap-6 -mb-px">
                  {['驗證報告', '設定', '差異調查紀錄'].map(tab => (
                      <button 
                          key={tab} 
                          onClick={() => setVerifyTab(tab === '設定' ? 'setting' : tab === '驗證報告' ? 'report' : 'diff')} 
                          className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                              (verifyTab === 'setting' && tab === '設定') || 
                              (verifyTab === 'report' && tab === '驗證報告') || 
                              (verifyTab === 'diff' && tab === '差異調查紀錄') 
                              ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                          {tab}
                      </button>
                  ))}
              </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* 驗證報告 (Report) - MODIFICATION 3.0: 調整數據卡片 */}
            {verifyTab === 'report' && (
              <div className="max-w-6xl mx-auto space-y-8">
                {/* 年月差異表 */}
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
                        <td className="p-3 text-right font-mono">{selectedVerify.simulatedAlerts}</td>
                        <td className="p-3 text-right font-mono">{selectedVerify.actualAlerts}</td>
                        <td className="p-3 text-right font-mono text-red-600 font-bold">{selectedVerify.type1}</td>
                        <td className="p-3 text-right font-mono text-orange-600 font-bold">{selectedVerify.type2}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 數據卡片 - MODIFICATION 3.0: 調整數據源 */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 mb-2">本系統 (模擬)</div>
                        <div className="text-3xl font-bold text-gray-900">{selectedVerify.simulatedAlerts.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 mb-2">行內 AML (實際)</div>
                        <div className="text-3xl font-bold text-gray-900">{selectedVerify.actualAlerts.toLocaleString()}</div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <div className="text-sm text-green-700 font-bold mb-2">互相交集</div>
                        <div className="text-3xl font-bold text-green-800">{selectedVerify.intersectionAlerts.toLocaleString()}</div>
                    </div>
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                        <div className="text-sm text-red-700 font-bold mb-2">無交集 (差異)</div>
                        <div className="text-3xl font-bold text-red-800">{selectedVerify.diffAlerts.toLocaleString()}</div>
                    </div>
                </div>
              </div>
            )}
            
            {/* 設定 (Setting) */}
            {verifyTab === 'setting' && (
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">標題</label>
                        <div className="text-gray-900 font-medium">{selectedVerify.title}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">驗證期間</label>
                        <div className="text-gray-900 font-medium">{selectedVerify.startTime} ~ {selectedVerify.endTime}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">驗證態樣</label>
                        <div className="text-gray-900 font-medium">{selectedVerify.params.code}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">參數設定</label>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm space-y-2">
                            <div className="flex justify-between"><span>credit_limit:</span> <span>{selectedVerify.params.limit}</span></div>
                            {/* ... 其他參數 ... */}
                        </div>
                    </div>
                </div>
            )}

            {/* 差異調查紀錄 (Diff) - MODIFICATION 3.0: 新增內容 */}
            {verifyTab === 'diff' && (
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                        <h3 className="font-bold text-lg text-red-700 mb-4">型1錯誤 (本系統未產生, 實際系統產生)</h3>
                        <p className="text-sm text-gray-600">目前共 **{selectedVerify.type1}** 筆紀錄，等待調查。</p>
                        {/* Mock data for diff list */}
                        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-red-50 text-red-700 text-xs uppercase">
                                    <tr>
                                        <th className="p-3">客戶 ID</th>
                                        <th className="p-3">交易時間</th>
                                        <th className="p-3">原因初判</th>
                                        <th className="p-3">調查狀態</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-red-100/50">
                                        <td className="p-3 font-mono">P-00123</td>
                                        <td className="p-3 font-mono">2025-10-15 11:00</td>
                                        <td className="p-3">行內資料源多一筆手續費交易</td>
                                        <td className="p-3"><StatusBadge status={'Not Started'} /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
                        <h3 className="font-bold text-lg text-orange-700 mb-4">型2錯誤 (本系統產生, 實際系統未產生)</h3>
                        <p className="text-sm text-gray-600">目前共 **{selectedVerify.type2}** 筆紀錄，等待調查。</p>
                        {/* Mock data for diff list */}
                        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-orange-50 text-orange-700 text-xs uppercase">
                                    <tr>
                                        <th className="p-3">客戶 ID</th>
                                        <th className="p-3">交易時間</th>
                                        <th className="p-3">原因初判</th>
                                        <th className="p-3">調查狀態</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-orange-100/50">
                                        <td className="p-3 font-mono">P-00456</td>
                                        <td className="p-3 font-mono">2025-10-16 15:30</td>
                                        <td className="p-3">本系統欄位對映邏輯錯誤</td>
                                        <td className="p-3"><StatusBadge status={'In Progress'} /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      );
    }
    
    // 驗證列表
    return (
      <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-900">態樣驗證</h2><button onClick={() => setIsCreatingVerify(true)} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm flex items-center gap-2">+ 新增驗證</button></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold"><tr><th className="p-5">標題</th><th className="p-5">建立時間</th><th className="p-5">驗證起訖時間</th><th className="p-5 text-right">型1錯誤</th><th className="p-5 text-right">型2錯誤</th><th className="p-5">驗證狀態</th><th className="p-5"></th></tr></thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {MOCK_VERIFY_JOBS.map(job => (<tr key={job.id} onClick={() => setSelectedVerify(job)} className="hover:bg-blue-50 cursor-pointer transition-colors"><td className="p-5 font-medium text-gray-900">{job.title}</td><td className="p-5 text-gray-500 text-xs font-mono">{job.createTime}</td><td className="p-5 text-gray-500 text-xs font-mono"><div>Start: {job.startTime}</div><div>End: {job.endTime}</div></td><td className="p-5 text-right font-mono text-red-600 font-bold">{job.type1}</td><td className="p-5 text-right font-mono text-orange-600 font-bold">{job.type2}</td><td className="p-5"><StatusBadge status={job.status} /></td><td className="p-5 text-gray-400 text-right"><ChevronRight size={18}/></td></tr>))}
              </tbody>
          </table>
        </div>
      </div>
    );
  };
  // END MODIFICATION 3.0

  const renderHistory = () => (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6 font-sans">
      <h2 className="text-2xl font-bold text-gray-900">歷史紀錄</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold"><tr><th className="p-5">DB 名稱</th><th className="p-5">建立時間</th><th className="p-5 text-right">已建立驗證數</th><th className="p-5 text-right">驗證的態樣數</th><th className="p-5">專案起訖日</th></tr></thead>
           <tbody className="divide-y divide-gray-100 text-sm">{MOCK_HISTORY.map((h, i) => (<tr key={i} className="hover:bg-gray-50"><td className="p-5 font-medium text-gray-900">{h.dbName}</td><td className="p-5 text-gray-500 font-mono">{h.created}</td><td className="p-5 text-right font-mono">{h.verifyCount}</td><td className="p-5 text-right font-mono">{h.scenarioCount}</td><td className="p-5 text-gray-500 font-mono">{h.range}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );

  if (appState === 'projects') return renderProjectList();
  if (appState === 'connect') return renderConnect();
  if (appState === 'processing') return renderProcessing();

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <div className="w-64 bg-gray-900 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="text-white font-bold text-lg tracking-wide flex items-center gap-2"><Activity className="text-blue-500" />AML Portal</div>
          <div className="text-gray-500 text-xs mt-2 flex items-center gap-1"><Folder size={12} /> {currentProject?.name}</div>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="總覽" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={Database} label="欄位對映" active={activeTab === 'fields'} onClick={() => { setActiveTab('fields'); setEditingField(null); setIsCreatingField(false); }} />
          <SidebarItem icon={FileText} label="原廠態樣參數" active={activeTab === 'params'} onClick={() => setActiveTab('params')} />
          <SidebarItem icon={CheckCircle} label="態樣驗證" active={activeTab === 'verify'} onClick={() => { setActiveTab('verify'); setSelectedVerify(null); setIsCreatingVerify(false); }} />
          <SidebarItem icon={History} label="歷史紀錄" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors" onClick={() => { setAppState('projects'); setCurrentProject(null); }}>
             <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-blue-200 font-bold text-xs">U1</div><div className="text-sm overflow-hidden flex-1"><div className="text-gray-300 font-medium truncate">User001</div><div className="text-xs">返回專案列表</div></div><LogOut size={16} />
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
           {activeTab === 'overview' && <button onClick={() => setAppState('connect')} className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">重新串接資料源</button>}
        </header>
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
