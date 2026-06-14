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

export default function ManagerDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [myAllocations, setMyAllocations] = useState<any[]>([]);
  const [applyForm, setApplyForm] = useState({ leaveTypeId: '', reason: '', startDate: '', endDate: '' });
  const [applyMsg, setApplyMsg] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['team', 'mytimeoff']);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'MANAGER') { router.push('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [pending, team, my, alloc, prof] = await Promise.all([
      api.get('/leave/pending'),
      api.get('/leave/reportees'),
      api.get('/leave/my'),
      api.get('/leave/my-allocations'),
      api.get('/users/profile'),
    ]);
    setPendingLeaves(pending.data);
    setTeamLeaves(team.data);
    setMyLeaves(my.data);
    setMyAllocations(alloc.data);
    setProfile(prof.data);
  };

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]);
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

  const applyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leave/apply', { ...applyForm, leaveTypeId: Number(applyForm.leaveTypeId) });
      setApplyMsg('✅ Leave applied successfully!');
      setApplyForm({ leaveTypeId: '', reason: '', startDate: '', endDate: '' });
      fetchAll();
    } catch (err: any) {
      setApplyMsg('❌ ' + (err.response?.data?.message || 'Failed.'));
    }
  };

  const cancelLeave = async (id: number) => {
    if (!confirm('Cancel this leave?')) return;
    try { await api.patch(`/leave/${id}/cancel`); fetchAll(); }
    catch { alert('Cannot cancel'); }
  };

  const logout = () => { localStorage.clear(); router.push('/login'); };
  const days = (leave: any) => Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const menuItems = [
    { key: 'dashboard', label: '🏠 Dashboard' },
    {
      key: 'team', label: '👥 Team Leaves', children: [
        { key: 'pendingApprovals', label: `Pending Approvals ${pendingLeaves.length > 0 ? `(${pendingLeaves.length})` : ''}` },
        { key: 'teamLeaves', label: 'All Team Leaves' },
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-green-900 text-white transition-all duration-300 flex-shrink-0 relative`}>
        <div className="p-4 flex items-center justify-between border-b border-green-700">
          {sidebarOpen && <span className="font-bold text-sm">Leave Management</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-green-300 hover:text-white">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        {sidebarOpen && (
          <div className="p-4 border-b border-green-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-lg">
                {profile?.name?.[0]?.toUpperCase() || 'M'}
              </div>
              <div>
                <p className="font-semibold text-sm">{profile?.name}</p>
                <p className="text-green-300 text-xs">Manager</p>
              </div>
            </div>
          </div>
        )}
        <nav className="p-2">
          {menuItems.map(item => (
            <div key={item.key}>
              {(item as any).children ? (
                <>
                  <button onClick={() => toggleMenu(item.key)}
                    className="w-full text-left px-3 py-2 rounded text-sm font-medium text-green-200 hover:bg-green-700 flex justify-between items-center">
                    <span>{sidebarOpen ? item.label : item.label[0]}</span>
                    {sidebarOpen && <span>{expandedMenus.includes(item.key) ? '▼' : '▶'}</span>}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.key) && (
                    <div className="ml-3 border-l border-green-700 pl-2">
                      {(item as any).children.map((child: any) => (
                        <button key={child.key} onClick={() => setActiveMenu(child.key)}
                          className={`w-full text-left px-3 py-2 rounded text-xs mb-1 ${activeMenu === child.key ? 'bg-white text-green-900 font-bold' : 'text-green-300 hover:bg-green-700'}`}>
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => setActiveMenu(item.key)}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-medium mb-1 ${activeMenu === item.key ? 'bg-white text-green-900 font-bold' : 'text-green-200 hover:bg-green-700'}`}>
                  {sidebarOpen ? item.label : item.label[0]}
                </button>
              )}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 p-4 w-64">
          {sidebarOpen && (
            <button onClick={logout} className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded text-sm font-semibold">
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            {activeMenu === 'dashboard' && '🏠 Dashboard'}
            {activeMenu === 'pendingApprovals' && '⏳ Pending Approvals'}
            {activeMenu === 'teamLeaves' && '📋 All Team Leaves'}
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Pending Approvals', value: pendingLeaves.length, color: 'bg-yellow-500', icon: '⏳' },
                  { label: 'Team Leaves', value: teamLeaves.length, color: 'bg-blue-500', icon: '📋' },
                  { label: 'My Leave Balance', value: myAllocations.reduce((acc, a) => acc + (a.allocatedDays - a.usedDays), 0), color: 'bg-green-500', icon: '💰' },
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
                  <h3 className="font-bold mb-3 text-yellow-700">⏳ Pending Approvals ({pendingLeaves.length})</h3>
                  {pendingLeaves.map(leave => (
                    <div key={leave.id} className="flex items-center justify-between border-b py-2 text-sm">
                      <span><strong>{leave.user?.name}</strong> — {leave.leaveType?.name} ({days(leave)} days)</span>
                      <div className="flex gap-2">
                        <button onClick={() => approveLeave(leave.id)} className="bg-green-500 text-white px-3 py-1 rounded text-xs">✓ Approve</button>
                        <button onClick={() => setRejectingId(leave.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs">✗ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                              <input type="text" placeholder="Rejection reason" value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)} className="border p-1 rounded text-xs w-full" />
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

          {/* Team Leaves */}
          {activeMenu === 'teamLeaves' && (
            <div className="bg-white rounded-lg shadow p-6">
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
                  {teamLeaves.map(leave => (
                    <tr key={leave.id} className="border-t">
                      <td className="p-3 font-medium">{leave.user?.name}</td>
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
          )}

          {/* My Balance */}
          {activeMenu === 'myBalance' && (
            <div>
              {myAllocations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  <p className="text-5xl mb-3">📭</p>
                  <p>No leave balance allocated. Contact admin.</p>
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
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min((alloc.usedDays / alloc.allocatedDays) * 100, 100)}%` }} />
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
                  <p>No leave balance. Contact admin.</p>
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
                  <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold">
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
                            <button onClick={() => cancelLeave(leave.id)} className="bg-gray-500 text-white px-3 py-1 rounded text-xs">Cancel</button>
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