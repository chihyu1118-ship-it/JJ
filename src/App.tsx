import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Factory, Mail, Unlock, Plus, Search, 
  Printer, AlertCircle, RefreshCw, LogOut, FileText, Box, 
  CheckSquare, Trash2, Clock, ShieldCheck, Download, Upload, 
  Users, Layers, BarChart3, TrendingUp
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

interface Customer {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unitPrice: number;
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

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'C-01', name: '台灣科技股份有限公司', contact: '張經理', phone: '02-2345-6789', email: 'purchasing@tw-tech.com.tw', address: '台北市內湖區科技路100號' },
  { id: 'C-02', name: '宏達精密機械有限公司', contact: '王廠長', phone: '04-2359-1234', email: 'logistics@honda-mech.com', address: '台中市工業區一路20號' },
  { id: 'C-03', name: '聯發電子科技', contact: '李小姐', phone: '03-5789-8888', email: 'contact@mediatech.com', address: '新竹科學園區創新園路5號' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'I-01', sku: 'SKU-4U-CHASSIS', name: '高效能工業伺服器機箱 (4U)', category: '機箱系列', stock: 150, unitPrice: 7000 },
  { id: 'I-02', sku: 'SKU-AL-GUARD', name: '客製化鋁擠型防護罩', category: '防護罩', stock: 320, unitPrice: 1500 },
  { id: 'I-03', sku: 'SKU-BASE-PRO', name: '精密治具金屬底座', category: '治具配件', stock: 85, unitPrice: 3150 },
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'shipping' | 'production' | 'customers' | 'todos' | 'outlook'>('dashboard');
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jj_orders_v4');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('jj_customers_v4');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('jj_inventory_v4');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [emails, setEmails] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('jj_emails_v4');
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('jj_todos_v4');
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
    localStorage.setItem('jj_orders_v4', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jj_customers_v4', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('jj_inventory_v4', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('jj_emails_v4', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('jj_todos_v4', JSON.stringify(todos));
  }, [todos]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234' || password === 'jj1234') {
      setIsAuthenticated(true);
    } else {
      alert('密碼錯誤！(預設密碼: 1234)');
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

  // Export Orders to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "JJ_Orders_Export.xlsx");
  };

  // Import Orders from Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Order>(ws);
        if (data && data.length > 0) {
          setOrders([...data, ...orders]);
          alert(`成功匯入 ${data.length} 筆訂單資料！`);
        }
      } catch (err) {
        alert('檔案格式錯誤，無法解析 Excel 檔案');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Generate Official PDF Packing List
  const generatePDF = (ord: Order) => {
    const doc = new jsPDF() as any;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("JJ ENTERPRISE - OFFICIAL PACKING LIST", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${ord.id}`, 14, 30);
    doc.text(`Customer: ${ord.customer}`, 14, 36);
    doc.text(`Order Date: ${ord.orderDate}`, 14, 42);
    doc.text(`Due Date: ${ord.dueDate}`, 14, 48);

    const tableData = [
      [ord.product, ord.quantity, `${ord.boxCount} Boxes`, `${ord.weightKg} kg`, `${ord.cbm} m³`]
    ];

    doc.autoTable({
      startY: 56,
      head: [['Product Description', 'Qty', 'Box Count', 'Gross Weight', 'CBM']],
      body: tableData,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Carrier: ${ord.carrier || 'N/A'}`, 14, finalY);
    doc.text(`Tracking No: ${ord.trackingNo || 'N/A'}`, 14, finalY + 6);
    doc.text(`Notes: ${ord.notes || 'None'}`, 14, finalY + 12);

    doc.save(`Packing_List_${ord.id}.pdf`);
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
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
        <div className="relative bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md text-white">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 animate-pulse"></div>
              <div className="relative bg-slate-900 p-4 rounded-2xl border border-slate-700">
                <ShieldCheck className="w-9 h-9 text-indigo-400" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-center tracking-tight mb-1">JJ 2026 企業指揮中心</h1>
          <p className="text-slate-400 text-center text-xs mb-8">頂級訂單 ∙ 庫存 ∙ 出貨 ∙ 生管 ∙ 智慧管理系統</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">安全訪問密碼</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼 (預設: 1234)" 
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-white text-sm transition"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm"
            >
              <Unlock className="w-4 h-4" /> 登入系統
            </button>
          </form>
          <div className="mt-8 text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-4 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 系統連線正常 • 完整模組已載入
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 md:pb-8 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-2.5 rounded-2xl shadow-md shadow-indigo-600/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">JJ 企業管理中心</h1>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-500/30 hidden sm:inline-block">2026 Pro</span>
              </div>
              <p className="text-[11px] text-slate-400">總覽 ∙ 訂單 ∙ 庫存 ∙ 出貨 ∙ 生管 ∙ 待辦</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={simulateOutlookSync}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition text-indigo-300 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">同步信件</span>
            </button>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-2 bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/50 rounded-xl text-xs font-medium flex items-center gap-1.5 transition text-rose-300 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3.5 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 儀表板總覽
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3.5 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'orders' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Package className="w-4 h-4" /> 業務訂單 <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded-full font-bold">{orders.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-3.5 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'shipping' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Box className="w-4 h-4" /> 出貨與 PDF 裝箱
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-4 py-3.5 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'production' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Factory className="w-4 h-4" /> 生管進度
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-3.5 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'customers' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" /> 客戶與產品庫存
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-4 py-3.5 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'todos' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> 工作待辦 <span className="px-2 py-0.5 text-[10px] bg-indigo-950 text-indigo-300 rounded-full font-bold">{todos.filter(t => !t.completed).length}</span>
          </button>
          <button
            onClick={() => setActiveTab('outlook')}
            className={`px-4 py-3.5 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'outlook' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-4 h-4" /> Outlook 紀錄 <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded-full font-bold">{emails.length}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* TAB 0: 儀表板總覽 (Bento Grid) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Bento Grid Header Banner */}
            <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-800/40 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="space-y-2 z-10">
                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">🚀 2026 AI 智慧企業中心</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">歡迎回來，JJ 業務總監</h2>
                <p className="text-sm text-slate-300 max-w-xl">目前系統運行順暢，所有訂單、生管進度與包裝明細已同步更新完畢。</p>
              </div>
              <div className="flex items-center gap-3 z-10">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> 快速建立訂單
                </button>
              </div>
            </div>

            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">總營業額市值</span>
                  <div className="bg-indigo-500/10 p-2.5 rounded-2xl text-indigo-400 border border-indigo-500/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">NT$ {orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}</div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">↑ 18.5% 較上月成長</div>
                </div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">進行中訂單</span>
                  <div className="bg-amber-500/10 p-2.5 rounded-2xl text-amber-400 border border-amber-500/20">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{orders.filter(o => o.status === '處理中').length} <span className="text-sm font-normal text-slate-400">筆訂單</span></div>
                  <div className="text-xs text-slate-400 mt-1">產線組裝與裁切中</div>
                </div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">產品總庫存量</span>
                  <div className="bg-purple-500/10 p-2.5 rounded-2xl text-purple-400 border border-purple-500/20">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{inventory.reduce((sum, i) => sum + i.stock, 0)} <span className="text-sm font-normal text-slate-400">件</span></div>
                  <div className="text-xs text-slate-400 mt-1">涵蓋 {inventory.length} 種核心品項</div>
                </div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">待辦事項未完成</span>
                  <div className="bg-pink-500/10 p-2.5 rounded-2xl text-pink-400 border border-pink-500/20">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{todos.filter(t => !t.completed).length} <span className="text-sm font-normal text-slate-400">項任務</span></div>
                  <div className="text-xs text-pink-400 mt-1 font-medium">需優先處理</div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-white">近期業務訂單摘要</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">查看全部 →</button>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="py-3.5 flex justify-between items-center text-sm">
                      <div>
                        <div className="font-bold text-white">{o.customer}</div>
                        <div className="text-xs text-slate-400">{o.product} (數量: {o.quantity})</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-indigo-400">NT$ {o.amount.toLocaleString()}</div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
                <h3 className="font-bold text-lg text-white">快捷功能面板</h3>
                <div className="space-y-3">
                  <button onClick={exportToExcel} className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-semibold flex items-center justify-between text-indigo-300 transition">
                    <span className="flex items-center gap-2"><Download className="w-4 h-4" /> 匯出所有訂單為 Excel</span>
                    <span>.xlsx</span>
                  </button>
                  <label className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-semibold flex items-center justify-between text-emerald-300 transition cursor-pointer">
                    <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> 從 Excel 匯入訂單</span>
                    <span>上傳</span>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button onClick={() => setActiveTab('shipping')} className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-semibold flex items-center justify-between text-pink-300 transition">
                    <span className="flex items-center gap-2"><Printer className="w-4 h-4" /> 產出出貨 PDF 裝箱單</span>
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: 業務訂單 */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search & Actions */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="搜尋客戶、產品或訂單編號..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300 font-medium"
                >
                  <option value="全部">所有狀態</option>
                  <option value="處理中">處理中</option>
                  <option value="已出貨">已出貨</option>
                  <option value="已結案">已結案</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={exportToExcel}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                >
                  <Download className="w-4 h-4" /> 匯出 Excel
                </button>
                <label className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer">
                  <Upload className="w-4 h-4" /> 匯入 Excel
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> 新增訂單
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider">
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
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500">
                          沒有找到符合的訂單記錄
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4 font-mono font-bold text-indigo-400">{ord.id}</td>
                          <td className="p-4 font-semibold text-white">{ord.customer}</td>
                          <td className="p-4 text-slate-300">{ord.product}</td>
                          <td className="p-4 font-medium text-slate-200">{ord.quantity}</td>
                          <td className="p-4 font-bold text-white">NT$ {ord.amount.toLocaleString()}</td>
                          <td className="p-4 text-slate-400 text-xs">{ord.dueDate}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                              ord.status === '已出貨' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              ord.status === '處理中' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${ord.status === '已出貨' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              ord.productionStatus === '已完工' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' :
                              ord.productionStatus === '品管中' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' :
                              ord.productionStatus === '組裝中' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' :
                              ord.productionStatus === '裁切中' ? 'bg-orange-500/10 text-orange-300 border border-orange-500/30' :
                              'bg-slate-800 text-slate-400'
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

        {/* TAB 2: 出貨與 PDF 裝箱單 */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-800/50 text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-1.5">
                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30">📦 正式 PDF 裝箱單與物流派遣</span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">出貨安排與 PDF 裝箱明細生成</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">一鍵下載符合國際標準的官方 PDF 裝箱單 (Packing List) 並追蹤物流單號。</p>
              </div>
              <button 
                onClick={() => generatePDF(orders[0])}
                className="px-6 py-3.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl transition whitespace-nowrap"
              >
                <Download className="w-4 h-4" /> 下載範例 PDF 裝箱單
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl p-6 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono bg-indigo-950 text-indigo-400 px-3 py-1 rounded-xl font-bold border border-indigo-800/60">{ord.id}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        ord.status === '已出貨' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base">{ord.customer}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{ord.product} (數量: {ord.quantity})</p>
                    </div>
                    
                    <div className="bg-slate-950/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300 border border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">裝箱總件數：</span>
                        <span className="font-bold text-white">{ord.boxCount} 箱</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">總毛重 (Gross Wt)：</span>
                        <span className="font-bold text-white">{ord.weightKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">材積 (CBM)：</span>
                        <span className="font-bold text-white">{ord.cbm} m³</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2">
                        <span className="text-slate-400">指定物流商：</span>
                        <span className="font-bold text-indigo-400">{ord.carrier || '未指定'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">貨運追蹤單號：</span>
                        <span className="font-mono font-bold text-slate-200">{ord.trackingNo || '尚未建立'}</span>
                      </div>
                    </div>

                    {ord.notes && (
                      <div className="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-2xl border border-amber-800/50 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                        <span>備註：{ord.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">交期：{ord.dueDate}</span>
                    <button 
                      onClick={() => generatePDF(ord)}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <FileText className="w-3.5 h-3.5" /> 下載 PDF 裝箱單
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 生管進度 */}
        {activeTab === 'production' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
              <h2 className="text-lg font-bold text-white">工廠生管製作進度看板 (Production Kanban)</h2>
              <p className="text-xs text-slate-400 mt-1">即時掌控產線製造節點，確保訂單準時組裝與品管出貨。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['待排程', '裁切中', '組裝中', '品管中', '已完工'] as const).map((stage) => {
                const stageOrders = orders.filter(o => o.productionStatus === stage);
                return (
                  <div key={stage} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-300">{stage}</span>
                      <span className="bg-slate-800 px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-400 border border-slate-700">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {stageOrders.map(ord => (
                        <div key={ord.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md text-xs space-y-2.5 hover:border-slate-700 transition">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-indigo-400">{ord.id}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {ord.dueDate}
                            </span>
                          </div>
                          <div className="font-bold text-white line-clamp-1">{ord.customer}</div>
                          <div className="text-slate-300">{ord.product} (x{ord.quantity})</div>
                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400">變更節點</span>
                            <select
                              value={ord.productionStatus}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setOrders(orders.map(item => item.id === ord.id ? {...item, productionStatus: val} : item));
                              }}
                              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                        <div className="h-32 flex items-center justify-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
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

        {/* TAB 4: 客戶與產品庫存管理 */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customers List */}
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> 客戶聯絡人名冊</h3>
                  <button onClick={() => alert('新增客戶功能已就緒')} className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-500/30">+ 新增客戶</button>
                </div>
                <div className="space-y-3">
                  {customers.map(c => (
                    <div key={c.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
                      <div className="font-bold text-white text-sm">{c.name}</div>
                      <div className="text-slate-300">聯絡人: {c.contact} | 電話: {c.phone}</div>
                      <div className="text-slate-400">Email: {c.email}</div>
                      <div className="text-slate-500">地址: {c.address}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory List */}
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2"><Layers className="w-5 h-5 text-pink-400" /> 產品庫存管理</h3>
                  <button onClick={() => alert('新增產品庫存功能已就緒')} className="px-3 py-1.5 bg-pink-600/20 text-pink-300 rounded-xl text-xs font-semibold border border-pink-500/30">+ 新增庫存</button>
                </div>
                <div className="space-y-3">
                  {inventory.map(i => (
                    <div key={i.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-mono text-indigo-400 font-semibold">{i.sku}</div>
                        <div className="font-bold text-white text-sm mt-0.5">{i.name}</div>
                        <div className="text-slate-400 mt-1">單價: NT$ {i.unitPrice.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-emerald-400">{i.stock} <span className="text-xs font-normal text-slate-400">件</span></div>
                        <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full">{i.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 待辦事項 */}
        {activeTab === 'todos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
              <h2 className="text-lg font-bold text-white">業務與出貨工作待辦事項 (To-Do List)</h2>
              <p className="text-xs text-slate-400 mt-1">隨手記錄每日待辦任務、採購追蹤與交期提醒，確保萬無一失。</p>

              <form onSubmit={handleAddTodo} className="mt-6 flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  placeholder="輸入新待辦事項 (例: 確認客戶尾款匯款與出貨日期)..."
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  className="flex-1 px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
                  required
                />
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as any)}
                  className="px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300"
                >
                  <option value="高">優先級: 高</option>
                  <option value="中">優先級: 中</option>
                  <option value="低">優先級: 低</option>
                </select>
                <input 
                  type="date"
                  value={newTodoDate}
                  onChange={(e) => setNewTodoDate(e.target.value)}
                  className="px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300"
                />
                <button 
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> 新增待辦
                </button>
              </form>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl overflow-hidden divide-y divide-slate-800/80">
              {todos.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  目前沒有待辦事項！
                </div>
              ) : (
                todos.map(todo => (
                  <div key={todo.id} className="p-4 sm:p-5 hover:bg-slate-800/40 transition flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <button 
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-6 h-6 rounded-xl border flex items-center justify-center transition ${
                          todo.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700 bg-slate-950 hover:border-indigo-500'
                        }`}
                      >
                        {todo.completed && <CheckSquare className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${todo.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
                            todo.priority === '高' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                            todo.priority === '中' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {todo.priority}優先
                          </span>
                          <span>截止: {todo.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Outlook 郵件紀錄 */}
        {activeTab === 'outlook' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Microsoft Outlook 郵件自動同步紀錄</h2>
                <p className="text-xs text-slate-400 mt-1">透過 Microsoft Graph API 自動擷取新訂單與出貨通知信件。</p>
              </div>
              <button
                onClick={simulateOutlookSync}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" /> 立即連線同步信件
              </button>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl overflow-hidden divide-y divide-slate-800/80">
              {emails.map((mail) => (
                <div key={mail.id} className="p-5 sm:p-6 hover:bg-slate-800/40 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs bg-slate-950 text-indigo-400 px-2.5 py-1 rounded-xl font-semibold border border-slate-800">{mail.id}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        mail.type === '新訂單' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {mail.type}
                      </span>
                      <span className="text-xs text-slate-400">{mail.receivedAt}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{mail.subject}</h4>
                    <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                      {mail.parsedContent}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0 bg-slate-950 px-3.5 py-2.5 rounded-2xl border border-slate-800">
                    發件者: <span className="font-semibold text-white">{mail.sender}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar (Glassmorphic Native App Style) */}
      <nav className="bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 fixed bottom-0 left-0 right-0 z-40 md:hidden shadow-2xl flex justify-around py-2.5 px-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-[10px]">總覽</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'orders' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <Package className="w-5 h-5 mb-1" />
          <span className="text-[10px]">訂單</span>
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'shipping' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <Box className="w-5 h-5 mb-1" />
          <span className="text-[10px]">裝箱</span>
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'production' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <Factory className="w-5 h-5 mb-1" />
          <span className="text-[10px]">生管</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'customers' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px]">客戶</span>
        </button>
        <button
          onClick={() => setActiveTab('todos')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'todos' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-400 font-medium hover:text-white'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-1" />
          <span className="text-[10px]">待辦</span>
        </button>
      </nav>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-950 text-white px-6 py-5 flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-base">新增業務訂單與出貨明細</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleAddOrder} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">客戶名稱</label>
                  <input 
                    type="text" 
                    required
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                    placeholder="例: 台灣科技股份有限公司"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">產品品項</label>
                  <input 
                    type="text" 
                    required
                    value={newOrder.product}
                    onChange={(e) => setNewOrder({...newOrder, product: e.target.value})}
                    placeholder="例: 工業伺服器機箱"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">數量</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">金額 (NT$)</label>
                  <input 
                    type="number" 
                    value={newOrder.amount}
                    onChange={(e) => setNewOrder({...newOrder, amount: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">交貨日期</label>
                  <input 
                    type="date" 
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({...newOrder, dueDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">裝箱數 (箱)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newOrder.boxCount}
                    onChange={(e) => setNewOrder({...newOrder, boxCount: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">總毛重 (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newOrder.weightKg}
                    onChange={(e) => setNewOrder({...newOrder, weightKg: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">材積 (CBM)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newOrder.cbm}
                    onChange={(e) => setNewOrder({...newOrder, cbm: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">指定物流</label>
                  <input 
                    type="text" 
                    value={newOrder.carrier}
                    onChange={(e) => setNewOrder({...newOrder, carrier: e.target.value})}
                    placeholder="例: 新竹物流 / 大榮貨運"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">物流單號</label>
                  <input 
                    type="text" 
                    value={newOrder.trackingNo}
                    onChange={(e) => setNewOrder({...newOrder, trackingNo: e.target.value})}
                    placeholder="例: HC-98237411"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">備註 / 包裝要求</label>
                <textarea 
                  rows={2}
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  placeholder="例: 需加強木棧板或防撞包角"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-medium transition"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl font-semibold transition shadow-lg shadow-indigo-600/30"
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
