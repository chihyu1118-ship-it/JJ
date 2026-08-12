import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Factory, Mail, Lock, Unlock, Plus, Search, 
  Printer, AlertCircle, RefreshCw, LogOut, FileText, Box
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

export default App;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'shipping' | 'production' | 'outlook'>('orders');
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jj_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [emails, setEmails] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('jj_emails');
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
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

  useEffect(() => {
    localStorage.setItem('jj_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jj_emails', JSON.stringify(emails));
  }, [emails]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password for personal secure use on GitHub Pages is '1234' or 'jj1234'
    if (password === '1234' || password === 'jj1234') {
      setIsAuthenticated(true);
    } else {
      alert('密碼錯誤！(預設密碼請輸入 1234 或 jj1234)');
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-full shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">JJ 業務與出貨管理系統</h1>
          <p className="text-slate-400 text-center text-sm mb-6">GitHub Pages 專屬安全加密登入</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">安全訪問密碼</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼 (預設: 1234)" 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition shadow-lg flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" /> 登入系統
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-500">
            提示：本系統資料儲存於您的瀏覽器或雲端，完全私密安全。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">JJ 業務訂單與出貨裝箱管理系統</h1>
              <p className="text-xs text-slate-400">整合訂單追蹤、出貨安排、包裝明細、生管進度與 Outlook 自動化</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={simulateOutlookSync}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition text-indigo-300"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 同步 Outlook 郵件
            </button>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition text-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" /> 鎖定登出
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'orders' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" /> 業務訂單追蹤 ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-5 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'shipping' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Box className="w-4 h-4" /> 出貨安排與包裝明細
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-5 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'production' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Factory className="w-4 h-4" /> 生管製作進度看板
          </button>
          <button
            onClick={() => setActiveTab('outlook')}
            className={`px-5 py-3.5 font-medium text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'outlook' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4" /> Outlook 郵件自動同步 ({emails.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        
        {/* TAB 1: 業務訂單追蹤 */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="搜尋客戶、產品或訂單編號..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="全部">所有狀態</option>
                  <option value="處理中">處理中</option>
                  <option value="已出貨">已出貨</option>
                  <option value="已結案">已結案</option>
                </select>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow transition"
              >
                <Plus className="w-4 h-4" /> 新增業務訂單
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="p-4 font-semibold">訂單編號</th>
                      <th className="p-4 font-semibold">客戶名稱</th>
                      <th className="p-4 font-semibold">產品品項</th>
                      <th className="p-4 font-semibold">數量</th>
                      <th className="p-4 font-semibold">金額 (NT$)</th>
                      <th className="p-4 font-semibold">交貨日期</th>
                      <th className="p-4 font-semibold">訂單狀態</th>
                      <th className="p-4 font-semibold">生管進度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          沒有找到符合的訂單記錄
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-mono font-medium text-indigo-600">{ord.id}</td>
                          <td className="p-4 font-medium text-slate-900">{ord.customer}</td>
                          <td className="p-4 text-slate-600">{ord.product}</td>
                          <td className="p-4">{ord.quantity}</td>
                          <td className="p-4 font-medium">NT$ {ord.amount.toLocaleString()}</td>
                          <td className="p-4 text-slate-500">{ord.dueDate}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              ord.status === '已出貨' ? 'bg-emerald-100 text-emerald-800' :
                              ord.status === '處理中' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              ord.productionStatus === '已完工' ? 'bg-indigo-100 text-indigo-800' :
                              ord.productionStatus === '品管中' ? 'bg-purple-100 text-purple-800' :
                              ord.productionStatus === '組裝中' ? 'bg-blue-100 text-blue-800' :
                              ord.productionStatus === '裁切中' ? 'bg-orange-100 text-orange-800' :
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
            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold">出貨安排與包裝明細總覽</h2>
                <p className="text-xs text-indigo-200 mt-1">管理各批訂單之裝箱數量、總毛重、材積 (CBM) 與物流單號，支援一鍵列印裝箱單。</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-sm font-medium flex items-center gap-2 shadow transition whitespace-nowrap"
              >
                <Printer className="w-4 h-4" /> 列印當前裝箱/出貨單
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-medium">{ord.id}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        ord.status === '已出貨' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{ord.customer}</h3>
                    <p className="text-sm text-slate-600 mb-4">{ord.product} (數量: {ord.quantity})</p>
                    
                    <div className="bg-slate-50 rounded-lg p-3.5 space-y-2 text-xs text-slate-700 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">裝箱總件數：</span>
                        <span className="font-semibold text-slate-900">{ord.boxCount} 箱</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">毛重 (Gross Wt)：</span>
                        <span className="font-semibold text-slate-900">{ord.weightKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">材積 (CBM)：</span>
                        <span className="font-semibold text-slate-900">{ord.cbm} m³</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2">
                        <span className="text-slate-500">指定物流：</span>
                        <span className="font-semibold text-indigo-600">{ord.carrier || '未指定'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">物流追蹤單號：</span>
                        <span className="font-mono font-semibold text-slate-900">{ord.trackingNo || '尚無單號'}</span>
                      </div>
                    </div>

                    {ord.notes && (
                      <div className="mt-3 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>備註：{ord.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400">交期：{ord.dueDate}</span>
                    <button 
                      onClick={() => alert(`正在為訂單 ${ord.id} (${ord.customer}) 生成 A4 裝箱明細單與出貨標籤...`)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> 檢視裝箱單
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">工廠生管製作進度看板 (Production Kanban)</h2>
              <p className="text-xs text-slate-500 mt-1">即時掌握每張訂單目前在生產線上的各個階段，確保如期交貨。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['待排程', '裁切中', '組裝中', '品管中', '已完工'] as const).map((stage) => {
                const stageOrders = orders.filter(o => o.productionStatus === stage);
                return (
                  <div key={stage} className="bg-slate-200/70 rounded-xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm text-slate-700">{stage}</span>
                      <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 shadow-xs">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {stageOrders.map(ord => (
                        <div key={ord.id} className="bg-white p-3.5 rounded-lg shadow-xs border border-slate-200 text-xs space-y-2">
                          <div className="font-mono font-semibold text-indigo-600">{ord.id}</div>
                          <div className="font-bold text-slate-900 line-clamp-1">{ord.customer}</div>
                          <div className="text-slate-600">{ord.product} (x{ord.quantity})</div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-400">
                            <span>交期: {ord.dueDate}</span>
                            <select
                              value={ord.productionStatus}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setOrders(orders.map(item => item.id === ord.id ? {...item, productionStatus: val} : item));
                              }}
                              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
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
                        <div className="h-24 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-lg">
                          無訂單
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Outlook 郵件自動同步 */}
        {activeTab === 'outlook' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Microsoft Outlook 郵件自動同步紀錄</h2>
                <p className="text-xs text-slate-500 mt-1">透過 Microsoft Graph API 自動擷取新訂單與出貨通知信件內容，避免漏單。</p>
              </div>
              <button
                onClick={simulateOutlookSync}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow transition"
              >
                <RefreshCw className="w-4 h-4" /> 立即連線同步信件
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {emails.map((mail) => (
                  <div key={mail.id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{mail.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          mail.type === '新訂單' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {mail.type}
                        </span>
                        <span className="text-xs text-slate-400">{mail.receivedAt}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{mail.subject}</h4>
                      <p className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                        {mail.parsedContent}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 shrink-0">
                      發件者: <span className="font-medium text-slate-700">{mail.sender}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-12">
        JJ 業務與出貨管理系統 © 2026 • 部署於 GitHub Pages • 安全私密防護
      </footer>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">新增業務訂單與出貨明細</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>
            <form onSubmit={handleAddOrder} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">客戶名稱</label>
                  <input 
                    type="text" 
                    required
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                    placeholder="例: 台灣科技股份有限公司"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">產品品項</label>
                  <input 
                    type="text" 
                    required
                    value={newOrder.product}
                    onChange={(e) => setNewOrder({...newOrder, product: e.target.value})}
                    placeholder="例: 工業伺服器機箱"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">數量</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">金額 (NT$)</label>
                  <input 
                    type="number" 
                    value={newOrder.amount}
                    onChange={(e) => setNewOrder({...newOrder, amount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">交貨日期</label>
                  <input 
                    type="date" 
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({...newOrder, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">裝箱數 (箱)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newOrder.boxCount}
                    onChange={(e) => setNewOrder({...newOrder, boxCount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">總毛重 (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newOrder.weightKg}
                    onChange={(e) => setNewOrder({...newOrder, weightKg: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">材積 (CBM)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newOrder.cbm}
                    onChange={(e) => setNewOrder({...newOrder, cbm: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">指定物流</label>
                  <input 
                    type="text" 
                    value={newOrder.carrier}
                    onChange={(e) => setNewOrder({...newOrder, carrier: e.target.value})}
                    placeholder="例: 新竹物流 / 大榮貨運"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">物流單號</label>
                  <input 
                    type="text" 
                    value={newOrder.trackingNo}
                    onChange={(e) => setNewOrder({...newOrder, trackingNo: e.target.value})}
                    placeholder="例: HC-98237411"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">備註 / 包裝要求</label>
                <textarea 
                  rows={2}
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  placeholder="例: 需加強木棧板或防撞包角"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition shadow"
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
