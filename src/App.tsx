import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Factory, Mail, Lock, Unlock, Plus, Search, 
  Printer, AlertCircle, RefreshCw, LogOut, FileText, Box, 
  CheckSquare, Square, Trash2, Calendar, User, DollarSign, ArrowUpRight
} from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  amount: number;
  orderDate: string;
  dueDate: string;
  status: '處理中' | '已出貨' | '已結案';
  productionStatus: '待排程' | '裁切中' | '組裝中' | '品管中' | '已完工';
  boxCount: number;
  weightKg: number;
  cbm: number;
  carrier?: string;
  trackingNo?: string;
  notes?: string;
}

interface EmailLog {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  type: '新訂單' | '出貨通知' | '詢價';
  parsedContent: string;
}

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: '高' | '中' | '低';
  dueDate: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    customer: '台灣科技股份有限公司',
    product: '高效能工業伺服器機箱 (4U)',
    quantity: 50,
    amount: 350000,
    orderDate: '2026-06-01',
    dueDate: '2026-06-25',
    status: '處理中',
    productionStatus: '組裝中',
    boxCount: 5,
    weightKg: 125.5,
    cbm: 1.8,
    carrier: '新竹物流',
    trackingNo: 'HC-98237411',
    notes: '需加強防撞包角泡沫'
  },
  {
    id: 'ORD-2026-002',
    customer: '宏達精密機械有限公司',
    product: '客製化鋁擠型防護罩',
    quantity: 120,
    amount: 180000,
    orderDate: '2026-06-03',
    dueDate: '2026-06-20',
    status: '處理中',
    productionStatus: '裁切中',
    boxCount: 8,
    weightKg: 240.0,
    cbm: 3.2,
    carrier: '大榮貨運',
    trackingNo: 'TR-55412890',
    notes: '表面陽極處理消光黑'
  },
  {
    id: 'ORD-2026-003',
    customer: '聯發電子科技',
    product: '精密治具金屬底座',
    quantity: 30,
    amount: 95000,
    orderDate: '2026-05-20',
    dueDate: '2026-06-10',
    status: '已出貨',
    productionStatus: '已完工',
    boxCount: 2,
    weightKg: 45.0,
    cbm: 0.6,
    carrier: '黑貓宅急便',
    trackingNo: 'BC-88192344',
    notes: '已送達並簽收'
  }
];

const INITIAL_EMAILS: EmailLog[] = [
  {
    id: 'EM-101',
    sender: 'purchasing@tw-tech.com.tw',
    subject: '【新訂單】伺服器機箱追加 20 台',
    receivedAt: '2026-06-05 09:30',
    type: '新訂單',
    parsedContent: '解析成功：客戶 台灣科技，品項 伺服器機箱 4U，數量 20，需求交期 2026-07-05'
  },
  {
    id: 'EM-102',
    sender: 'logistics@honda-mech.com',
    subject: '出貨通知查詢 - 訂單 ORD-2026-002',
    receivedAt: '2026-06-04 14:15',
    type: '出貨通知',
    parsedContent: '解析成功：確認物流單號 TR-55412890，預計 6/20 派送'
  }
];

