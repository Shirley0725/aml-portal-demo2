import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Activity,
  CheckCircle,
  Database,
  Bell,
  Settings,
  Edit3,
  ChevronRight,
  Folder,
  Clock,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Save,
  RotateCcw,
  Search,
  Download,
  AlertTriangle,
  Play,
  Calendar,
  X,
  Plus,
  Filter,
  Eye,
  MoreHorizontal
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

// --- Mock Data (模擬資料) ---

const MOCK_PROJECTS = [
  {
    id: 'TCA001',
    name: '2025Q3_交易資料',
    path: '/XX/XXXXX/2025Q3_Trade_Data',
    dbType: 'SAS',
    dateRange: '2025-01-01 ~ 2025-03-31',
    createTime: '2025-11-19 10:00:00',
    status: 'Ready'
  },
  {
    id: 'TCA002',
    name: '2025Q2_交易資料',
    path: '/XX/XXXXX/2025Q2_Trade_Data',
    dbType: 'SAS',
    dateRange: '2025-01-01 ~ 2025-03-31',
    createTime: '2025-08-15 09:30:00',
    status: 'Archived'
  },
];

const MOCK_ORIGINAL_PARAMS = [
  {
    id: 'txna1101',
    schedule: '月跑批',
    paramTitle: 'credit_limit',
    paramValue: '1,000,000',
    period: '2026/01/01 ~ 2026/03/31',
    updateTime: '2025-10-10 10:45:45'
  },
  {
    id: 'txna1102',
    schedule: '日跑批',
    paramTitle: 'amount',
    paramValue: '500,000',
    period: '2026/01/01 ~ 2026/03/31',
    updateTime: '2025-10-10 10:45:45'
  },
  {
    id: 'txna1103',
    schedule: '月跑批',
    paramTitle: 'debit_limit',
    paramValue: '1,000,000',
    period: '2026/01/01 ~ 2026/03/31',
    updateTime: '2025-10-10 10:45:45'
  },
];

const MOCK_FIELDS = [
  {
    name: 'txn_time',
    type: 'timestamp',
    desc: '交易時間',
    source: 'TXN_DT_TIME',
    status: 'Mapped', // 成功
  },
  {
    name: 'period_days',
    type: 'int',
    desc: '統計期間（天）',
    source: 'PARAM_DAYS',
    status: 'Failed', // 失敗
  },
  {
    name: 'party_id',
    type: 'string',
    desc: '客戶識別碼',
    source: 'CUST_ID',
    status: 'Mapped',
  },
  {
    name: 'txn_amount',
    type: 'decimal',
    desc: '單筆金額',
    source: 'TXN_AMT',
    status: 'Mapped',
  },
  {
    name: 'channel',
    type: 'string',
    desc: '交易渠道',
    source: '',
    status: 'Unmapped', // 未對應
  },
];

const MOCK_VERIFY_JOBS = [
  {
    id: 'V-001',
    title: '2025 Q4 分析 - 驗證 XXXX',
    createTime: '2025-11-19 10:00:00',
    startTime: '2025-11-20 10:00',
    endTime: '2025-11-21 10:00',
    status: 'Success',
    alerts: 98,
    type1: 1, // 誤報
    type2: 1, // 漏報
  },
  {
    id: 'V-002',
    title: '2025 Q4 參數調整測試',
    createTime: '2025-11-20 09:00:00',
    startTime: '2025-11-20 14:00',
    endTime: '-',
    status: 'In Progress',
    alerts: 0,
    type1: 0,
    type2: 0,
  },
  {
    id: 'V-003',
    title: '2025 Q3 回溯測試',
    createTime: '2025-11-18 15:30:00',
    startTime: '-',
    endTime: '-',
    status: 'Failed', // 發生錯誤
    alerts: 0,
    type1: 0,
    type2: 0,
  },
];

const MOCK_ERRORS_LIST = [
  { pid: 'ETR0039432903', acc_id: 'RTU13434', date: '2025-11-20 10:00:00', type: 'Type 1' },
  { pid: 'UIR32040234', acc_id: 'UIR32040', date: '2025-11-20 10:00:00', type: 'Type 2' },
];

