'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

const statusColor: any = {
  PENDING_MANAGER: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const statusLabel: any = {
  PENDING_MANAGER: '⏳ Pending Approval',
  APPROVED: '✅ Approved',
  REJECTED: '❌ Rejected',
  CANCELLED: '🚫 Cancelled',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [myAllocations, setMyAllocations] = useState<any[]>([]);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER', managerId: '' });
  const [userMsg, setUserMsg] = useState('');
  const [newLeaveType, setNewLeaveType] = useState({ name: '', description: '', maxDays: 1 });
  const [leaveTypeMsg, setLeaveTypeMsg] = useState('');
  const [allocForm, setAllocForm] = useState({ userId: '', leaveTypeId: '', allocatedDays: 1 });
  const [allocMsg, setAllocMsg] = useState('');
  const [applyForm, setApplyForm] = useState({ leaveTypeId: '', reason: '', startDate: '', endDate: '' });
  const [applyMsg, setApplyMsg] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['leave', 'employees', 'config', 'mytimeoff']);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'ADMIN') { router.push('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [u, l, lt, alloc, all, prof, myAlloc, myLv, pending] = await Promise.all([
        api.get('/users'),
        api.get('/leave/all'),
        api.get('/leave/types'),
        api.get('/leave/allocations'),
        api.get('/users/all-for-dropdown'),
        api.get('/users/profile'),
        api.get('/leave/my-allocations'),
        api.get('/leave/my'),
        api.get('/leave/pending'),
      ]);
      setUsers(u.data);
      setLeaves(l.data);
      setLeaveTypes(lt.data);
      setAllocations(alloc.data);
      setAllUsers(all.data);
      setProfile(prof.data);
      setMyAllocations(myAlloc.data);
      setMyLeaves(myLv.data);
      setPendingLeaves(pending.data);
    } catch { router.push('/login'); }
  };

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/create', { ...newUser, managerId: newUser.managerId ? Number(newUser.managerId) : undefined });
      setUserMsg('✅ User created successfully!');
      setNewUser({ name: '', email: '', password: '', role: 'USER', managerId: '' });
      fetchAll();
    } catch { setUserMsg('❌ Failed. Email may already exist.'); }
  };

  const deleteUser = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This removes all their data.`)) return;
    try { await api.delete(`/users/${id}`); fetchAll(); }
    catch { alert('Failed to delete'); }
  };

  const createLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leave/type', newLeaveType);
      setLeaveTypeMsg('✅ Leave type created!');
      setNewLeaveType({ name: '', description: '', maxDays: 1 });
      fetchAll();
    } catch { setLeaveTypeMsg('❌ Failed. Name may already exist.'); }
  };

  const allocateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leave/allocate', {
        userId: Number(allocForm.userId),
        leaveTypeId: Number(allocForm.leaveTypeId),
        allocatedDays: Number(allocForm.allocatedDays),
      });
      setAllocMsg('✅ Allocated successfully!');
      setAllocForm({ userId: '', leaveTypeId: '', allocatedDays: 1 });
      fetchAll();
    } catch { setAllocMsg('❌ Failed to allocate.'); }
  };

  const applyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leave/apply', { ...applyForm, leaveTypeId: Number(applyForm.leaveTypeId) });
      setApplyMsg('✅ Leave applied!');
      setApplyForm({ leaveTypeId: '', reason: '', startDate: '', endDate: '' });
      fetchAll();
    } catch (err: any) {
      setApplyMsg('❌ ' + (err.response?.data?.message || 'Failed.'));
    }
  };

  const approveLeave = async (id: number) => {
    try { await api.patch(`/leave/${id}/approve`); fetchAll(); }
    catch { alert('Failed'); }
  };

  const rejectLeave = async (id: number) => {
    try {
      await api.patch(`/leave/${id}/reject`, { rejectedReason: rejectReason });
      setRejectingId(null); setRejectReason(''); fetchAll();
    } catch { alert('Failed'); }
  };

  const logout = () => { localStorage.clear(); router.push('/login'); };

  const days = (leave: any) => Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const menuItems = [
    { key: 'dashboard', label: '🏠 Dashboard', icon: '' },
    {
      key: 'leave', label: '📋 Leave Management', children: [
        { key: 'allLeaves', label: 'All Leaves' },
        { key: 'pendingApprovals', label: `Pending Approvals ${pendingLeaves.length > 0 ? `(${pendingLeaves.length})` : ''}` },
      ]
    },
    {
      key: 'employees', label: '👥 Employees', children: [
        { key: 'users', label: 'Users' },
        { key: 'createUser', label: 'Create User' },
      ]
    },
    {
      key: 'config', label: '⚙️ Leave Configuration', children: [
        { key: 'leaveTypes', label: 'Leave Types' },
        { key: 'createLeaveType', label: 'Create Leave Type' },
        { key: 'allocations', label: 'Allocations' },
        { key: 'allocateLeave', label: 'Allocate Leave' },
      ]
    },
    {
      key: 'mytimeoff', label: '🕐 My Time Off', children: [
        { key: 'myBalance', label: 'My Balance' },
        { key: 'applyLeave', label: 'Apply Leave' },
        { key: 'myLeaves', label: 'My Leaves' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-purple-900 text-white transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-purple-700">
          {sidebarOpen && <span className="font-bold text-sm">Leave Management</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-purple-300 hover:text-white">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Profile */}
        {sidebarOpen && (
          <div className="p-4 border-b border-purple-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-lg">
                {profile?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-semibold text-sm">{profile?.name}</p>
                <p className="text-purple-300 text-xs">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="p-2">
          {menuItems.map(item => (
            <div key={item.key}>
              {item.children ? (
                <>
                  <button onClick={() => toggleMenu(item.key)}
                    className="w-full text-left px-3 py-2 rounded text-sm font-medium text-purple-200 hover:bg-purple-700 flex justify-between items-center">
                    <span>{sidebarOpen ? item.label : item.label[0]}</span>
                    {sidebarOpen && <span>{expandedMenus.includes(item.key) ? '▼' : '▶'}</span>}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.key) && (
                    <div className="ml-3 border-l border-purple-700 pl-2">
                      {item.children.map(child => (
                        <button key={child.key}
                          onClick={() => setActiveMenu(child.key)}
                          className={`w-full text-left px-3 py-2 rounded text-xs mb-1 ${activeMenu === child.key ? 'bg-white text-purple-900 font-bold' : 'text-purple-300 hover:bg-purple-700'}`}>
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => setActiveMenu(item.key)}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-medium mb-1 ${activeMenu === item.key ? 'bg-white text-purple-900 font-bold' : 'text-purple-200 hover:bg-purple-700'}`}>
                  {sidebarOpen ? item.label : item.label[0]}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 p-4 w-64">
          {sidebarOpen && (
            <button onClick={logout} className="w-full bg-purple-700 hover:bg-purple-600 text-white py-2 rounded text-sm font-semibold">
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            {activeMenu === 'dashboard' && '🏠 Dashboard'}
            {activeMenu === 'allLeaves' && '📋 All Leaves'}
            {activeMenu === 'pendingApprovals' && '⏳ Pending Approvals'}
            {activeMenu === 'users' && '👥 Users'}
            {activeMenu === 'createUser' && '➕ Create User'}
            {activeMenu === 'leaveTypes' && '📁 Leave Types'}
            {activeMenu === 'createLeaveType' && '➕ Create Leave Type'}
            {activeMenu === 'allocations' && '📊 Allocations'}
            {activeMenu === 'allocateLeave' && '🎯 Allocate Leave'}
            {activeMenu === 'myBalance' && '💰 My Leave Balance'}
            {activeMenu === 'applyLeave' && '➕ Apply Leave'}
            {activeMenu === 'myLeaves' && '📄 My Leave Requests'}
          </h2>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div className="p-6">

          {/* Dashboard */}
          {activeMenu === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Employees', value: users.length, color: 'bg-blue-500', icon: '👥' },
                  { label: 'Pending Approvals', value: pendingLeaves.length, color: 'bg-yellow-500', icon: '⏳' },
                  { label: 'Approved Leaves', value: leaves.filter(l => l.status === 'APPROVED').length, color: 'bg-green-500', icon: '✅' },
                  { label: 'Leave Types', value: leaveTypes.length, color: 'bg-purple-500', icon: '📁' },
                ].map(card => (
                  <div key={card.label} className={`${card.color} text-white rounded-lg p-4`}>
                    <p className="text-2xl">{card.icon}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-sm opacity-80">{card.label}</p>
                  </div>
                ))}
              </div>

              {pendingLeaves.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-bold mb-3 text-yellow-700">⏳ Requires Your Approval ({pendingLeaves.length})</h3>
                  {pendingLeaves.slice(0, 5).map(leave => (
                    <div key={leave.id} className="flex items-center justify-between border-b py-2 text-sm">
                      <span><strong>{leave.user?.name}</strong> — {leave.leaveType?.name} ({days(leave)} days)</span>
                      <div className="flex gap-2">
                        <button onClick={() => approveLeave(leave.id)} className="bg-green-500 text-white px-3 py-1 rounded text-xs">✓ Approve</button>
                        <button onClick={() => { setRejectingId(leave.id); setActiveMenu('pendingApprovals'); }} className="bg-red-500 text-white px-3 py-1 rounded text-xs">✗ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Leaves */}
          {activeMenu === 'allLeaves' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">From</th>
                    <th className="p-3">To</th>
                    <th className="p-3">Days</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Rejected Reason</th>
                  </tr></thead>
                  <tbody>
                    {leaves.map(leave => (
                      <tr key={leave.id} className="border-t">
                        <td className="p-3 font-medium">{leave.user?.name}
                          <span className={`ml-1 px-1 py-0.5 rounded text-xs ${leave.user?.role === 'MANAGER' ? 'bg-green-100 text-green-700' : leave.user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {leave.user?.role}
                          </span>
                        </td>
                        <td className="p-3">{leave.leaveType?.name}</td>
                        <td className="p-3">{leave.reason}</td>
                        <td className="p-3">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="p-3 font-bold">{days(leave)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor[leave.status] || 'bg-gray-100'}`}>
                            {statusLabel[leave.status] || leave.status}
                          </span>
                        </td>
                        <td className="p-3 text-red-600 text-xs">{leave.rejectedReason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          {activeMenu === 'pendingApprovals' && (
            <div className="bg-white rounded-lg shadow p-6">
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-5xl mb-3">✅</p>
                  <p className="text-lg">No pending approvals!</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">From</th>
                    <th className="p-3">To</th>
                    <th className="p-3">Days</th>
                    <th className="p-3">Action</th>
                  </tr></thead>
                  <tbody>
                    {pendingLeaves.map(leave => (
                      <tr key={leave.id} className="border-t">
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              {leave.user?.name?.[0]}
                            </div>
                            {leave.user?.name}
                          </div>
                        </td>
                        <td className="p-3">{leave.leaveType?.name}</td>
                        <td className="p-3">{leave.reason}</td>
                        <td className="p-3">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="p-3 font-bold">{days(leave)}</td>
                        <td className="p-3">
                          {rejectingId === leave.id ? (
                            <div className="space-y-2">
                              <input type="text" placeholder="Rejection reason"
                                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                className="border p-1 rounded text-xs w-full" />
                              <div className="flex gap-1">
                                <button onClick={() => rejectLeave(leave.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Confirm</button>
                                <button onClick={() => setRejectingId(null)} className="bg-gray-300 px-2 py-1 rounded text-xs">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => approveLeave(leave.id)} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold">✓ Approve</button>
                              <button onClick={() => setRejectingId(leave.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">✗ Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Users */}
          {activeMenu === 'users' && (
            <div className="bg-white rounded-lg shadow p-6">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Reports To</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Action</th>
                </tr></thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500' : user.role === 'MANAGER' ? 'bg-green-500' : 'bg-blue-500'}`}>
                            {user.name[0]}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'MANAGER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">{user.manager?.name || '—'}</td>
                      <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        {user.role !== 'ADMIN' && (
                          <button onClick={() => deleteUser(user.id, user.name)} className="bg-red-500 text-white px-3 py-1 rounded text-xs">🗑️ Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create User */}
          {activeMenu === 'createUser' && (
            <div className="bg-white rounded-lg shadow p-6 max-w-lg">
              {userMsg && <div className={`mb-4 p-3 rounded text-sm ${userMsg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{userMsg}</div>}
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full border p-2 rounded" placeholder="Enter full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email / Username</label>
                  <input type="text" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border p-2 rounded" placeholder="Enter email or username" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full border p-2 rounded" placeholder="Set password" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value, managerId: ''})}
                    className="w-full border p-2 rounded">
                    <option value="USER">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {(newUser.role === 'USER' || newUser.role === 'MANAGER') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Reports To (Manager)</label>
                    <select value={newUser.managerId} onChange={e => setNewUser({...newUser, managerId: e.target.value})}
                      className="w-full border p-2 rounded">
                      <option value="">Select manager (optional)</option>
                      {allUsers.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                )}
                <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-semibold">
                  Create User
                </button>
              </form>
            </div>
          )}

          {/* Leave Types */}
          {activeMenu === 'leaveTypes' && (
            <div className="bg-white rounded-lg shadow p-6">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Max Days/Year</th>
                </tr></thead>
                <tbody>
                  {leaveTypes.map(lt => (
                    <tr key={lt.id} className="border-t">
                      <td className="p-3 font-medium">{lt.name}</td>
                      <td className="p-3 text-gray-500">{lt.description}</td>
                      <td className="p-3 font-bold text-blue-600">{lt.maxDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create Leave Type */}
          {activeMenu === 'createLeaveType' && (
            <div className="bg-white rounded-lg shadow p-6 max-w-lg">
              {leaveTypeMsg && <div className={`mb-4 p-3 rounded text-sm ${leaveTypeMsg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{leaveTypeMsg}</div>}
              <form onSubmit={createLeaveType} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Leave Type Name</label>
                  <input type="text" value={newLeaveType.name} onChange={e => setNewLeaveType({...newLeaveType, name: e.target.value})}
                    className="w-full border p-2 rounded" placeholder="e.g. Sick Leave" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input type="text" value={newLeaveType.description} onChange={e => setNewLeaveType({...newLeaveType, description: e.target.value})}
                    className="w-full border p-2 rounded" placeholder="e.g. Leave due to illness" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Days Per Year</label>
                  <input type="number" min={1} value={newLeaveType.maxDays} onChange={e => setNewLeaveType({...newLeaveType, maxDays: Number(e.target.value)})}
                    className="w-full border p-2 rounded" required />
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-semibold">
                  Create Leave Type
                </button>
              </form>
            </div>
          )}

          {/* Allocations */}
          {activeMenu === 'allocations' && (
            <div className="bg-white rounded-lg shadow p-6">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Leave Type</th>
                  <th className="p-3">Allocated</th>
                  <th className="p-3">Used</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Year</th>
                </tr></thead>
                <tbody>
                  {allocations.map(alloc => (
                    <tr key={alloc.id} className="border-t">
                      <td className="p-3 font-medium">{alloc.user?.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${alloc.user?.role === 'MANAGER' ? 'bg-green-100 text-green-700' : alloc.user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {alloc.user?.role}
                        </span>
                      </td>
                      <td className="p-3">{alloc.leaveType?.name}</td>
                      <td className="p-3">{alloc.allocatedDays}</td>
                      <td className="p-3 text-red-600">{alloc.usedDays}</td>
                      <td className="p-3">
                        <span className={`font-bold ${alloc.allocatedDays - alloc.usedDays > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {alloc.allocatedDays - alloc.usedDays}
                        </span>
                      </td>
                      <td className="p-3">{alloc.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Allocate Leave */}
          {activeMenu === 'allocateLeave' && (
            <div className="bg-white rounded-lg shadow p-6 max-w-lg">
              <p className="text-gray-500 text-sm mb-4">Assign leave balance for {new Date().getFullYear()}.</p>
              {allocMsg && <div className={`mb-4 p-3 rounded text-sm ${allocMsg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{allocMsg}</div>}
              <form onSubmit={allocateLeave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select User</label>
                  <select value={allocForm.userId} onChange={e => setAllocForm({...allocForm, userId: e.target.value})}
                    className="w-full border p-2 rounded" required>
                    <option value="">Choose user...</option>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Leave Type</label>
                  <select value={allocForm.leaveTypeId}
                    onChange={e => {
                      const selected = leaveTypes.find(lt => lt.id === Number(e.target.value));
                      setAllocForm({ ...allocForm, leaveTypeId: e.target.value, allocatedDays: selected?.maxDays || 1 });
                    }}
                    className="w-full border p-2 rounded" required>
                    <option value="">Choose leave type...</option>
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>{lt.name} (max {lt.maxDays} days)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Days</label>
                  <input type="number" min={1}
                    max={leaveTypes.find(lt => lt.id === Number(allocForm.leaveTypeId))?.maxDays || 365}
                    value={allocForm.allocatedDays}
                    onChange={e => setAllocForm({...allocForm, allocatedDays: Number(e.target.value)})}
                    className="w-full border p-2 rounded" required />
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-semibold">
                  Allocate Leave
                </button>
              </form>
            </div>
          )}

          {/* My Balance */}
          {activeMenu === 'myBalance' && (
            <div>
              {myAllocations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  <p className="text-5xl mb-3">📭</p>
                  <p>No leave balance. Go to Allocate Leave and allocate to yourself.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myAllocations.map(alloc => (
                    <div key={alloc.id} className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-700 mb-3">{alloc.leaveType.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Allocated</span><span className="font-semibold">{alloc.allocatedDays} days</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Used</span><span className="font-semibold text-red-600">{alloc.usedDays} days</span></div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold">Remaining</span>
                          <span className={`font-bold text-xl ${alloc.allocatedDays - alloc.usedDays > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {alloc.allocatedDays - alloc.usedDays} days
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min((alloc.usedDays / alloc.allocatedDays) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Apply Leave */}
          {activeMenu === 'applyLeave' && (
            <div className="bg-white rounded-lg shadow p-6 max-w-lg">
              {applyMsg && <div className={`mb-4 p-3 rounded text-sm ${applyMsg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{applyMsg}</div>}
              {myAllocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p>No leave balance. Go to Allocate Leave and allocate to yourself first.</p>
                </div>
              ) : (
                <form onSubmit={applyLeave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Leave Type</label>
                    <select value={applyForm.leaveTypeId} onChange={e => setApplyForm({...applyForm, leaveTypeId: e.target.value})}
                      className="w-full border p-2 rounded" required>
                      <option value="">Select leave type...</option>
                      {myAllocations.map(alloc => (
                        <option key={alloc.leaveTypeId} value={alloc.leaveTypeId}>
                          {alloc.leaveType.name} ({alloc.allocatedDays - alloc.usedDays} days remaining)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <textarea value={applyForm.reason} onChange={e => setApplyForm({...applyForm, reason: e.target.value})}
                      className="w-full border p-2 rounded" rows={3} placeholder="Enter reason" required />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input type="date" value={applyForm.startDate} onChange={e => setApplyForm({...applyForm, startDate: e.target.value})}
                        className="w-full border p-2 rounded" required />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input type="date" value={applyForm.endDate} min={applyForm.startDate} onChange={e => setApplyForm({...applyForm, endDate: e.target.value})}
                        className="w-full border p-2 rounded" required />
                    </div>
                  </div>
                  {applyForm.startDate && applyForm.endDate && (
                    <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
                      📅 Duration: {Math.ceil((new Date(applyForm.endDate).getTime() - new Date(applyForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </div>
                  )}
                  <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-semibold">
                    Submit Leave Request
                  </button>
                </form>
              )}
            </div>
          )}

          {/* My Leaves */}
          {activeMenu === 'myLeaves' && (
            <div className="bg-white rounded-lg shadow p-6">
              {myLeaves.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📄</p>
                  <p>No leave requests yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left">
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">From</th>
                    <th className="p-3">To</th>
                    <th className="p-3">Days</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr></thead>
                  <tbody>
                    {myLeaves.map(leave => (
                      <tr key={leave.id} className="border-t">
                        <td className="p-3">{leave.leaveType?.name}</td>
                        <td className="p-3">{leave.reason}</td>
                        <td className="p-3">{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td className="p-3 font-bold">{days(leave)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor[leave.status] || 'bg-gray-100'}`}>
                            {statusLabel[leave.status] || leave.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {leave.status === 'PENDING_MANAGER' && (
                            <button onClick={() => approveLeave(leave.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs">
                              Self Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}