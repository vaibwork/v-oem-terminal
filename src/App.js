import React, { useState, createContext, useContext } from 'react';
import { 
  Settings, 
  Search, 
  Droplet, 
  Wrench, 
  PlusSquare, 
  LogOut, 
  Activity, 
  Database, 
  Save, 
  RefreshCw,
  CheckCircle2,
  Filter,
  Download
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';



// --- Context & State Management ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [machineStatus, setMachineStatus] = useState('READY'); // READY, BUSY, ERROR
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  
  // Machine Configuration State
  const [config, setConfig] = useState({
    modelNumber: 'VOEM-TX-2000',
    serialNumber: 'SN-8829-XJ',
    installDate: '2023-10-15',
    numCanisters: 16,
    maxLevel: 3000,
    reserveLevel: 500,
    commMode: 'USB',
    comPort: 'COM3'
  });

  // Canister Data State (16 canisters)
  const [canisters, setCanisters] = useState(
    Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      code: `C-${(i + 1).toString().padStart(2, '0')}`,
      color: [
        '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFFF00', '#008000', 
        '#FFA500', '#800080', '#A52A2A', '#808080', '#FFC0CB', '#00FFFF',
        '#F0E68C', '#E6E6FA', '#000080', '#556B2F'
      ][i] || '#CCCCCC',
      level: Math.floor(Math.random() * 2000) + 500,
      agitator: false,
      valve: false,
      pump: 'OFF' // OFF, UP, DOWN
    }))
  );

  const login = (username, password) => {
    // Mock Authentication
    if (username === 'admin' && password === 'admin') {
      const userData = { id: 1, name: 'Administrator', role: 'SuperUser' };
      setUser(userData);
      localStorage.setItem('voem_session', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('voem_session');
    setCurrentScreen('LOGIN');
  };

  return (
    <AppContext.Provider value={{
      user, setUser, currentScreen, setCurrentScreen,
      machineStatus, setMachineStatus,
      config, setConfig,
      canisters, setCanisters,
      login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Reusable UI Components ---

const Card = ({ children, title, className = "" }) => (
  <div className={`bg-[#2d2d2d] border border-[#3f3f3f] rounded-lg shadow-xl overflow-hidden ${className}`}>
    {title && (
      <div className="bg-[#383838] px-4 py-2 border-b border-[#4a4a4a] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = "", icon: Icon }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-[#444] hover:bg-[#555] text-gray-200 border border-[#555]',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    ghost: 'bg-transparent hover:bg-[#333] text-gray-400'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 font-medium text-sm ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-semibold text-gray-400 uppercase">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-[#1a1a1a] border border-[#444] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
    />
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    READY: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    BUSY: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    ERROR: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Modules ---

const LoginScreen = () => {
  const { login } = useContext(AppContext);
  const [creds, setCreds] = useState({ user: '', pass: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(creds.user, creds.pass)) {
      setError('');
    } else {
      setError('Invalid credentials. Use admin/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">v-oem</h1>
          <p className="text-gray-500 text-sm mt-1">Industrial Tinting Control v1.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Username" 
            value={creds.user} 
            onChange={e => setCreds({...creds, user: e.target.value})} 
          />
          <Input 
            label="Password" 
            type="password" 
            value={creds.pass} 
            onChange={e => setCreds({...creds, pass: e.target.value})} 
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          <Button className="w-full mt-4 py-3" variant="primary">Authenticate</Button>
        </form>

        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest">
          Secure Terminal Session Required
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { canisters, machineStatus, config } = useContext(AppContext);
  
  const stats = [
    { label: 'Canisters Active', value: canisters.length, icon: Database },
    { label: 'Avg Fill Level', value: `${Math.round(canisters.reduce((a, b) => a + b.level, 0) / canisters.length)} ml`, icon: Droplet },
    { label: 'Uptime', value: '42d 12h', icon: Activity },
    { label: 'Last Service', value: config.installDate, icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-l-4 border-l-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#333] rounded-lg text-blue-400">
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">{stat.label}</p>
                <p className="text-xl font-bold text-gray-200">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Canister Levels (ml)">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={canisters}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="code" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#444', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="level" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Activity Logs">
          <div className="space-y-3 mt-2">
            {[
              { time: '10:45 AM', action: 'Dispense Successful', detail: 'Formula #AX-102 (400ml)', status: 'success' },
              { time: '09:12 AM', action: 'Agitator Cycle', detail: 'All canisters - 5 mins', status: 'info' },
              { time: '08:00 AM', action: 'System Boot', detail: 'v-oem v1.0 kernel initialized', status: 'success' },
              { time: 'Yesterday', action: 'Refill', detail: 'Canister C-02 (+1200ml)', status: 'info' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-sm border-b border-[#333] pb-2 last:border-0">
                <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <span className="text-gray-500 w-16 text-xs">{log.time}</span>
                <span className="text-gray-300 font-medium flex-1">{log.action}</span>
                <span className="text-gray-500 text-xs italic">{log.detail}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const SetupModule = () => {
  const { config, setConfig } = useContext(AppContext);
  const [localConfig, setLocalConfig] = useState({...config});

  const handleSave = () => {
    setConfig(localConfig);
    // Future API logic: axios.post('/api/config', localConfig)
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card title="Machine Specifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <Input label="Model Number" value={localConfig.modelNumber} onChange={e => setLocalConfig({...localConfig, modelNumber: e.target.value})} />
          <Input label="Serial Number" value={localConfig.serialNumber} onChange={e => setLocalConfig({...localConfig, serialNumber: e.target.value})} />
          <Input label="Installation Date" type="date" value={localConfig.installDate} onChange={e => setLocalConfig({...localConfig, installDate: e.target.value})} />
          <Input label="Number of Canisters" type="number" value={localConfig.numCanisters} onChange={e => setLocalConfig({...localConfig, numCanisters: e.target.value})} />
        </div>
      </Card>

      <Card title="Canister Operating Limits">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <Input label="Max Level (ml)" type="number" value={localConfig.maxLevel} onChange={e => setLocalConfig({...localConfig, maxLevel: e.target.value})} />
          <Input label="Reserve Level (ml)" type="number" value={localConfig.reserveLevel} onChange={e => setLocalConfig({...localConfig, reserveLevel: e.target.value})} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">Can Size</label>
            <select className="bg-[#1a1a1a] border border-[#444] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none">
              <option>Normal</option>
              <option>Hi-Tint</option>
              <option>Extra Large</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Communication Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">Mode</label>
            <div className="flex gap-2">
              <Button 
                variant={localConfig.commMode === 'USB' ? 'primary' : 'secondary'} 
                onClick={() => setLocalConfig({...localConfig, commMode: 'USB'})}
                className="flex-1"
              >USB</Button>
              <Button 
                variant={localConfig.commMode === 'WiFi' ? 'primary' : 'secondary'} 
                onClick={() => setLocalConfig({...localConfig, commMode: 'WiFi'})}
                className="flex-1"
              >WiFi</Button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">COM Port / IP Address</label>
            <select className="bg-[#1a1a1a] border border-[#444] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none">
              <option>COM3</option>
              <option>COM4</option>
              <option>192.168.1.50</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary">Cancel Changes</Button>
        <Button variant="success" icon={Save} onClick={handleSave}>Apply Specifications</Button>
      </div>
    </div>
  );
};

const MaintenanceModule = () => {
  const { canisters, setCanisters } = useContext(AppContext);

  const toggleAgitator = (id) => {
    setCanisters(prev => prev.map(c => c.id === id ? { ...c, agitator: !c.agitator } : c));
    // Future Hardware logic: sendCommand('TOGGLE_AGITATOR', id)
  };

  const handlePump = (id, state) => {
    setCanisters(prev => prev.map(c => c.id === id ? { ...c, pump: state } : c));
  };

  const resetAll = () => {
    setCanisters(prev => prev.map(c => ({ ...c, agitator: false, valve: false, pump: 'OFF' })));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Wrench size={24} className="text-blue-500" />
          Component Control Center
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" icon={RefreshCw}>Nozzle Cleaning</Button>
          <Button variant="danger" icon={RefreshCw} onClick={resetAll}>Emergency Stop / Reset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {canisters.map(canister => (
          <Card key={canister.id} className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full border border-[#444]" style={{ backgroundColor: canister.color }} />
              <div>
                <h4 className="font-bold text-gray-200">{canister.code}</h4>
                <p className="text-[10px] text-gray-500 uppercase">Slot {canister.id}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Agitator</span>
                <Button 
                  variant={canister.agitator ? 'success' : 'secondary'} 
                  className="px-2 py-1 text-[10px]"
                  onClick={() => toggleAgitator(canister.id)}
                >
                  {canister.agitator ? 'RUNNING' : 'STOPPED'}
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Valve</span>
                <div className="flex rounded overflow-hidden border border-[#444]">
                  <button className="bg-emerald-600 px-2 py-1 text-[10px] text-white">OPEN</button>
                  <button className="bg-[#222] px-2 py-1 text-[10px] text-gray-400">CLOSE</button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-400">Manual Pump Control</span>
                <div className="grid grid-cols-3 gap-1">
                  <Button 
                    variant={canister.pump === 'UP' ? 'primary' : 'secondary'} 
                    className="p-1 text-[10px]"
                    onClick={() => handlePump(canister.id, 'UP')}
                  >UP</Button>
                  <Button 
                    variant={canister.pump === 'OFF' ? 'danger' : 'secondary'} 
                    className="p-1 text-[10px]"
                    onClick={() => handlePump(canister.id, 'OFF')}
                  >OFF</Button>
                  <Button 
                    variant={canister.pump === 'DOWN' ? 'primary' : 'secondary'} 
                    className="p-1 text-[10px]"
                    onClick={() => handlePump(canister.id, 'DOWN')}
                  >DN</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const FillColorantsModule = () => {
  const { canisters, setCanisters, config } = useContext(AppContext);
  const [quantities, setQuantities] = useState({});

  const handleUpdateLevel = (id, delta) => {
    setCanisters(prev => prev.map(c => {
      if (c.id === id) {
        const newLevel = Math.min(config.maxLevel, Math.max(0, c.level + delta));
        return { ...c, level: newLevel };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#222] p-4 rounded-lg border border-[#333]">
        <div className="flex gap-4">
          <Button variant="secondary" icon={Filter}>Filter Low Stock</Button>
          <Button variant="secondary" icon={Download}>Export to Excel</Button>
        </div>
        <div className="text-xs text-gray-500">
          Max Canister Capacity: <span className="text-blue-400 font-bold">{config.maxLevel} ml</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 uppercase text-[10px] border-b border-[#333]">
                  <th className="pb-3 px-4">Canister</th>
                  <th className="pb-3 px-4">Current Level</th>
                  <th className="pb-3 px-4">Capacity Status</th>
                  <th className="pb-3 px-4">Add (ml)</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {canisters.map(c => {
                  const pct = (c.level / config.maxLevel) * 100;
                  const isLow = c.level < config.reserveLevel;
                  return (
                    <tr key={c.id} className="border-b border-[#2a2a2a] group hover:bg-[#333]/30 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm border border-[#444]" style={{ backgroundColor: c.color }} />
                        <span className="font-bold text-gray-300">{c.code}</span>
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-400">{c.level} ml</td>
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="h-2 bg-[#111] rounded-full overflow-hidden w-full flex">
                          <div 
                            className={`h-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-blue-600'}`} 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="number"
                          placeholder="0.0"
                          className="bg-[#1a1a1a] border border-[#444] rounded w-24 px-2 py-1 text-xs"
                          value={quantities[c.id] || ''}
                          onChange={e => setQuantities({...quantities, [c.id]: e.target.value})}
                        />
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Button 
                          variant="secondary" 
                          className="px-2 py-1 text-[10px]"
                          onClick={() => handleUpdateLevel(c.id, -parseFloat(quantities[c.id] || 0))}
                        >-</Button>
                        <Button 
                          variant="success" 
                          className="px-2 py-1 text-[10px]"
                          onClick={() => handleUpdateLevel(c.id, parseFloat(quantities[c.id] || 0))}
                        >+</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ShadeSearchModule = () => {
  const [activeTab, setActiveTab] = useState('STANDARD'); // STANDARD, CUSTOM, HISTORY
  
  const mockResults = [
    { code: '9001', name: 'Almond White', product: 'Silk Emulsion', date: '2023-11-20' },
    { code: '2214', name: 'Azure Mist', product: 'Soft Gloss', date: '2023-11-21' },
    { code: 'RAL 7016', name: 'Anthracite Grey', product: 'Exterior Satin', date: '2023-11-22' },
    { code: '3305', name: 'Crimson Tide', product: 'High Gloss', date: '2023-11-22' },
    { code: '4009', name: 'Forest Path', product: 'Silk Emulsion', date: '2023-11-23' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Search Modes">
          <div className="flex flex-col gap-2 mt-2">
            {['STANDARD', 'CUSTOM', 'HISTORY'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-3 rounded text-sm font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#222] text-gray-500 hover:bg-[#333]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Filters">
          <div className="space-y-4 mt-2">
            <Input label="Product" placeholder="Select Product Line..." />
            <Input label="Shade Name" placeholder="e.g. Ocean Blue" />
            <Input label="Shade Code" placeholder="e.g. RAL 5015" />
            <Input label="Date Range" type="date" />
            <Button className="w-full" icon={Search}>Execute Search</Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card title={`Results - ${activeTab} DATABASE`}>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#333]">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Shade Name</th>
                  <th className="py-3 px-4">Product Line</th>
                  <th className="py-3 px-4">Last Used</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockResults.map((res, i) => (
                  <tr key={i} className="border-b border-[#2a2a2a] hover:bg-[#333]/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-blue-400">{res.code}</td>
                    <td className="py-4 px-4 text-gray-300">{res.name}</td>
                    <td className="py-4 px-4 text-gray-400">{res.product}</td>
                    <td className="py-4 px-4 text-gray-500">{res.date}</td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" className="text-blue-400 hover:text-blue-300">Load Formula</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const CreateShadeModule = () => {
  const { canisters } = useContext(AppContext);
  const [formula, setFormula] = useState({});

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Target Identity" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Input label="Product Name" placeholder="Ex: Premium Gloss" />
            <Input label="Shade Name" placeholder="Ex: Summer Sunset" />
            <Input label="Shade Code" placeholder="Ex: SS-101" />
            <Input label="Pack Size (ml)" type="number" placeholder="1000" />
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Base Type Selection</label>
              <select className="bg-[#1a1a1a] border border-[#444] text-gray-200 rounded px-3 py-2 text-sm">
                <option>White Base (01)</option>
                <option>Deep Base (02)</option>
                <option>Clear Base (03)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="Summary Controls">
          <div className="space-y-4 mt-2">
            <div className="bg-[#111] p-3 rounded border border-[#333]">
              <p className="text-[10px] text-gray-500 uppercase">Total Colorant Volume</p>
              <p className="text-2xl font-mono text-emerald-400">
                {Object.values(formula).reduce((a, b) => a + (parseFloat(b) || 0), 0).toFixed(2)} ml
              </p>
            </div>
            <Button className="w-full h-12 text-lg" variant="success" icon={Activity} disabled>Start Dispense</Button>
            <Button className="w-full" variant="secondary" icon={Save}>Save Template</Button>
            <Button className="w-full" variant="ghost" onClick={() => setFormula({})}>Clear All Inputs</Button>
          </div>
        </Card>
      </div>

      <Card title="Colorant Formulation (ml per Canister)">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-2">
          {canisters.map(c => (
            <div key={c.id} className="bg-[#222] p-2 rounded border border-[#333] hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] font-bold text-gray-400">{c.code}</span>
              </div>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-white text-center focus:border-blue-500"
                value={formula[c.id] || ''}
                onChange={e => setFormula({...formula, [c.id]: e.target.value})}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- Main Layout ---

const MainLayout = () => {
  const { user, logout, currentScreen, setCurrentScreen, machineStatus } = useContext(AppContext);

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
    { id: 'SEARCH', label: 'Shade Search', icon: Search },
    { id: 'FILL', label: 'Fill Colorants', icon: Droplet },
    { id: 'MAINTENANCE', label: 'Maintenance', icon: Wrench },
    { id: 'CREATE', label: 'Create Shade', icon: PlusSquare },
    { id: 'SETUP', label: 'Setup', icon: Settings },
  ];

  if (!user) return <LoginScreen />;

  const renderScreen = () => {
    switch(currentScreen) {
      case 'DASHBOARD': return <Dashboard />;
      case 'SEARCH': return <ShadeSearchModule />;
      case 'FILL': return <FillColorantsModule />;
      case 'MAINTENANCE': return <MaintenanceModule />;
      case 'CREATE': return <CreateShadeModule />;
      case 'SETUP': return <SetupModule />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Header */}
      <header className="h-14 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between px-6 z-20 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white">v-oem</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentScreen === item.id ? 'bg-[#333] text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-[#252525]'}`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase font-bold leading-none">Authenticated User</span>
            <span className="text-sm text-gray-200 font-semibold">{user.name}</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-[#333] rounded-full text-gray-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-[#121212] custom-scrollbar">
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {navItems.find(n => n.id === currentScreen)?.label}
              <span className="text-gray-600 text-sm font-light">/ Control Terminal</span>
            </h2>
            <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-full border border-[#333]">
              <div className={`w-2 h-2 rounded-full animate-pulse ${machineStatus === 'READY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">System Link: Stable</span>
            </div>
          </div>
          {renderScreen()}
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-[#1a1a1a] border-t border-[#333] px-6 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-600 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Software:</span>
            <span className="text-blue-500">v-oem Control Suite</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Version:</span>
            <span className="text-gray-400">v1.0.4-Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <span>API Bridge:</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={12} /> Connected
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <StatusBadge status={machineStatus} />
          </div>
          <div className="text-gray-700">|</div>
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-blue-500" />
            <span>IO Rate: 42ms</span>
          </div>
        </div>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #121212;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