const CHART_DATA = [
  { name: '11/13', error: 4, processing: 20, verified: 50 },
  { name: '11/14', error: 2, processing: 30, verified: 60 },
  { name: '11/15', error: 5, processing: 25, verified: 55 },
  { name: '11/16', error: 1, processing: 40, verified: 80 },
  { name: '11/17', error: 0, processing: 10, verified: 90 },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
      active
        ? 'bg-gray-800 text-white border-l-4 border-blue-500'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles: Record<string, string> = {
    Success: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Mapped: 'bg-green-100 text-green-800', // 成功
    Unmapped: 'bg-gray-100 text-gray-800',
    Active: 'bg-green-100 text-green-800',
    Ready: 'bg-green-100 text-green-800',
    Archived: 'bg-gray-100 text-gray-600',
    'Not Started': 'bg-gray-200 text-gray-600'
  };
  
  const labelMap: Record<string, string> = {
    Success: '已完成',
    Failed: '發生錯誤',
    'In Progress': '正在進行',
    Mapped: '成功',
    Unmapped: '未對應',
    Active: '啟用中',
    Ready: '已就緒',
    Archived: '已封存',
    'Not Started': '尚未開始'
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {labelMap[status] || status}
    </span>
  );
};

// --- Main Application ---

export default function AMLPortal() {
  // Navigation State
  const [selectedProject, setSelectedProject] = useState<any>(null); // 若 null 則顯示歷史紀錄(專案列表)
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, fields, params, verify, history

  // Drill-down States
  const [editingField, setEditingField] = useState<any>(null);
  const [selectedVerify, setSelectedVerify] = useState<any>(null);
  const [isCreatingVerify, setIsCreatingVerify] = useState(false);
  const [verifySubTab, setVerifySubTab] = useState('report'); // 'setting' | 'report' | 'diff'

  // --- SQL Params for display ---
  const generatedSQL = `-- 自動生成的 SQL 邏輯範本
WITH Parameters AS (
 SELECT 
 30 AS Lookback_Days, 
 1500000 AS Deposit_Threshold, 
 1500000 AS Withdrawal_Threshold 
),
-- 步驟 1: 計算每個帳戶在指定期間內的現金存提累計金額
Account_Aggregates AS (
 SELECT
   t1.ACCOUNT_ID,
   SUM(CASE WHEN t1.TRANSACTION_TYPE = 'CASH_DEPOSIT' THEN t1.AMOUNT ELSE 0 END) AS Total_Cash_Deposit,
   SUM(CASE WHEN t1.TRANSACTION_TYPE = 'CASH_WITHDRAWAL' THEN t1.AMOUNT ELSE 0 END) AS Total_Cash_Withdrawal
 FROM STANDARD_TRANSACTION t1
 WHERE t1.TRANSACTION_DATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
 GROUP BY t1.ACCOUNT_ID
)
SELECT * FROM Account_Aggregates
WHERE Total_Cash_Deposit >= 1500000 
   AND Total_Cash_Withdrawal >= 1500000;`;

  // --- Render Functions ---

  // 6.0 歷史紀錄 (也是首頁/專案列表)
  const renderHistory = () => (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            XX Bank AML Portal
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">U</div>
             <span>User001</span>
          </div>
          <span className="cursor-pointer hover:text-red-600 flex items-center gap-1">
             <LogOut size={14}/> 登出
          </span>
        </div>
      </header>

      <main className="flex-1 p-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-6">
             <h2 className="text-3xl font-bold text-gray-800">歷史紀錄 (專案列表)</h2>
             <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
                <Plus size={18}/> 串接新資料源
             </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-5">專案名稱 / 資料庫</th>
                  <th className="p-5">專案起訖日</th>
                  <th className="p-5">建立時間</th>
                  <th className="p-5">狀態</th>
                  <th className="p-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PROJECTS.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => {
                        setSelectedProject(proj);
                        setActiveTab('dashboard');
                    }}
                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <td className="p-5">
                      <div className="font-medium text-gray-800">{proj.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-1">
                        <Database size={12}/> {proj.dbType} : {proj.path}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-500 font-mono">
                      {proj.dateRange}
                    </td>
                    <td className="p-5 text-sm text-gray-500">
                      {proj.createTime}
                    </td>
                    <td className="p-5">
                        <StatusBadge status={proj.status} />
                    </td>
                    <td className="p-5 text-right">
                      <button className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto">
                        開始使用 <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-gray-100 flex justify-center text-sm text-gray-500">
                1 / 1 頁
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // 2.0 總覽
  const renderDashboard = () => (
    <div className="p-6 space-y-6 animate-fade-in w-full">
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center text-green-800">
        <div className="flex items-center gap-3">
             <CheckCircle className="text-green-600" size={20}/>
             <span className="font-medium">成功串接資料源：{selectedProject.name}</span>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setActiveTab('params')}
                className="text-sm bg-white border border-green-200 px-3 py-1.5 rounded hover:bg-green-100 transition-colors">
                查看原廠態樣參數
            </button>
            <button 
                onClick={() => setActiveTab('verify')}
                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors shadow-sm">
                開始驗證
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Data Prep Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Database size={20} className="text-blue-600" /> 資料處理進度
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
            <div className="relative">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>1. 資料擷取</span>
                <span className="text-green-600">已完成</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full w-full"></div>
              </div>
              <div className="mt-2 text-xs text-gray-400">12.5M 筆資料</div>
            </div>
            <div className="relative">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>2. 欄位標準化</span>
                <span className="text-blue-600">47/49 完成</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full w-[94%]"></div>
              </div>
              <div className="mt-2 text-xs text-gray-400">2 個欄位需人工確認</div>
            </div>
            <div className="relative">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>3. 資料載入</span>
                <span className="text-gray-400">等待中</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-gray-300 h-3 rounded-full w-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-500">
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              發生錯誤 (近7日)
            </div>
            <div className="text-4xl font-bold text-gray-800 mt-2">
              4 <span className="text-base font-normal text-gray-400">件</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              正在進行中
            </div>
            <div className="text-4xl font-bold text-gray-800 mt-2">
              10 <span className="text-base font-normal text-gray-400">件</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              已完成驗證 (近7日)
            </div>
            <div className="text-4xl font-bold text-gray-800 mt-2">
              5 <span className="text-base font-normal text-gray-400">件</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">驗證概況趨勢</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="error" fill="#EF4444" name="發生錯誤" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="processing" fill="#3B82F6" name="進行中" stackId="a" />
                <Bar dataKey="verified" fill="#10B981" name="已完成" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // 3.0 欄位對映
  const renderFields = () => {
    if (editingField) {
      return (
        <div className="p-6 h-full flex flex-col w-full">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setEditingField(null)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                新增標準化欄位 / 編輯腳本
              </h2>
              <p className="text-sm text-gray-500">
                欄位名稱: <span className="font-mono font-bold text-blue-600">{editingField.name}</span>
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                儲存設定
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
            {/* Source Tables (Left) */}
            <div className="col-span-3 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200 font-medium text-sm flex items-center justify-between">
                <span>來源資料表</span>
                <Search size={14} />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {[
                  'STANDARD_TRANSACTION',
                  'CUSTOMER_INFO',
                  'ACCOUNT_MASTER',
                  'FX_RATES'
                ].map((tbl) => (
                  <div
                    key={tbl}
                    className="text-sm text-gray-700 p-2 hover:bg-blue-50 rounded cursor-pointer flex gap-2 items-center"
                  >
                    <Database size={12} className="text-gray-400" /> {tbl}
                  </div>
                ))}
              </div>
            </div>

            {/* Editor (Middle/Right) */}
            <div className="col-span-9 bg-white border border-gray-200 rounded-lg flex flex-col p-6">
              <h3 className="font-bold text-gray-700 mb-4">
                轉換規則程式 (Javascript/SQL)
              </h3>
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded p-4 font-mono text-sm text-gray-800 overflow-auto">
                <pre>{`-- Logic for ${editingField.name}\n` +
                 (editingField.status === 'Mapped'
                  ? `SELECT ${editingField.source} FROM STANDARD_TRANSACTION`
                  : `/* 尚未設定轉換邏輯 */\nCASE \n  WHEN channel_id = 'ATM' THEN 'ATM'\n  ELSE 'Branch'\nEND`)}
                </pre>
              </div>
              
              <div className="mt-4 border-t pt-4">
                 <h4 className="text-sm font-bold text-gray-700 mb-2">轉換預覽</h4>
                 <div className="flex gap-4 mb-2">
                    <input type="date" className="border rounded px-2 py-1 text-sm" defaultValue="2025-01-01"/>
                    <span className="text-gray-400">~</span>
                    <input type="date" className="border rounded px-2 py-1 text-sm" defaultValue="2025-03-31"/>
                    <button className="px-3 py-1 bg-gray-800 text-white text-xs rounded">開始測試轉換</button>
                 </div>
                 <div className="p-3 bg-slate-900 text-green-400 font-mono text-xs rounded h-20 overflow-auto">
                    Result Preview: <br/>
                    [Success] 10,000 rows processed. <br/>
                    Sample: "2025-11-19 14:30:25"
                 </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6 w-full animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">欄位對映</h2>
            <p className="text-sm text-gray-500 mt-1">針對資料來源進行欄位標準化設定</p>
          </div>
          <button className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-2">
            <Plus size={16}/> 新增欄位
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-3 text-sm text-blue-800">
            <Activity size={18} />
            <span>總共 49 個標準欄位，已完成 47 個配對，<span className="font-bold text-red-600 underline">剩餘 2 個需手動調整</span></span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4">標準化欄位名稱</th>
                <th className="p-4">資料型態</th>
                <th className="p-4">欄位簡述</th>
                <th className="p-4">來源欄位 (Source)</th>
                <th className="p-4">對映狀態</th>
                <th className="p-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {MOCK_FIELDS.map((field, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono font-medium text-blue-700">
                    {field.name}
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{field.type}</td>
                  <td className="p-4 text-gray-700">{field.desc}</td>
                  <td className="p-4 font-mono text-gray-600">
                    {field.source || '-'}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={field.status} />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setEditingField(field)}
                      className="text-gray-600 hover:text-blue-600 font-medium text-xs flex items-center gap-1"
                    >
                      <Edit3 size={14}/> 編輯腳本
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

  // 4.0 原廠態樣參數
  const renderOriginalParams = () => (
    <div className="p-6 space-y-6 w-full animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">原廠態樣參數</h2>
          <div className="flex gap-2">
             <button className="px-3 py-2 border border-gray-300 rounded bg-white text-sm text-gray-600 hover:bg-gray-50">
                匯出 Excel
             </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4">態樣代碼</th>
                <th className="p-4">AML 排程規則</th>
                <th className="p-4">參數名稱 (Title)</th>
                <th className="p-4">參數值 (Value)</th>
                <th className="p-4">啟用期間</th>
                <th className="p-4">更新時間</th>
                <th className="p-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {MOCK_ORIGINAL_PARAMS.map((item) => (
                <tr key={item.id + item.paramTitle} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-gray-700">{item.id}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{item.schedule}</span>
                  </td>
                  <td className="p-4 font-mono text-blue-700">{item.paramTitle}</td>
                  <td className="p-4 font-mono font-bold">{item.paramValue}</td>
                  <td className="p-4 text-gray-500 text-xs">{item.period}</td>
                  <td className="p-4 text-gray-400 text-xs">{item.updateTime}</td>
                  <td className="p-4">
                     <button className="text-gray-400 hover:text-blue-600">
                        <Edit3 size={16}/>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-100 flex justify-center text-sm text-gray-500">
             顯示 1-3 筆，共 20 筆
          </div>
        </div>
    </div>
  );

  // 5.0 態樣驗證
  const renderVerification = () => {
    // 5.3 新增/編輯 態樣驗證
    if (isCreatingVerify) {
      return (
        <div className="p-6 w-full max-w-5xl mx-auto animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setIsCreatingVerify(false)}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              新增驗證排程
            </h2>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">驗證標題 <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="輸入標題" defaultValue="2025 Q4 驗證" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">選擇態樣 <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option>請選擇...</option>
                        <option selected>txna1101 (月跑批)</option>
                        <option>txna1102 (日跑批)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">驗證敘述</label>
                <textarea className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="輸入描述..."></textarea>
            </div>

            <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700">資料來源區間 <span className="text-red-500">*</span></label>
                 <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                        <input type="text" className="w-full pl-10 border border-gray-300 rounded px-3 py-2" placeholder="YYYY-MM-DD" defaultValue="2025-01-01 00:00:00"/>
                    </div>
                    <span>~</span>
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                        <input type="text" className="w-full pl-10 border border-gray-300 rounded px-3 py-2" placeholder="YYYY-MM-DD" defaultValue="2025-03-31 23:59:59"/>
                    </div>
                 </div>
            </div>

            {/* Parameter Preview */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3">預計驗證參數 (從原廠參數帶入)</h4>
                <table className="w-full text-sm bg-white border border-gray-200 rounded hidden md:table">
                    <thead className="bg-gray-100 text-gray-500">
                        <tr>
                            <th className="p-2 text-left">參數名稱</th>
                            <th className="p-2 text-left">原廠設定值</th>
                            <th className="p-2 text-left">本次驗證值 (可修改)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border-b">credit_limit</td>
                            <td className="p-2 border-b text-gray-500">1,000,000</td>
                            <td className="p-2 border-b"><input type="text" className="border rounded px-2 py-1 w-full" defaultValue="1,000,000"/></td>
                        </tr>
                        <tr>
                            <td className="p-2 border-b">debit_limit</td>
                            <td className="p-2 border-b text-gray-500">1,000,000</td>
                            <td className="p-2 border-b"><input type="text" className="border rounded px-2 py-1 w-full" defaultValue="1,000,000"/></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setIsCreatingVerify(false)} className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">取消</button>
                <button onClick={() => setIsCreatingVerify(false)} className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800">儲存並開始</button>
            </div>
          </div>
        </div>
      );
    }

    // 5.1 / 5.2 詳細頁
    if (selectedVerify) {
      return (
        <div className="p-6 h-full flex flex-col w-full animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedVerify(null)}
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-gray-800">
                    {selectedVerify.title}
                 </h2>
                 <StatusBadge status={selectedVerify.status} />
              </div>
              <div className="text-sm text-gray-500 mt-1 flex gap-4">
                <span className="font-mono">ID: {selectedVerify.id}</span>
                <span>區間: 2025-01-01 ~ 2025-03-31</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 bg-white px-2 rounded-t-lg">
            <button
              onClick={() => setVerifySubTab('setting')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                verifySubTab === 'setting'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              設定 (Settings)
            </button>
            <button
              onClick={() => setVerifySubTab('report')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                verifySubTab === 'report'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              驗證報告 (Report)
            </button>
            <button
              onClick={() => setVerifySubTab('diff')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                verifySubTab === 'diff'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              差異調查紀錄
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {verifySubTab === 'setting' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6 max-w-5xl">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">態樣 (Scenario)</label>
                            <div className="text-lg font-medium text-gray-800">txna1101 單一帳戶大額現金頻繁存提</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">資料來源區間</label>
                            <div className="text-lg font-medium text-gray-800 font-mono">2025-01-01 ~ 2025-03-31</div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">執行腳本 (Executed Script)</label>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded border border-gray-700 font-mono text-sm h-64 overflow-auto">
                            {generatedSQL}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="text-red-600 hover:bg-red-50 px-4 py-2 rounded text-sm font-medium">停止驗證</button>
                        <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm ml-2">重新執行</button>
                    </div>
                </div>
            )}

            {verifySubTab === 'report' && (
                <div className="space-y-6 max-w-6xl">
                    {/* Top Stats */}
                    <div className="grid grid-cols-4 gap-4">
                         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                             <div className="text-gray-500 text-xs mb-1">模擬產生 Alert 數量</div>
                             <div className="text-2xl font-bold text-gray-800">100</div>
                         </div>
                         <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                             <div className="text-gray-500 text-xs mb-1">實際產生 Alert 數量</div>
                             <div className="text-2xl font-bold text-blue-600">98</div>
                         </div>
                         <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                             <div className="text-red-600 text-xs font-bold mb-1">Type 1 錯誤 (誤報)</div>
                             <div className="text-2xl font-bold text-red-700">1</div>
                         </div>
                         <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-center">
                             <div className="text-orange-600 text-xs font-bold mb-1">Type 2 錯誤 (漏報)</div>
                             <div className="text-2xl font-bold text-orange-700">1</div>
                         </div>
                    </div>

                    {/* Diff Table */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase">年月差異表</h3>
                        <table className="w-full text-center text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-3">年</th>
                                    <th className="p-3">月</th>
                                    <th className="p-3">模擬數量</th>
                                    <th className="p-3">實際數量</th>
                                    <th className="p-3 text-red-600">Type 1</th>
                                    <th className="p-3 text-orange-600">Type 2</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3">2025</td>
                                    <td className="p-3">01</td>
                                    <td className="p-3">30</td>
                                    <td className="p-3">30</td>
                                    <td className="p-3 font-bold text-red-600 bg-red-50">0</td>
                                    <td className="p-3 font-bold text-orange-600 bg-orange-50">0</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3">2025</td>
                                    <td className="p-3">02</td>
                                    <td className="p-3">40</td>
                                    <td className="p-3">38</td>
                                    <td className="p-3 font-bold text-red-600 bg-red-50">1</td>
                                    <td className="p-3 font-bold text-orange-600 bg-orange-50">1</td>
                                </tr>
                                <tr>
                                    <td className="p-3">2025</td>
                                    <td className="p-3">03</td>
                                    <td className="p-3">30</td>
                                    <td className="p-3">30</td>
                                    <td className="p-3 font-bold text-red-600 bg-red-50">0</td>
                                    <td className="p-3 font-bold text-orange-600 bg-orange-50">0</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Calendar View (Mock) */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 text-sm uppercase">錯誤概覽 (2025/02)</h3>
                                <div className="flex gap-2 text-xs">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Type 1</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>Type 2</span>
                                </div>
                             </div>
                             <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                                <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
                             </div>
                             <div className="grid grid-cols-7 gap-2">
                                 {Array.from({length: 28}).map((_, i) => {
                                     const hasType1 = i === 14; 
                                     const hasType2 = i === 14;
                                     return (
                                        <div key={i} className={`h-10 border rounded flex flex-col items-center justify-center text-sm relative ${hasType1 ? 'bg-red-50 border-red-200 cursor-pointer' : 'bg-white border-gray-100'}`}>
                                            <span className="text-gray-700">{i+1}</span>
                                            {hasType1 && <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                                            {hasType2 && <div className="absolute bottom-1 left-1 w-2 h-2 bg-orange-500 rounded-full"></div>}
                                        </div>
                                     )
                                 })}
                             </div>
                        </div>

                        {/* Error List */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                             <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase">詳細錯誤清單</h3>
                             <div className="flex-1 overflow-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                        <tr>
                                            <th className="p-2">PID</th>
                                            <th className="p-2">Acc_ID</th>
                                            <th className="p-2">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {MOCK_ERRORS_LIST.map((err, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="p-2 font-mono text-gray-600">{err.pid}</td>
                                                <td className="p-2 font-mono text-gray-600">{err.acc_id}</td>
                                                <td className={`p-2 font-bold ${err.type === 'Type 1' ? 'text-red-600' : 'text-orange-600'}`}>{err.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            {verifySubTab === 'diff' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col items-center justify-center text-gray-400">
                    <FileText size={48} className="mb-4 text-gray-300"/>
                    <p>尚無調查紀錄</p>
                    <button className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">新增調查筆記</button>
                </div>
            )}
          </div>
        </div>
      );
    }

    // 5.0 列表頁
    return (
      <div className="p-6 space-y-6 w-full animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">態樣驗證</h2>
          <button
            onClick={() => setIsCreatingVerify(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2"
          >
            <Plus size={16}/> 新增驗證
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-1">
            {['全部', '已完成', '正在進行', '發生錯誤'].map(tab => (
                <button key={tab} className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all">
                    {tab}
                </button>
            ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4">標題</th>
                <th className="p-4">建立時間</th>
                <th className="p-4">驗證起訖時間</th>
                <th className="p-4 text-center">Type 1 (誤)</th>
                <th className="p-4 text-center">Type 2 (漏)</th>
                <th className="p-4">驗證狀態</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {MOCK_VERIFY_JOBS.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => {
                    setSelectedVerify(job);
                    setVerifySubTab('report');
                  }}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4">
                     <div className="font-medium text-gray-800">{job.title}</div>
                     <div className="text-xs text-gray-400 mt-1">{job.id}</div>
                  </td>
                  <td className="p-4 text-gray-500">{job.createTime}</td>
                  <td className="p-4 text-gray-500 text-xs">
                     <div className="flex flex-col gap-1">
                        <span>開始: {job.startTime}</span>
                        <span>結束: {job.endTime}</span>
                     </div>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-red-500 bg-red-50/50">
                    {job.type1}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-orange-500 bg-orange-50/50">
                    {job.type2}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="p-4 text-right text-gray-300 group-hover:text-blue-500">
                    <ArrowRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Main Render Decision ---

  if (!selectedProject) {
    return renderHistory();
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div
            className="text-white font-bold text-xl tracking-wide flex items-center gap-2 cursor-pointer"
            onClick={() => setSelectedProject(null)}
          >
            <Activity className="text-blue-500" />
            XX Bank AML
          </div>
          <div className="text-gray-500 text-xs mt-1 uppercase tracking-wider pl-8">
            Accounting Engineer
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="總覽"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem
            icon={Database}
            label="欄位對映"
            active={activeTab === 'fields'}
            onClick={() => {
              setActiveTab('fields');
              setEditingField(null);
            }}
          />
          <SidebarItem
            icon={Settings}
            label="原廠態樣參數"
            active={activeTab === 'params'}
            onClick={() => setActiveTab('params')}
          />
          <SidebarItem
            icon={CheckCircle}
            label="態樣驗證"
            active={activeTab === 'verify'}
            onClick={() => {
              setActiveTab('verify');
              setSelectedVerify(null);
              setIsCreatingVerify(false);
            }}
          />
          <div className="pt-4 mt-4 border-t border-gray-800">
             <SidebarItem
                icon={RotateCcw}
                label="歷史紀錄 (切換專案)"
                active={false}
                onClick={() => setSelectedProject(null)}
              />
          </div>
        </nav>

        <div className="p-4 bg-gray-950">
            <div className="text-xs text-gray-500 mb-1">目前專案</div>
            <div className="text-sm text-gray-300 font-medium truncate flex items-center gap-2">
                <Folder size={14} className="text-blue-500"/>
                {selectedProject.name}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-6 shadow-sm z-10 flex-shrink-0 w-full">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={() => setSelectedProject(null)}
            >
              專案列表
            </span>
            <ChevronRight size={14} />
            <span className="font-mono text-gray-800 font-medium truncate max-w-[200px]">
              {selectedProject.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell
                size={20}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">U</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-100 w-full">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'fields' && renderFields()}
          {activeTab === 'params' && renderOriginalParams()}
          {activeTab === 'verify' && renderVerification()}
        </main>
      </div>
    </div>
  );
}