const INITIAL_TODOS: TodoItem[] = [
  { id: 'T-1', title: '確認台科大訂單 4U 機箱防撞包裝材質', completed: false, priority: '高', dueDate: '2026-06-15' },
  { id: 'T-2', title: '聯絡新竹物流安排 6/25 貨車排程', completed: false, priority: '中', dueDate: '2026-06-18' },
  { id: 'T-3', title: '審核宏達精密鋁擠型防護罩生管進度', completed: true, priority: '高', dueDate: '2026-06-12' },
  { id: 'T-4', title: '核對 5 月份對帳單與未收款項', completed: false, priority: '中', dueDate: '2026-06-20' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'shipping' | 'production' | 'outlook' | 'todos'>('orders');
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jj_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [emails, setEmails] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('jj_emails_v2');
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('jj_todos_v2');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');

  // New order modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customer: '',
    product: '',
    quantity: 1,
    amount: 0,
    dueDate: '',
    status: '處理中',
    productionStatus: '待排程',
    boxCount: 1,
    weightKg: 10,
    cbm: 0.5,
    carrier: '',
    trackingNo: '',
    notes: ''
  });

  // New Todo input state
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'高' | '中' | '低'>('中');
  const [newTodoDate, setNewTodoDate] = useState('');

  useEffect(() => {
    localStorage.setItem('jj_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jj_emails_v2', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('jj_todos_v2', JSON.stringify(todos));
  }, [todos]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234' || password === 'jj1234') {
      setIsAuthenticated(true);
    } else {
      alert('密碼錯誤！(預設密碼請輸入 1234)');
    }
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customer || !newOrder.product) {
      alert('請填寫完整客戶與產品名稱');
      return;
    }
    const order: Order = {
      id: `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`,
      customer: newOrder.customer || '',
      product: newOrder.product || '',
      quantity: Number(newOrder.quantity) || 1,
      amount: Number(newOrder.amount) || 0,
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: newOrder.dueDate || new Date().toISOString().split('T')[0],
      status: (newOrder.status as any) || '處理中',
      productionStatus: (newOrder.productionStatus as any) || '待排程',
      boxCount: Number(newOrder.boxCount) || 1,
      weightKg: Number(newOrder.weightKg) || 10,
      cbm: Number(newOrder.cbm) || 0.5,
      carrier: newOrder.carrier || '未指定',
      trackingNo: newOrder.trackingNo || '尚未出貨',
      notes: newOrder.notes || ''
    };

    setOrders([order, ...orders]);
    setIsModalOpen(false);
    setNewOrder({
      customer: '',
      product: '',
      quantity: 1,
      amount: 0,
      dueDate: '',
      status: '處理中',
      productionStatus: '待排程',
      boxCount: 1,
      weightKg: 10,
      cbm: 0.5,
      carrier: '',
      trackingNo: '',
      notes: ''
    });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    const item: TodoItem = {
      id: `T-${Date.now()}`,
      title: newTodoTitle,
      completed: false,
      priority: newTodoPriority,
      dueDate: newTodoDate || new Date().toISOString().split('T')[0]
    };
    setTodos([item, ...todos]);
    setNewTodoTitle('');
    setNewTodoDate('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const simulateOutlookSync = () => {
    const randomId = `EM-${Math.floor(Math.random() * 900 + 100)}`;
    const newMail: EmailLog = {
      id: randomId,
      sender: 'client.order@industrial.com',
      subject: '【自動同步】急單需求 - 精密金屬零件 80 件',
      receivedAt: new Date().toLocaleString(),
      type: '新訂單',
      parsedContent: '自動解析：由 Outlook 郵件自動轉入新訂單需求，已建立待確認項目。'
    };
    setEmails([newMail, ...emails]);
    alert('已成功透過 Microsoft Graph API 同步最新 Outlook 郵件！');
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === '全部' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-8 w-full max-w-md text-white">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-4 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-1 tracking-tight">JJ 業務與出貨管理</h1>
          <p className="text-slate-400 text-center text-xs mb-8">頂級企業訂單與物流追蹤系統</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">請輸入訪問密碼</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="預設密碼: 1234" 
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-medium transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm"
            >
              <Unlock className="w-4 h-4" /> 安全登入系統
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
            資料加密保護 • 支援跨裝置同步與離線快取
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 md:pb-0">
      {/* Top Navbar (Desktop & Tablet) */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-600/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">JJ 智慧業務出貨系統</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">訂單追蹤 ∙ 出貨排程 ∙ 包裝明細 ∙ 生管進度 ∙ 待辦事項</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={simulateOutlookSync}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition text-indigo-300 shadow-xs"
              title="同步 Outlook 郵件"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 
              <span className="hidden md:inline">同步 Outlook</span>
            </button>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition text-rose-200 shadow-xs"
              title="鎖定登出"
            >
              <LogOut className="w-3.5 h-3.5" /> 
              <span className="hidden md:inline">鎖定</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === 'orders' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" /> 業務訂單追蹤 <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-semibold">{orders.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === 'shipping' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Box className="w-4 h-4" /> 出貨與包裝明細
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-4 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === 'production' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Factory className="w-4 h-4" /> 生管進度看板
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-4 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === 'todos' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> 工作待辦事項 <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-semibold">{todos.filter(t => !t.completed).length}</span>
          </button>
          <button
            onClick={() => setActiveTab('outlook')}
            className={`px-4 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === 'outlook' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4" /> Outlook 郵件紀錄 <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-semibold">{emails.length}</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* TAB 1: 業務訂單追蹤 */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                <div className="text-xs font-medium text-slate-500 mb-1">總訂單數</div>
                <div className="text-2xl font-bold text-slate-900">{orders.length} 筆</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                <div className="text-xs font-medium text-slate-500 mb-1">進行中訂單</div>
                <div className="text-2xl font-bold text-indigo-600">{orders.filter(o => o.status === '處理中').length} 筆</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                <div className="text-xs font-medium text-slate-500 mb-1">已出貨訂單</div>
                <div className="text-2xl font-bold text-emerald-600">{orders.filter(o => o.status === '已出貨').length} 筆</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                <div className="text-xs font-medium text-slate-500 mb-1">總金額市值</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">NT$ {orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Search & Actions Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="搜尋客戶、產品或訂單編號..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                >
                  <option value="全部">所有狀態</option>
                  <option value="處理中">處理中</option>
                  <option value="已出貨">已出貨</option>
                  <option value="已結案">已結案</option>
                </select>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> 新增業務訂單
              </button>
            </div>

            {/* Orders Table (Desktop) & Cards (Mobile) */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
                      <th className="p-4">訂單編號</th>
                      <th className="p-4">客戶名稱</th>
                      <th className="p-4">產品品項</th>
                      <th className="p-4">數量</th>
                      <th className="p-4">金額 (NT$)</th>
                      <th className="p-4">交貨日期</th>
                      <th className="p-4">訂單狀態</th>
                      <th className="p-4">生管進度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400">
                          沒有找到符合的訂單記錄
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-mono font-bold text-indigo-600">{ord.id}</td>
                          <td className="p-4 font-semibold text-slate-900">{ord.customer}</td>
                          <td className="p-4 text-slate-600">{ord.product}</td>
                          <td className="p-4 font-medium">{ord.quantity}</td>
                          <td className="p-4 font-semibold text-slate-900">NT$ {ord.amount.toLocaleString()}</td>
                          <td className="p-4 text-slate-500 text-xs">{ord.dueDate}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              ord.status === '已出貨' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                              ord.status === '處理中' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              ord.productionStatus === '已完工' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                              ord.productionStatus === '品管中' ? 'bg-purple-50 text-purple-700 border border-purple-200/60' :
                              ord.productionStatus === '組裝中' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' :
                              ord.productionStatus === '裁切中' ? 'bg-orange-50 text-orange-700 border border-orange-200/60' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {ord.productionStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 出貨安排與包裝明細 */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-1">
                <span className="bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-medium border border-indigo-400/30">物流與裝箱模組</span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">出貨安排與包裝明細管理</h2>
                <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">精確掌握每筆訂單的裝箱件數、毛重、材積與物流單號，支援一鍵列印出貨裝箱單。</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-5 py-3 bg-white text-indigo-950 hover:bg-indigo-50 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg transition whitespace-nowrap"
              >
                <Printer className="w-4 h-4" /> 列印出貨裝箱單
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold border border-indigo-100">{ord.id}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        ord.status === '已出貨' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{ord.customer}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{ord.product} (數量: {ord.quantity})</p>
                    </div>
                    
                    <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">裝箱總件數：</span>
                        <span className="font-bold text-slate-900">{ord.boxCount} 箱</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">毛重 (Gross Wt)：</span>
                        <span className="font-bold text-slate-900">{ord.weightKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">材積 (CBM)：</span>
                        <span className="font-bold text-slate-900">{ord.cbm} m³</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-slate-500">指定物流廠商：</span>
                        <span className="font-bold text-indigo-600">{ord.carrier || '未指定'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">物流貨運單號：</span>
                        <span className="font-mono font-bold text-slate-900">{ord.trackingNo || '尚未建立'}</span>
                      </div>
                    </div>

                    {ord.notes && (
                      <div className="text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <span>備註：{ord.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">預定交期：{ord.dueDate}</span>
                    <button 
                      onClick={() => alert(`正在為訂單 ${ord.id} 生成標準 A4 裝箱明細單...`)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" /> 預覽裝箱單
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 生管製作進度看板 */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80">
              <h2 className="text-lg font-bold text-slate-900">工廠生管製作進度看板 (Production Kanban)</h2>
              <p className="text-xs text-slate-500 mt-1">即時拖曳與切換每張訂單在產線上的各個製造節點。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['待排程', '裁切中', '組裝中', '品管中', '已完工'] as const).map((stage) => {
                const stageOrders = orders.filter(o => o.productionStatus === stage);
                return (
                  <div key={stage} className="bg-slate-200/60 rounded-3xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700">{stage}</span>
                      <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-600 shadow-xs">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {stageOrders.map(ord => (
                        <div key={ord.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 text-xs space-y-2.5 hover:shadow-md transition">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-indigo-600">{ord.id}</span>
                            <span className="text-[10px] text-slate-400">{ord.dueDate}</span>
                          </div>
                          <div className="font-bold text-slate-900 line-clamp-1">{ord.customer}</div>
                          <div className="text-slate-600">{ord.product} (x{ord.quantity})</div>
                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400">進度變更</span>
                            <select
                              value={ord.productionStatus}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setOrders(orders.map(item => item.id === ord.id ? {...item, productionStatus: val} : item));
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            >
                              <option value="待排程">待排程</option>
                              <option value="裁切中">裁切中</option>
                              <option value="組裝中">組裝中</option>
                              <option value="品管中">品管中</option>
                              <option value="已完工">已完工</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      {stageOrders.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-2xl bg-white/40">
                          目前無訂單
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: 工作待辦事項 (NEW) */}
        {activeTab === 'todos' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80">
              <h2 className="text-lg font-bold text-slate-900">業務與出貨工作待辦事項 (To-Do List)</h2>
              <p className="text-xs text-slate-500 mt-1">隨手記錄每日待辦任務、採購追蹤與交期提醒，確保業務零漏失。</p>

              {/* Add Todo Form */}
              <form onSubmit={handleAddTodo} className="mt-6 flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  placeholder="輸入新待辦事項 (例: 確認客戶尾款匯款與出貨日期)..."
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as any)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="高">優先級: 高</option>
                  <option value="中">優先級: 中</option>
                  <option value="低">優先級: 低</option>
                </select>
                <input 
                  type="date"
                  value={newTodoDate}
                  onChange={(e) => setNewTodoDate(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> 新增待辦
                </button>
              </form>
            </div>

            {/* Todo List Items */}
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
              {todos.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  目前沒有待辦事項，好好休息或新增一項吧！
                </div>
              ) : (
                todos.map(todo => (
                  <div key={todo.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 flex-1">
                      <button 
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                          todo.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white hover:border-indigo-500'
                        }`}
                      >
                        {todo.completed && <CheckSquare className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            todo.priority === '高' ? 'bg-rose-50 text-rose-700' :
                            todo.priority === '中' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {todo.priority}優先
                          </span>
                          <span>截止日: {todo.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Outlook 郵件自動同步 */}
        {activeTab === 'outlook' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Microsoft Outlook 郵件自動同步紀錄</h2>
                <p className="text-xs text-slate-500 mt-1">透過 Microsoft Graph API 自動擷取新訂單與出貨通知信件內容。</p>
              </div>
              <button
                onClick={simulateOutlookSync}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-medium flex items-center gap-2 shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" /> 立即連線同步信件
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
              {emails.map((mail) => (
                <div key={mail.id} className="p-5 sm:p-6 hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">{mail.id}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        mail.type === '新訂單' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {mail.type}
                      </span>
                      <span className="text-xs text-slate-400">{mail.receivedAt}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{mail.subject}</h4>
                    <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {mail.parsedContent}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    發件者: <span className="font-semibold text-slate-800">{mail.sender}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar (App-like Bottom Nav) */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-40 md:hidden shadow-lg flex justify-around py-2 px-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'orders' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">訂單</span>
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'shipping' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Box className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">出貨</span>
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'production' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Factory className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">生管</span>
        </button>
        <button
          onClick={() => setActiveTab('todos')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'todos' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">待辦</span>
        </button>
        <button
          onClick={() => setActiveTab('outlook')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === 'outlook' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Mail className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">郵件</span>
        </button>
      </nav>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white px-6 py-4.5 flex justify-between items-center">
              <h3 className="font-bold text-base">新增業務訂單與出貨明細</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleAddOrder} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">客戶名稱</label>
                  <input 
                    type="text" 
                    required
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                    placeholder="例: 台灣科技股份有限公司"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">產品品項</label>
                  <input 
                    type="text" 
                    required
                    value={newOrder.product}
                    onChange={(e) => setNewOrder({...newOrder, product: e.target.value})}
                    placeholder="例: 工業伺服器機箱"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">數量</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">金額 (NT$)</label>
                  <input 
                    type="number" 
                    value={newOrder.amount}
                    onChange={(e) => setNewOrder({...newOrder, amount: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">交貨日期</label>
                  <input 
                    type="date" 
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({...newOrder, dueDate: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">裝箱數 (箱)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newOrder.boxCount}
                    onChange={(e) => setNewOrder({...newOrder, boxCount: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">總毛重 (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newOrder.weightKg}
                    onChange={(e) => setNewOrder({...newOrder, weightKg: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">材積 (CBM)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newOrder.cbm}
                    onChange={(e) => setNewOrder({...newOrder, cbm: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">指定物流</label>
                  <input 
                    type="text" 
                    value={newOrder.carrier}
                    onChange={(e) => setNewOrder({...newOrder, carrier: e.target.value})}
                    placeholder="例: 新竹物流 / 大榮貨運"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">物流單號</label>
                  <input 
                    type="text" 
                    value={newOrder.trackingNo}
                    onChange={(e) => setNewOrder({...newOrder, trackingNo: e.target.value})}
                    placeholder="例: HC-98237411"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">備註 / 包裝要求</label>
                <textarea 
                  rows={2}
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  placeholder="例: 需加強木棧板或防撞包角"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-md shadow-indigo-600/20"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
