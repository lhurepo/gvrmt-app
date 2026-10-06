import { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { useTheme } from './ThemeContext';
import { format, isAfter, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { Home, Calendar, User, ClipboardList, LogOut, Settings, Users, Building2, Megaphone, Clock, Menu, X, Search, Filter, ChevronDown, ChevronUp, MapPin, Plus, Trash2, Sun, Moon, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import type { Session, AttendanceStatus } from './types';
import { AdminSchedule } from './pages/AdminSchedule';
import { getLevelColor } from './utils/levelColors';

// ============ SAFE IMAGE COMPONENT ============
// Handles image load failures gracefully - prevents broken UI when external images fail
function SafeImage({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  if (failed || !src) return null;
  
  return (
    <>
      {!loaded && (
        <div className={className} style={{ ...style, background: 'linear-gradient(135deg, var(--color-purple-deep), var(--color-accent))' }} />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, display: loaded ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}

// ============ LEVEL BADGE COMPONENT ============
function LevelBadge({ level, className = '' }: { level?: Session['level']; className?: string }) {
  if (!level) return null;
  const colors = getLevelColor(level);
  
  return (
    <span 
      className={`inline-block text-xs font-semibold px-2 py-1 rounded-full border-l-2 ${className}`}
      style={{ 
        backgroundColor: colors.bg, 
        color: colors.text,
        borderLeftColor: colors.border
      }}
    >
      {colors.label}
    </span>
  );
}

// ============ LAYOUT ============
function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!currentUser) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const getProfilePath = () => {
    switch (currentUser.role) {
      case 'DANCER': return '/profile';
      case 'INSTRUCTOR': return '/instructor/settings';
      case 'ADMIN': return '/admin/settings';
      default: return '/profile';
    }
  };

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'DANCER': return [
        { section: 'Main', items: [{ path: '/dashboard', label: 'Dashboard', icon: Home }, { path: '/calendar', label: 'Calendar', icon: Calendar }] },
        { section: 'Classes', items: [{ path: '/sessions', label: 'Browse Classes', icon: Calendar }, { path: '/my-schedule', label: 'My Schedule', icon: Clock }, { path: '/attendance', label: 'Attendance', icon: ClipboardList }] },
        { section: 'Account', items: [{ path: '/profile', label: 'Profile', icon: User }, { path: '/settings', label: 'Settings', icon: Settings }] },
      ];
      case 'INSTRUCTOR': return [
        { section: 'Main', items: [{ path: '/instructor', label: 'Dashboard', icon: Home }, { path: '/instructor/calendar', label: 'Calendar', icon: Calendar }] },
        { section: 'Teaching', items: [{ path: '/instructor/sessions', label: 'My Sessions', icon: Calendar }, { path: '/instructor/sessions/new', label: 'Create Session', icon: Calendar }, { path: '/instructor/availability', label: 'Availability', icon: Clock }] },
        { section: 'Account', items: [{ path: '/instructor/settings', label: 'Settings', icon: Settings }] },
      ];
      case 'ADMIN': return [
        { section: 'Main', items: [{ path: '/admin', label: 'Dashboard', icon: Home }, { path: '/admin/schedule', label: 'Schedule', icon: Calendar }] },
        { section: 'Management', items: [{ path: '/admin/sessions', label: 'Sessions', icon: Calendar }, { path: '/admin/dancers', label: 'Dancers', icon: Users }, { path: '/admin/instructors', label: 'Instructors', icon: Users }, { path: '/admin/rooms', label: 'Rooms', icon: Building2 }, { path: '/admin/announcements', label: 'Announcements', icon: Megaphone }] },
        { section: 'Account', items: [{ path: '/admin/settings', label: 'Settings', icon: Settings }] },
      ];
      default: return [];
    }
  };

  const navSections = getNavItems();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 z-20 lg:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed h-full z-30 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'}`} style={{ backgroundColor: 'var(--color-bg-secondary)', borderRight: sidebarOpen ? '1px solid var(--color-border)' : 'none', overflow: 'hidden' }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', minHeight: '73px' }}>
          {sidebarOpen && <div><h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>GRVMNT</h1><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Productions</p></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            {sidebarOpen ? <X size={20} style={{ color: 'var(--color-text-secondary)' }} /> : <Menu size={20} style={{ color: 'var(--color-text-secondary)' }} />}
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {sidebarOpen ? (
            <div className="space-y-6">
              {navSections.map((section, idx) => (
                <div key={idx}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-4" style={{ color: 'var(--color-text-muted)' }}>{section.section}</p>
                  <div className="space-y-1">
                    {section.items.map(item => {
                      const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                      return (
                        <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: isActive ? 'var(--color-accent)' : 'transparent', color: isActive ? 'white' : 'var(--color-text-secondary)' }}>
                          <item.icon size={18} />{item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {navSections.flatMap(s => s.items).map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                return (
                  <Link key={item.path} to={item.path} className="flex items-center justify-center p-3 rounded-lg transition-colors" style={{ backgroundColor: isActive ? 'var(--color-accent)' : 'transparent', color: isActive ? 'white' : 'var(--color-text-secondary)' }} title={item.label}>
                    <item.icon size={20} />
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {sidebarOpen ? (
            <>
              <Link to={getProfilePath()} className="flex items-center gap-3 px-4 py-2 mb-2 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: currentUser.avatar || 'var(--color-accent)' }}>{currentUser.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{currentUser.name}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{currentUser.role}</p></div>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full transition-colors" style={{ color: 'var(--color-text-muted)' }}><LogOut size={18} />Sign Out</button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to={getProfilePath()} className="flex items-center justify-center p-3 rounded-lg"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: currentUser.avatar || 'var(--color-accent)' }}>{currentUser.name.charAt(0)}</div></Link>
              <button onClick={handleLogout} className="flex items-center justify-center p-3 rounded-lg w-full" style={{ color: 'var(--color-text-muted)' }}><LogOut size={18} /></button>
            </div>
          )}
        </div>
      </aside>
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'lg:ml-20'}`}>
        <div className="lg:hidden p-4 flex items-center gap-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}><Menu size={20} style={{ color: 'var(--color-text-secondary)' }} /></button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>GRVMNT</h1>
        </div>
        <main className="flex-1 p-8"><div className="max-w-6xl mx-auto fade-in">{children}</div></main>
      </div>
    </div>
  );
}

// ============ SESSION FILTERS ============
type SortField = 'startsAt' | 'title' | 'danceStyle' | 'capacity';
type SortOrder = 'asc' | 'desc';

function useSessionFilters(sessions: Session[]) {
  const { rooms, users } = useApp();
  const [search, setSearch] = useState('');
  const [danceStyle, setDanceStyle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [sortField, setSortField] = useState<SortField>('startsAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const danceStyles = [...new Set(sessions.map(s => s.danceStyle))].sort();
  const instructors = users.filter(u => u.role === 'INSTRUCTOR' && u.isActive);
  const activeRooms = rooms.filter(r => r.isActive);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Use useMemo for derived state - this fixes the loading bug!
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s => s.title.toLowerCase().includes(searchLower) || s.danceStyle.toLowerCase().includes(searchLower) || s.description?.toLowerCase().includes(searchLower));
    }
    if (danceStyle) filtered = filtered.filter(s => s.danceStyle === danceStyle);
    if (dayOfWeek) filtered = filtered.filter(s => days[new Date(s.startsAt).getDay()] === dayOfWeek);
    if (instructor) filtered = filtered.filter(s => s.instructorId === instructor);
    if (room) filtered = filtered.filter(s => s.roomId === room);
    if (timeOfDay) {
      filtered = filtered.filter(s => {
        const hour = new Date(s.startsAt).getHours();
        if (timeOfDay === 'morning') return hour >= 6 && hour < 12;
        if (timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
        if (timeOfDay === 'evening') return hour >= 17 && hour < 21;
        if (timeOfDay === 'night') return hour >= 21 || hour < 6;
        return true;
      });
    }
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'startsAt') comparison = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      else if (sortField === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortField === 'danceStyle') comparison = a.danceStyle.localeCompare(b.danceStyle);
      else if (sortField === 'capacity') comparison = a.capacity - b.capacity;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [sessions, search, danceStyle, dayOfWeek, instructor, room, timeOfDay, sortField, sortOrder, days]);

  const hasActiveFilters = search || danceStyle || dayOfWeek || instructor || room || timeOfDay;
  const clearFilters = () => { setSearch(''); setDanceStyle(''); setDayOfWeek(''); setInstructor(''); setRoom(''); setTimeOfDay(''); setSortField('startsAt'); setSortOrder('asc'); };

  const FilterUI = () => (
    <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-text-muted)' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classes..." className="w-full pl-10 pr-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: showFilters ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: showFilters ? 'white' : 'var(--color-text-secondary)' }}>
          <Filter size={16} />Filters{hasActiveFilters && <span className="ml-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--color-error)', color: 'white' }}>!</span>}
        </button>
      </div>
      {showFilters && (
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Dance Style</label><select value={danceStyle} onChange={(e) => setDanceStyle(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="">All Styles</option>{danceStyles.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Day of Week</label><select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="">All Days</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Time of Day</label><select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="">Any Time</option><option value="morning">Morning (6am-12pm)</option><option value="afternoon">Afternoon (12pm-5pm)</option><option value="evening">Evening (5pm-9pm)</option><option value="night">Night (9pm-6am)</option></select></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Instructor</label><select value={instructor} onChange={(e) => setInstructor(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="">All Instructors</option>{instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Room</label><select value={room} onChange={(e) => setRoom(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="">All Rooms</option>{activeRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Sort By</label><div className="flex gap-2"><select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)} className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="startsAt">Date & Time</option><option value="title">Title</option><option value="danceStyle">Dance Style</option><option value="capacity">Capacity</option></select><button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button></div></div>
          </div>
          {hasActiveFilters && <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}><X size={16} />Clear All Filters</button>}
        </div>
      )}
    </div>
  );

  return { filteredSessions, FilterUI };
}

// ============ CALENDAR VIEW ============
export function CalendarView({ sessions: propSessions, linkPrefix = '/sessions' }: { sessions?: Session[]; linkPrefix?: string }) {
  const { sessions: allSessions, rooms, users } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const displaySessions = propSessions || allSessions;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);
  const getSessionsForDay = (date: Date) => displaySessions.filter(s => isSameDay(new Date(s.startsAt), date) && s.status !== 'CANCELLED');
  const selectedDaySessions = selectedDate ? getSessionsForDay(selectedDate) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}><ChevronUp size={20} style={{ color: 'var(--color-text-secondary)', transform: 'rotate(-90deg)' }} /></button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>Today</button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}><ChevronUp size={20} style={{ color: 'var(--color-text-secondary)', transform: 'rotate(90deg)' }} /></button>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="grid grid-cols-7" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-3 text-center text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{day}</div>)}</div>
        <div className="grid grid-cols-7" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {emptyDays.map((_, i) => <div key={`empty-${i}`} className="min-h-[100px] p-2" style={{ borderBottom: '1px solid var(--color-border-light)', borderRight: '1px solid var(--color-border-light)' }} />)}
          {daysInMonth.map(day => {
            const daySessions = getSessionsForDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            return (
              <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className="min-h-[100px] p-2 cursor-pointer transition-colors" style={{ borderBottom: '1px solid var(--color-border-light)', borderRight: '1px solid var(--color-border-light)', backgroundColor: isSelected ? 'var(--color-purple-light)' : 'transparent' }}>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{format(day, 'd')}</div>
                <div className="space-y-1">{daySessions.slice(0, 2).map(session => { const levelColor = getLevelColor(session.level); return (<div key={session.id} className="text-xs px-2 py-1 rounded truncate border-l-2" style={{ backgroundColor: levelColor.bg, color: levelColor.text, borderLeftColor: levelColor.border }}>{format(new Date(session.startsAt), 'h:mm')} {session.title}</div>); })}{daySessions.length > 2 && <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+{daySessions.length - 2} more</div>}</div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="mt-6 rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
          {selectedDaySessions.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No classes scheduled.</p> : (
            <div className="space-y-3">{selectedDaySessions.map(session => { const room = rooms.find(r => r.id === session.roomId); const instructor = users.find(u => u.id === session.instructorId); return (<Link key={session.id} to={`${linkPrefix}/${session.id}`} className="block p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-light)' }}><p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{session.title}</p><div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}><span className="flex items-center gap-1"><Clock size={14} />{format(new Date(session.startsAt), 'h:mm a')}</span>{room && <span className="flex items-center gap-1"><MapPin size={14} />{room.name}</span>}{instructor && <span className="flex items-center gap-1"><Users size={14} />{instructor.name}</span>}</div></Link>); })}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ LOGIN ============
function Login() {
  const { login, users } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedEmail, setSelectedEmail] = useState('');
  const [error, setError] = useState('');
  const activeUsers = users.filter(u => u.isActive);

  const handleLogin = () => {
    if (!selectedEmail) { setError('Please select an account'); return; }
    const success = login(selectedEmail);
    if (success) {
      const user = users.find(u => u.email === selectedEmail);
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'INSTRUCTOR') navigate('/instructor');
      else navigate('/dashboard');
    } else setError('Login failed.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme === 'light' ? '#ffffff' : 'var(--color-purple-darkest)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4"><button onClick={toggleTheme} className="p-2 rounded-lg" style={{ backgroundColor: theme === 'light' ? 'var(--color-bg-tertiary)' : 'var(--color-purple-dark)', color: 'var(--color-text-muted)' }}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button></div>
        <div className="text-center mb-8"><h1 className="text-4xl font-bold tracking-tight" style={{ color: theme === 'light' ? 'var(--color-purple-deep)' : 'var(--color-purple-light)' }}>GRVMNT</h1><p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>Productions</p><p className="text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>Dance Scheduling & Attendance</p></div>
        <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Sign In</h2>
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Select your account (demo)</label>
            {activeUsers.map(user => (
              <button key={user.id} onClick={() => { setSelectedEmail(user.email); setError(''); }} className="w-full text-left px-4 py-3 rounded-lg border-2 transition-all" style={{ borderColor: selectedEmail === user.email ? 'var(--color-accent)' : 'var(--color-border)', backgroundColor: selectedEmail === user.email ? 'var(--color-purple-light)' : 'transparent' }}>
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: user.avatar || 'var(--color-accent)' }}>{user.name.charAt(0)}</div><div><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{user.name}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.email} • {user.role}</p></div></div>
              </button>
            ))}
          </div>
          {error && <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>}
          <button onClick={handleLogin} disabled={!selectedEmail} className="w-full py-3 px-4 text-white font-semibold rounded-lg disabled:opacity-50" style={{ backgroundColor: selectedEmail ? 'var(--color-accent)' : 'var(--color-border)' }}>Sign In</button>
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}><p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>Demo accounts • No password required</p></div>
        </div>
        <div className="text-center mt-6"><Link to="/kiosk/setup" className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Kiosk Setup →</Link></div>
      </div>
    </div>
  );
}

// ============ DANCER PAGES ============
function DancerDashboard() {
  const { currentUser, sessions, rooms, registrations, announcements, getDancerAttendance } = useApp();
  if (!currentUser) return null;
  const myRegistrations = registrations.filter(r => r.dancerId === currentUser.id && r.status === 'REGISTERED');
  const myAttendance = getDancerAttendance(currentUser.id);
  const upcomingSessions = myRegistrations.map(r => sessions.find(s => s.id === r.sessionId)).filter((s): s is NonNullable<typeof s> => !!s && s.status === 'SCHEDULED' && isAfter(new Date(s.startsAt), new Date())).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const nextClass = upcomingSessions[0];
  const myAnnouncements = announcements.filter(a => a.audience === 'ALL' || a.audience === 'DANCERS');

  return (
    <div>
      <div className="rounded-2xl p-8 mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-purple-deep), var(--color-accent))' }}>
        <div className="relative z-10"><h1 className="text-3xl font-bold text-white">Hello, {currentUser.name.split(' ')[0]} 👋</h1><p className="text-white/80 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }} />
      </div>
      {nextClass && (
        <div className="rounded-2xl overflow-hidden text-white mb-8 relative" style={{ minHeight: '200px' }}>
          {nextClass.image ? <><SafeImage src={nextClass.image} alt={nextClass.title} className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" /></> : <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--color-purple-deep), var(--color-accent))' }} />}
          <div className="relative p-6"><p className="text-sm font-medium opacity-80">NEXT CLASS</p><h2 className="text-2xl font-bold mt-1">{nextClass.title}</h2><div className="flex items-center gap-4 mt-3 text-sm opacity-90"><span className="flex items-center gap-1"><Clock size={14} />{format(new Date(nextClass.startsAt), 'h:mm a')}</span><span className="flex items-center gap-1"><MapPin size={14} />{rooms.find(r => r.id === nextClass.roomId)?.name}</span></div><Link to={`/sessions/${nextClass.id}`} className="inline-block mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">View Details →</Link></div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{myRegistrations.length}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Registered</p></div>
        <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{myAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Attended</p></div>
        <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><p className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>{upcomingSessions.length}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Upcoming</p></div>
      </div>
    </div>
  );
}

function DancerSessions() {
  const { sessions, rooms, users, getRegistrationCount } = useApp();
  const availableSessions = useMemo(() => sessions.filter(s => s.status === 'SCHEDULED' && isAfter(new Date(s.startsAt), new Date())), [sessions]);
  const { filteredSessions, FilterUI } = useSessionFilters(availableSessions);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Classes</h1>
      <FilterUI />
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12"><Calendar className="mx-auto mb-4" size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} /><p style={{ color: 'var(--color-text-muted)' }}>No classes found matching your filters.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.map(session => {
            const room = rooms.find(r => r.id === session.roomId);
            const instructor = users.find(u => u.id === session.instructorId);
            const registered = getRegistrationCount(session.id);
            const spotsLeft = session.capacity - registered;
            const isAlmostFull = spotsLeft <= 3;
            return (
              <Link key={session.id} to={`/sessions/${session.id}`} className="group rounded-xl overflow-hidden hover:shadow-lg transition-all" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                {session.image && <div className="relative h-48 overflow-hidden"><SafeImage src={session.image} alt={session.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute bottom-4 left-4 flex gap-2"><span className="inline-block text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{session.danceStyle}</span><LevelBadge level={session.level} /></div>{isAlmostFull && <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-error)', color: 'white' }}>Almost Full!</div>}</div>}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{session.title}</h3>
                    {!session.image && <LevelBadge level={session.level} />}
                  </div>
                  <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <div className="flex items-center gap-2"><Calendar size={14} style={{ color: 'var(--color-accent)' }} /><span>{format(new Date(session.startsAt), 'EEEE, MMMM d')}</span></div>
                    <div className="flex items-center gap-2"><Clock size={14} style={{ color: 'var(--color-accent)' }} /><span>{format(new Date(session.startsAt), 'h:mm a')} – {format(new Date(session.endsAt), 'h:mm a')}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={14} style={{ color: 'var(--color-accent)' }} /><span>{room?.name}</span></div>
                    <div className="flex items-center gap-2"><Users size={14} style={{ color: 'var(--color-accent)' }} /><span>{instructor?.name}</span></div>
                  </div>
                  <div className="mt-4"><div className="flex items-center justify-between text-xs mb-1"><span style={{ color: 'var(--color-text-muted)' }}>{registered} registered</span><span style={{ color: isAlmostFull ? 'var(--color-error)' : 'var(--color-text-muted)' }}>{spotsLeft} spots left</span></div><div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}><div className="h-2 rounded-full transition-all" style={{ width: `${(registered / session.capacity) * 100}%`, backgroundColor: isAlmostFull ? 'var(--color-error)' : 'var(--color-accent)' }} /></div></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DancerSessionDetail() {
  const { sessionId } = useParams();
  const { sessions, rooms, users, currentUser, registerDancer, cancelRegistration, registrations, getRegistrationCount } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const session = sessions.find(s => s.id === sessionId);
  const room = session ? rooms.find(r => r.id === session.roomId) : null;
  const instructor = session ? users.find(u => u.id === session.instructorId) : null;
  const registered = session ? getRegistrationCount(session.id) : 0;
  if (!session || !currentUser) return <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>Session not found.</div>;
  const isRegistered = registrations.some(r => r.sessionId === session.id && r.dancerId === currentUser.id && r.status === 'REGISTERED');

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm mb-4 inline-block" style={{ color: 'var(--color-text-muted)' }}>← Back</button>
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        {session.image && <div className="relative h-64 md:h-80"><SafeImage src={session.image} alt={session.title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" /><div className="absolute bottom-6 left-6 right-6"><div className="flex gap-2 mb-3"><span className="inline-block text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{session.danceStyle}</span><LevelBadge level={session.level} /></div><h1 className="text-3xl md:text-4xl font-bold text-white">{session.title}</h1></div></div>}
        <div className="p-8">
          {!session.image && <><div className="flex items-center gap-2"><span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{session.danceStyle}</span><LevelBadge level={session.level} /></div><h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--color-text-primary)' }}>{session.title}</h1></>}
          <div className="grid grid-cols-2 gap-4 mt-6" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex items-center gap-2"><Calendar size={18} />{format(new Date(session.startsAt), 'EEEE, MMMM d, yyyy')}</div>
            <div className="flex items-center gap-2"><Clock size={18} />{format(new Date(session.startsAt), 'h:mm a')} – {format(new Date(session.endsAt), 'h:mm a')}</div>
            <div className="flex items-center gap-2"><MapPin size={18} />{room?.name}</div>
            <div className="flex items-center gap-2"><Users size={18} />{instructor?.name}</div>
          </div>
          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex items-center justify-between"><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Capacity</span><span className="font-semibold">{registered} / {session.capacity}</span></div>
            <div className="mt-2 w-full rounded-full h-2" style={{ backgroundColor: 'var(--color-border)' }}><div className="h-2 rounded-full transition-all" style={{ width: `${(registered / session.capacity) * 100}%`, backgroundColor: 'var(--color-accent)' }} /></div>
          </div>
          {message && <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: message.includes('Successfully') ? 'var(--color-success)' : 'var(--color-error)', color: 'white', opacity: 0.9 }}>{message}</div>}
          <div className="mt-6">
            {session.status !== 'SCHEDULED' ? <p style={{ color: 'var(--color-text-muted)' }}>This session is no longer available.</p> : isRegistered ? (
              <div className="flex items-center gap-4"><div className="flex items-center gap-2" style={{ color: 'var(--color-success)' }}><Check size={20} /> Registered</div><button onClick={() => { cancelRegistration(currentUser.id, session.id); setMessage('Registration cancelled.'); setTimeout(() => setMessage(''), 3000); }} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--color-error)', color: 'var(--color-error)' }}>Cancel</button></div>
            ) : (
              <button onClick={() => { const result = registerDancer(currentUser.id, session.id); setMessage(result.message); if (!result.success) setTimeout(() => setMessage(''), 3000); }} disabled={registered >= session.capacity} className="px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--color-accent)' }}>{registered >= session.capacity ? 'Class Full' : 'Register'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DancerMySchedule() {
  const { currentUser, sessions, rooms, registrations } = useApp();
  if (!currentUser) return null;
  const myRegistrations = registrations.filter(r => r.dancerId === currentUser.id && r.status === 'REGISTERED');
  const mySessions = myRegistrations.map(r => ({ ...sessions.find(s => s.id === r.sessionId)!, registration: r })).filter(s => s.id).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>My Schedule</h1>
      {mySessions.length === 0 ? (<div className="text-center py-12"><Calendar className="mx-auto mb-4" size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} /><p style={{ color: 'var(--color-text-muted)' }}>No classes registered yet.</p><Link to="/sessions" className="mt-2 inline-block" style={{ color: 'var(--color-accent)' }}>Browse classes →</Link></div>) : (
        <div className="space-y-3">{mySessions.map(({ id, title, startsAt, endsAt, roomId, status, danceStyle, level }) => (<Link key={id} to={`/sessions/${id}`} className="block rounded-xl p-5 transition-all" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{danceStyle}</span><LevelBadge level={level} /></div><h3 className="font-semibold mt-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3><p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{format(new Date(startsAt), 'EEEE, MMMM d')} • {format(new Date(startsAt), 'h:mm a')} – {format(new Date(endsAt), 'h:mm a')}</p><p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{rooms.find(r => r.id === roomId)?.name}</p></div><span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: status === 'SCHEDULED' ? 'var(--color-success)' : 'var(--color-text-muted)', color: 'white', opacity: 0.9 }}>{status}</span></div></Link>))}</div>
      )}
    </div>
  );
}

function DancerAttendance() {
  const { currentUser, sessions, getDancerAttendance } = useApp();
  if (!currentUser) return null;
  const myAttendance = getDancerAttendance(currentUser.id);
  const attendanceWithSessions = myAttendance.map(a => ({ ...a, session: sessions.find(s => s.id === a.sessionId) })).filter(a => a.session).sort((a, b) => new Date(b.session!.startsAt).getTime() - new Date(a.session!.startsAt).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>My Attendance</h1>
      {attendanceWithSessions.length === 0 ? (<div className="text-center py-12"><Check className="mx-auto mb-4" size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} /><p style={{ color: 'var(--color-text-muted)' }}>No attendance records yet.</p></div>) : (
        <div className="space-y-3">{attendanceWithSessions.map(att => (<div key={att.id} className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><div className="flex items-center justify-between"><div><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{att.session!.title}</h3><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{format(new Date(att.session!.startsAt), 'EEEE, MMMM d')}</p></div><div className="flex items-center gap-2"><span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: att.status === 'PRESENT' ? 'var(--color-success)' : att.status === 'LATE' ? 'var(--color-warning)' : att.status === 'ABSENT' ? 'var(--color-error)' : 'var(--color-text-muted)', color: 'white', opacity: 0.9 }}>{att.status}</span><span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>via {att.source}</span></div></div></div>))}</div>
      )}
    </div>
  );
}

function DancerProfile() {
  const { currentUser, getDancerProfile, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', biography: '' });
  const [saved, setSaved] = useState(false);
  if (!currentUser) return null;
  const profile = getDancerProfile(currentUser.id);

  const handleSave = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) return;
    updateUser(currentUser.id, { name: editForm.name.trim(), email: editForm.email.trim(), phone: editForm.phone || undefined, biography: editForm.biography || undefined });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>My Profile</h1>
      {saved && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>✓ Profile updated!</div>}
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: currentUser.avatar || 'var(--color-accent)' }}>{currentUser.name.charAt(0)}</div>
          <div className="flex-1">
            {!isEditing ? (<><h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{currentUser.name}</h2><p style={{ color: 'var(--color-text-muted)' }}>{currentUser.email}</p></>) : (
              <div className="space-y-2"><input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} placeholder="Name" /><input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} placeholder="Email" /></div>
            )}
          </div>
          {!isEditing && <button onClick={() => { setEditForm({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '', biography: currentUser.biography || '' }); setIsEditing(true); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }}>Edit Profile</button>}
        </div>
        <div className="space-y-4">
          {!isEditing ? (
            <>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Role</p><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.role}</p></div>
              {currentUser.biography && <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Bio</p><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.biography}</p></div>}
              {currentUser.phone && <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Phone</p><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.phone}</p></div>}
              {profile && <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Dance Styles</p><div className="flex flex-wrap gap-2">{profile.danceStyles.map(style => <span key={style} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{style}</span>)}</div></div>}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Kiosk Check-In</p><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{profile?.kioskEnabled ? 'Enabled' : 'Disabled'}</p></div>
            </>
          ) : (
            <>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Phone</label><input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} placeholder="Phone number" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Bio</label><textarea value={editForm.biography} onChange={e => setEditForm(f => ({ ...f, biography: e.target.value }))} className="w-full px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} rows={3} placeholder="Tell us about yourself..." /></div>
              <div className="flex gap-3"><button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }}>Save Changes</button><button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>Cancel</button></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DancerCalendar() {
  const { currentUser, sessions, registrations } = useApp();
  if (!currentUser) return null;
  const myRegistrations = registrations.filter(r => r.dancerId === currentUser.id && r.status === 'REGISTERED');
  const mySessions = myRegistrations.map(r => sessions.find(s => s.id === r.sessionId)).filter((s): s is NonNullable<typeof s> => !!s);
  return (<div><h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>My Calendar</h1><CalendarView sessions={mySessions} linkPrefix="/sessions" /></div>);
}

// ============ SETTINGS PAGES ============
function DancerSettings() {
  const { currentUser, getDancerProfile } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  if (!currentUser) return null;
  const profile = getDancerProfile(currentUser.id);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
      {saved && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>✓ Settings saved!</div>}
      <div className="space-y-6">
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4"><Settings size={20} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Appearance</h2></div>
          <div className="flex items-center justify-between"><div><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Theme</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Choose your preferred color scheme</p></div><button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span></button></div>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4"><User size={20} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Account</h2></div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Email</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.email}</span></div>
            <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Role</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.role}</span></div>
            <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Kiosk Check-In</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{profile?.kioskEnabled ? 'Enabled' : 'Disabled'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ INSTRUCTOR PAGES ============
function InstructorDashboard() {
  const { currentUser, sessions, rooms, getRegistrationCount, announcements } = useApp();
  if (!currentUser) return null;
  const todaySessions = sessions.filter(s => s.instructorId === currentUser.id && s.status === 'SCHEDULED' && isToday(new Date(s.startsAt))).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const myAnnouncements = announcements.filter(a => a.audience === 'ALL' || a.audience === 'INSTRUCTORS');
  return (
    <div>
      <div className="rounded-2xl p-8 mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-purple-deep), var(--color-accent))' }}>
        <div className="relative z-10 flex items-center justify-between"><div><h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1><p className="text-white/80 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p></div><Link to="/instructor/sessions/new" className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30"><Plus size={18} /> Create Session</Link></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }} />
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Today</h2>
        {todaySessions.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No classes today.</p> : (
          <div className="space-y-3">{todaySessions.map(session => { const room = rooms.find(r => r.id === session.roomId); const registered = getRegistrationCount(session.id); return (<Link key={session.id} to={`/instructor/sessions/${session.id}`} className="block rounded-xl p-5 transition-all" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><div className="flex items-center justify-between"><div><p className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{format(new Date(session.startsAt), 'h:mm a')}</p><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{session.title}</h3><p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{room?.name} • {registered} registered</p></div><div className="flex gap-2"><Link to={`/instructor/sessions/${session.id}/attendance`} className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-success)' }}>Take Attendance</Link><Link to={`/instructor/sessions/${session.id}`} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>View</Link></div></div></Link>); })}</div>
        )}
      </div>
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Announcements</h3>
        {myAnnouncements.length === 0 ? <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No announcements.</p> : (<div className="space-y-2">{myAnnouncements.slice(0, 5).map(ann => (<div key={ann.id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{ann.title}</p><p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{ann.message.slice(0, 80)}...</p></div>))}</div>)}
        <Link to="/instructor/availability" className="block mt-4 text-sm" style={{ color: 'var(--color-accent)' }}>Edit Availability →</Link>
      </div>
    </div>
  );
}

function InstructorSessions() {
  const { currentUser, sessions, rooms, getRegistrationCount, getAttendanceCount } = useApp();
  if (!currentUser) return null;
  const mySessions = sessions.filter(s => s.instructorId === currentUser.id && s.status !== 'CANCELLED' && isAfter(new Date(s.startsAt), new Date())).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Sessions</h1><Link to="/instructor/sessions/new" className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--color-accent)' }}><Plus size={18} /> New Session</Link></div>
      {mySessions.length === 0 ? <p className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No upcoming sessions.</p> : (
        <div className="space-y-3">{mySessions.map(session => { const room = rooms.find(r => r.id === session.roomId); const registered = getRegistrationCount(session.id); const attended = getAttendanceCount(session.id); return (<Link key={session.id} to={`/instructor/sessions/${session.id}`} className="block rounded-xl p-5 transition-all" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{session.title}</h3><LevelBadge level={session.level} /></div><p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{format(new Date(session.startsAt), 'EEE, MMM d')} • {format(new Date(session.startsAt), 'h:mm a')} – {format(new Date(session.endsAt), 'h:mm a')} • {room?.name}</p></div><div className="text-right"><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{registered} registered</p><p className="text-sm" style={{ color: 'var(--color-success)' }}>{attended} present</p></div></div></Link>); })}</div>
      )}
    </div>
  );
}

function InstructorSessionDetail() {
  const { sessionId } = useParams();
  const { sessions, rooms, users, getSessionRegistrations, getSessionAttendance, getRegistrationCount, getAttendanceCount, cancelSession, completeSession } = useApp();
  const navigate = useNavigate();
  const session = sessions.find(s => s.id === sessionId);
  const room = session ? rooms.find(r => r.id === session.roomId) : null;
  if (!session) return <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>Session not found.</div>;
  const registrations = getSessionRegistrations(session.id);
  const attendance = getSessionAttendance(session.id);
  const registered = getRegistrationCount(session.id);
  const attended = getAttendanceCount(session.id);
  const roster = registrations.map(r => ({ ...r, dancer: users.find(u => u.id === r.dancerId), attendance: attendance.find(a => a.dancerId === r.dancerId) }));
  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm mb-4 inline-block" style={{ color: 'var(--color-text-muted)' }}>← Back</button>
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{session.danceStyle}</span><LevelBadge level={session.level} /></div><h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--color-text-primary)' }}>{session.title}</h1><div className="flex items-center gap-4 mt-3" style={{ color: 'var(--color-text-muted)' }}><span className="flex items-center gap-1"><Calendar size={16} />{format(new Date(session.startsAt), 'EEEE, MMMM d')}</span><span className="flex items-center gap-1"><Clock size={16} />{format(new Date(session.startsAt), 'h:mm a')} – {format(new Date(session.endsAt), 'h:mm a')}</span><span className="flex items-center gap-1"><MapPin size={16} />{room?.name}</span></div></div><span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: session.status === 'SCHEDULED' ? 'var(--color-success)' : 'var(--color-text-muted)', color: 'white', opacity: 0.9 }}>{session.status}</span></div>
        <div className="grid grid-cols-3 gap-4 mt-6"><div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{registered}/{session.capacity}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Registered</p></div><div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{attended}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Checked In</p></div><div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{session.capacity - registered}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Spots Left</p></div></div>
        <div className="flex gap-3 mt-6"><Link to={`/instructor/sessions/${session.id}/attendance`} className="px-6 py-3 text-white font-semibold rounded-lg" style={{ backgroundColor: 'var(--color-success)' }}>Take Attendance</Link>{session.status === 'SCHEDULED' && (<><button onClick={() => completeSession(session.id)} className="px-4 py-3 rounded-lg" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>Mark Complete</button><button onClick={() => { if (confirm('Cancel this session?')) cancelSession(session.id); }} className="px-4 py-3 rounded-lg" style={{ border: '1px solid var(--color-error)', color: 'var(--color-error)' }}>Cancel Session</button></>)}</div>
        <div className="mt-8"><h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Roster ({roster.length})</h3>{roster.length === 0 ? <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No dancers registered yet.</p> : (<div className="space-y-2">{roster.map(({ dancer, attendance: att }) => (<div key={dancer?.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}>{dancer?.name.charAt(0)}</div><span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{dancer?.name}</span></div>{att ? <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: att.status === 'PRESENT' ? 'var(--color-success)' : 'var(--color-text-muted)', color: 'white', opacity: 0.9 }}>{att.status} {att.source === 'KIOSK' && '(Kiosk)'}</span> : <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Not checked in</span>}</div>))}</div>)}</div>
      </div>
    </div>
  );
}

function InstructorSessionAttendance() {
  const { sessionId } = useParams();
  const { sessions, rooms, users, currentUser, getSessionRegistrations, getSessionAttendance, markAttendance } = useApp();
  const navigate = useNavigate();
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);
  const session = sessions.find(s => s.id === sessionId);
  const room = session ? rooms.find(r => r.id === session.roomId) : null;
  if (!session || !currentUser) return <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>Session not found.</div>;
  const registrations = getSessionRegistrations(session.id);
  const attendance = getSessionAttendance(session.id);
  const roster = registrations.map(r => ({ ...r, dancer: users.find(u => u.id === r.dancerId), existingAttendance: attendance.find(a => a.dancerId === r.dancerId) }));
  const getStatus = (dancerId: string): AttendanceStatus => localAttendance[dancerId] || attendance.find(a => a.dancerId === dancerId)?.status || 'UNMARKED';
  const handleSave = () => { Object.entries(localAttendance).forEach(([dancerId, status]) => markAttendance(session.id, dancerId, status, 'INSTRUCTOR', currentUser.id)); setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const statuses: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];
  return (
    <div>
      <button onClick={() => navigate(`/instructor/sessions/${sessionId}`)} className="text-sm mb-4 inline-block" style={{ color: 'var(--color-text-muted)' }}>← Back</button>
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{session.title}</h1><p style={{ color: 'var(--color-text-muted)' }}>{format(new Date(session.startsAt), 'h:mm a')} • {room?.name}</p></div>
        {saved && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>✓ Attendance saved!</div>}
        <div className="space-y-3">{roster.map(({ dancerId, dancer, existingAttendance }) => { const currentStatus = getStatus(dancerId); return (<div key={dancerId} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center font-medium" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}>{dancer?.name.charAt(0) || '?'}</div><div><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{dancer?.name || 'Unknown Dancer'}</p>{existingAttendance?.source === 'KIOSK' && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Kiosk check-in {existingAttendance.checkedInAt && format(new Date(existingAttendance.checkedInAt), 'h:mm a')}</p>}</div></div><div className="flex gap-2">{statuses.map(status => (<button key={status} onClick={() => setLocalAttendance(prev => ({ ...prev, [dancerId]: status }))} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all`} style={{ backgroundColor: currentStatus === status ? (status === 'PRESENT' ? 'var(--color-success)' : status === 'LATE' ? 'var(--color-warning)' : status === 'ABSENT' ? 'var(--color-error)' : 'var(--color-accent)') : 'var(--color-bg-tertiary)', color: currentStatus === status ? 'white' : 'var(--color-text-secondary)' }}>{status}</button>))}</div></div>); })}</div>
        <div className="mt-6 flex justify-end"><button onClick={handleSave} disabled={Object.keys(localAttendance).length === 0} className="px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--color-accent)' }}>Save Attendance</button></div>
      </div>
    </div>
  );
}

function InstructorNewSession() {
  const { currentUser, rooms, createSession } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', danceStyle: 'Hip Hop', description: '', date: '', startTime: '', endTime: '', roomId: '', capacity: 20, allowWalkIns: true, level: 'beginner' as Session['level'] });
  const [error, setError] = useState('');
  if (!currentUser) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.date || !form.startTime || !form.endTime || !form.roomId) { setError('Please fill in all required fields.'); return; }
    const startsAt = new Date(`${form.date}T${form.startTime}`).toISOString();
    const endsAt = new Date(`${form.date}T${form.endTime}`).toISOString();
    const danceStyleImages: Record<string, string> = {
      'Hip Hop': 'https://images.unsplash.com/photo-1547153725-6c91c404c9a8?w=800&h=600&fit=crop',
      'Breaking': 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=600&fit=crop',
      'Popping': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop',
      'House': 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=600&fit=crop',
      'Locking': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop',
      'Contemporary': 'https://image.qwenlm.ai/generated-images/ffb07fbe-89e5-491d-9cb0-8d6b6bdd6988/_result.png',
      'Afrobeats': 'https://image.qwenlm.ai/generated-images/c6dd8d12-f4aa-4c61-afdf-856de11281d1/_result.png',
    };
    const result = createSession({ title: form.title, danceStyle: form.danceStyle, description: form.description || undefined, instructorId: currentUser.id, roomId: form.roomId, startsAt, endsAt, capacity: form.capacity, status: 'SCHEDULED', allowWalkIns: form.allowWalkIns, createdById: currentUser.id, image: danceStyleImages[form.danceStyle], level: form.level });
    if (result.success) navigate('/instructor/sessions');
    else setError(result.message);
  };
  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm mb-4 inline-block" style={{ color: 'var(--color-text-muted)' }}>← Back</button>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Create New Session</h1>
      <form onSubmit={handleSubmit} className="rounded-2xl p-8 max-w-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-error)', color: 'white', opacity: 0.9 }}>{error}</div>}
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Title *</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} placeholder="e.g. Hip Hop Fundamentals" /></div>
          <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Dance Style *</label><select value={form.danceStyle} onChange={e => setForm(f => ({ ...f, danceStyle: e.target.value }))} className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option>Hip Hop</option><option>Popping</option><option>Locking</option><option>Breaking</option><option>House</option><option>Contemporary</option><option>Afrobeats</option></select></div>
          <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Level *</label><div className="grid grid-cols-3 gap-2">{(['beginner', 'intermediate', 'advanced'] as const).map(level => { const colors = getLevelColor(level); return (<button key={level} type="button" onClick={() => setForm(f => ({ ...f, level }))} className="px-3 py-2 rounded-lg border-2 transition-all capitalize font-medium text-sm" style={{ backgroundColor: form.level === level ? colors.bg : 'var(--color-bg-primary)', borderColor: form.level === level ? colors.border : 'var(--color-border)', color: form.level === level ? colors.text : 'var(--color-text-muted)' }}>{level}</button>); })}</div></div>
          <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Date *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div><div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Start Time *</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div><div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>End Time *</label><input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Room *</label><select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="">Select room...</option>{rooms.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.name} (capacity: {r.capacity})</option>)}</select></div><div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Capacity *</label><input type="number" min={1} max={50} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))} className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="allowWalkIns" checked={form.allowWalkIns} onChange={e => setForm(f => ({ ...f, allowWalkIns: e.target.checked }))} className="w-4 h-4" /><label htmlFor="allowWalkIns" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Allow walk-ins</label></div>
        </div>
        <div className="mt-6"><button type="submit" className="px-6 py-3 text-white font-semibold rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>Create Session</button></div>
      </form>
    </div>
  );
}

function InstructorAvailabilityPage() {
  const { currentUser, availability, setAvailability } = useApp();
  const [slots, setSlots] = useState<{ startsAt: string; endsAt: string; notes: string }[]>([]);
  const [saved, setSaved] = useState(false);
  if (!currentUser) return null;
  const myAvailability = availability.filter(a => a.instructorId === currentUser.id);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>My Availability</h1>
      <div className="rounded-2xl p-8 max-w-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Current Availability</h3>
        {myAvailability.length === 0 ? <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>No availability set yet.</p> : (<div className="space-y-2 mb-6">{myAvailability.map(avail => (<div key={avail.id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="font-medium text-sm">{format(new Date(avail.startsAt), 'EEE, MMM d')} • {format(new Date(avail.startsAt), 'h:mm a')} – {format(new Date(avail.endsAt), 'h:mm a')}</p>{avail.notes && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{avail.notes}</p>}</div>))}</div>)}
        {saved && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>✓ Availability saved!</div>}
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Add Availability</h3>
        {slots.map((slot, i) => (<div key={i} className="flex gap-3 items-end mb-3"><div className="flex-1"><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Start</label><input type="datetime-local" value={slot.startsAt} onChange={e => setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, startsAt: e.target.value } : s))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div><div className="flex-1"><label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>End</label><input type="datetime-local" value={slot.endsAt} onChange={e => setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, endsAt: e.target.value } : s))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div><button onClick={() => setSlots(prev => prev.filter((_, idx) => idx !== i))} className="px-3 py-2 rounded-lg" style={{ color: 'var(--color-error)' }}>✕</button></div>))}
        <div className="flex gap-3 mt-4"><button onClick={() => setSlots([...slots, { startsAt: '', endsAt: '', notes: '' }])} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>+ Add Time Slot</button>{slots.length > 0 && <button onClick={() => { const validSlots = slots.filter(s => s.startsAt && s.endsAt).map(s => ({ startsAt: new Date(s.startsAt).toISOString(), endsAt: new Date(s.endsAt).toISOString(), notes: s.notes || undefined })); setAvailability(currentUser.id, validSlots); setSaved(true); setSlots([]); setTimeout(() => setSaved(false), 3000); }} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: 'var(--color-accent)' }}>Save Availability</button>}</div>
      </div>
    </div>
  );
}

function InstructorCalendar() {
  const { currentUser, sessions } = useApp();
  if (!currentUser) return null;
  const mySessions = sessions.filter(s => s.instructorId === currentUser.id);
  return (<div><h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>My Calendar</h1><CalendarView sessions={mySessions} linkPrefix="/instructor/sessions" /></div>);
}

function InstructorSettings() {
  const { currentUser } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  if (!currentUser) return null;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
      {saved && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>✓ Settings saved!</div>}
      <div className="space-y-6">
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4"><Settings size={20} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Appearance</h2></div>
          <div className="flex items-center justify-between"><div><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Theme</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Choose your preferred color scheme</p></div><button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span></button></div>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4"><User size={20} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Account</h2></div>
          <div className="space-y-3"><div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Email</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.email}</span></div><div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Role</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.role}</span></div></div>
        </div>
      </div>
    </div>
  );
}

// ============ ADMIN PAGES ============
function AdminDashboard() {
  const { sessions, registrations, attendance, users, rooms } = useApp();
  const todaySessions = sessions.filter(s => isToday(new Date(s.startsAt)) && s.status !== 'CANCELLED');
  const todayRegistrations = registrations.filter(r => { const session = sessions.find(s => s.id === r.sessionId); return session && isToday(new Date(session.startsAt)) && r.status === 'REGISTERED'; });
  const todayAttendance = attendance.filter(a => { const session = sessions.find(s => s.id === a.sessionId); return session && isToday(new Date(session.startsAt)) && (a.status === 'PRESENT' || a.status === 'LATE'); });
  const todayInstructors = new Set(todaySessions.map(s => s.instructorId));
  return (
    <div>
      <div className="rounded-2xl p-8 mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-purple-deep), var(--color-accent))' }}>
        <div className="relative z-10"><h1 className="text-3xl font-bold text-white">Admin Dashboard</h1><p className="text-white/80 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p><p className="text-white/60 text-sm mt-2">Manage your studio operations</p></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: 'white', transform: 'translate(-30%, 30%)' }} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>{todaySessions.length}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sessions Today</p></div>
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><p className="text-3xl font-bold" style={{ color: 'var(--color-info)' }}>{todayRegistrations.length}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Registered Today</p></div>
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><p className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>{todayAttendance.length}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Checked In</p></div>
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><p className="text-3xl font-bold" style={{ color: 'var(--color-purple-medium)' }}>{todayInstructors.size}</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Instructors Working</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Today's Schedule</h3>
          {todaySessions.length === 0 ? <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No sessions today.</p> : (<div className="space-y-2">{todaySessions.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()).map(session => { const room = rooms.find(r => r.id === session.roomId); const instructor = users.find(u => u.id === session.instructorId); return (<div key={session.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><div><p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{session.title}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{format(new Date(session.startsAt), 'h:mm a')} • {room?.name} • {instructor?.name}</p></div><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>{session.status}</span></div>); })}</div>)}
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Stats</h3>
          <div className="space-y-3"><div className="flex justify-between items-center"><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total Dancers</span><span className="font-semibold">{users.filter(u => u.role === 'DANCER' && u.isActive).length}</span></div><div className="flex justify-between items-center"><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total Instructors</span><span className="font-semibold">{users.filter(u => u.role === 'INSTRUCTOR' && u.isActive).length}</span></div><div className="flex justify-between items-center"><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total Rooms</span><span className="font-semibold">{rooms.filter(r => r.isActive).length}</span></div><div className="flex justify-between items-center"><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total Sessions</span><span className="font-semibold">{sessions.filter(s => s.status === 'SCHEDULED').length}</span></div></div>
        </div>
      </div>
    </div>
  );
}

function AdminSessions() {
  const { sessions, rooms, users, getRegistrationCount, getAttendanceCount } = useApp();
  const [search, setSearch] = useState('');
  const filteredSessions = useMemo(() => { let result = [...sessions]; if (search) { const searchLower = search.toLowerCase(); result = result.filter(s => s.title.toLowerCase().includes(searchLower)); } return result.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()); }, [sessions, search]);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>All Sessions</h1>
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sessions..." className="w-full pl-10 pr-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div></div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full"><thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}><tr><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Session</th><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Instructor</th><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Room</th><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Time</th><th className="text-right px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Registered</th><th className="text-right px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Present</th><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Status</th></tr></thead>
          <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>{filteredSessions.map(session => { const room = rooms.find(r => r.id === session.roomId); const instructor = users.find(u => u.id === session.instructorId); const registered = getRegistrationCount(session.id); const present = getAttendanceCount(session.id); return (<tr key={session.id} style={{ borderTop: '1px solid var(--color-border-light)' }}><td className="px-4 py-3"><p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{session.title}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{session.danceStyle}</p></td><td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{instructor?.name}</td><td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{room?.name}</td><td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{format(new Date(session.startsAt), 'MMM d, h:mm a')}</td><td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--color-text-muted)' }}>{registered}/{session.capacity}</td><td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--color-success)' }}>{present}</td><td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: session.status === 'SCHEDULED' ? 'var(--color-success)' : 'var(--color-text-muted)', color: 'white', opacity: 0.9 }}>{session.status}</span></td></tr>); })}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDancers() {
  const { users, dancerProfiles, addUser, deactivateUser } = useApp();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDancer, setNewDancer] = useState({ name: '', email: '', phone: '' });
  const dancers = users.filter(u => u.role === 'DANCER');
  const filteredDancers = search ? dancers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase())) : dancers;
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dancers</h1><button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--color-accent)' }}><Plus size={18} /> Add Dancer</button></div>
      {showAddForm && (<div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>New Dancer</h3><div className="grid grid-cols-3 gap-4"><input type="text" value={newDancer.name} onChange={e => setNewDancer(d => ({ ...d, name: e.target.value }))} placeholder="Full name" className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /><input type="email" value={newDancer.email} onChange={e => setNewDancer(d => ({ ...d, email: e.target.value }))} placeholder="Email" className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /><input type="tel" value={newDancer.phone} onChange={e => setNewDancer(d => ({ ...d, phone: e.target.value }))} placeholder="Phone (optional)" className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div><button onClick={() => { if (newDancer.name && newDancer.email) { addUser({ name: newDancer.name, email: newDancer.email, phone: newDancer.phone || undefined, role: 'DANCER', isActive: true }); setNewDancer({ name: '', email: '', phone: '' }); setShowAddForm(false); } }} className="mt-4 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: 'var(--color-accent)' }}>Add Dancer</button></div>)}
      <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dancers..." className="w-full pl-10 pr-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div></div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full"><thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}><tr><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Name</th><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Email</th><th className="text-left px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Styles</th><th className="text-center px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Kiosk</th><th className="text-center px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Status</th><th className="text-right px-4 py-3 text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Actions</th></tr></thead>
          <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>{filteredDancers.map(dancer => { const profile = dancerProfiles.find(dp => dp.userId === dancer.id); return (<tr key={dancer.id} style={{ borderTop: '1px solid var(--color-border-light)' }}><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{dancer.name.charAt(0)}</div><span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{dancer.name}</span></div></td><td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{dancer.email}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1">{profile?.danceStyles.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{s}</span>)}</div></td><td className="px-4 py-3 text-center"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: profile?.kioskEnabled ? 'var(--color-success)' : 'var(--color-text-muted)', color: 'white', opacity: 0.9 }}>{profile?.kioskEnabled ? 'Yes' : 'No'}</span></td><td className="px-4 py-3 text-center"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: dancer.isActive ? 'var(--color-success)' : 'var(--color-error)', color: 'white', opacity: 0.9 }}>{dancer.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3 text-right">{dancer.isActive && <button onClick={() => { if (confirm(`Deactivate ${dancer.name}?`)) deactivateUser(dancer.id); }} className="text-xs" style={{ color: 'var(--color-error)' }}>Deactivate</button>}</td></tr>); })}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdminInstructors() {
  const { users, instructorProfiles, sessions, availability, addUser, deactivateUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInstructor, setNewInstructor] = useState({ name: '', email: '' });
  const instructors = users.filter(u => u.role === 'INSTRUCTOR');
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Instructors</h1><button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--color-accent)' }}><Plus size={18} /> Add Instructor</button></div>
      {showAddForm && (<div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>New Instructor</h3><div className="grid grid-cols-2 gap-4"><input type="text" value={newInstructor.name} onChange={e => setNewInstructor(i => ({ ...i, name: e.target.value }))} placeholder="Full name" className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /><input type="email" value={newInstructor.email} onChange={e => setNewInstructor(i => ({ ...i, email: e.target.value }))} placeholder="Email" className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div><button onClick={() => { if (newInstructor.name && newInstructor.email) { addUser({ name: newInstructor.name, email: newInstructor.email, role: 'INSTRUCTOR', isActive: true }); setNewInstructor({ name: '', email: '' }); setShowAddForm(false); } }} className="mt-4 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: 'var(--color-accent)' }}>Add Instructor</button></div>)}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{instructors.map(instructor => { const profile = instructorProfiles.find(ip => ip.userId === instructor.id); const mySessions = sessions.filter(s => s.instructorId === instructor.id && s.status === 'SCHEDULED').length; const myAvailability = availability.filter(a => a.instructorId === instructor.id).length; return (<div key={instructor.id} className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--color-info)', color: 'white', opacity: 0.9 }}>{instructor.name.charAt(0)}</div><div className="flex-1"><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{instructor.name}</h3><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{instructor.email}</p></div><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: instructor.isActive ? 'var(--color-success)' : 'var(--color-error)', color: 'white', opacity: 0.9 }}>{instructor.isActive ? 'Active' : 'Inactive'}</span></div><div className="grid grid-cols-3 gap-3 mb-4"><div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{mySessions}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sessions</p></div><div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{myAvailability}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Available</p></div></div>{profile && <div className="flex flex-wrap gap-1 mb-4">{profile.danceStylesTaught.map(s => <span key={s} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-purple-light)', color: 'var(--color-purple-deep)' }}>{s}</span>)}</div>}{instructor.isActive && <button onClick={() => { if (confirm(`Deactivate ${instructor.name}?`)) deactivateUser(instructor.id); }} className="text-xs" style={{ color: 'var(--color-error)' }}>Deactivate</button>}</div>); })}</div>
    </div>
  );
}

function AdminRooms() {
  const { rooms, sessions, addRoom, updateRoom } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 20 });
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Rooms</h1><button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--color-accent)' }}><Plus size={18} /> Add Room</button></div>
      {showAddForm && (<div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>New Room</h3><div className="grid grid-cols-2 gap-4"><input type="text" value={newRoom.name} onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))} placeholder="Room name" className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /><input type="number" value={newRoom.capacity} onChange={e => setNewRoom(r => ({ ...r, capacity: parseInt(e.target.value) || 1 }))} placeholder="Capacity" className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /></div><button onClick={() => { if (newRoom.name && newRoom.capacity > 0) { addRoom({ name: newRoom.name, capacity: newRoom.capacity, isActive: true }); setNewRoom({ name: '', capacity: 20 }); setShowAddForm(false); } }} className="mt-4 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: 'var(--color-accent)' }}>Add Room</button></div>)}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{rooms.map(room => { const roomSessions = sessions.filter(s => s.roomId === room.id && s.status === 'SCHEDULED').length; return (<div key={room.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>{room.image && <div className="h-32 overflow-hidden"><SafeImage src={room.image} alt={room.name} className="w-full h-full object-cover" /></div>}<div className="p-6"><div className="flex items-center gap-3 mb-4"><Building2 size={24} style={{ color: 'var(--color-accent)' }} /><div><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{room.name}</h3><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Capacity: {room.capacity}</p></div></div><div className="flex items-center justify-between"><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{roomSessions} upcoming sessions</span><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: room.isActive ? 'var(--color-success)' : 'var(--color-error)', color: 'white', opacity: 0.9 }}>{room.isActive ? 'Active' : 'Inactive'}</span></div><button onClick={() => updateRoom(room.id, { isActive: !room.isActive })} className="mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{room.isActive ? 'Deactivate' : 'Activate'}</button></div></div>); })}</div>
    </div>
  );
}

function AdminAnnouncements() {
  const { announcements, users, currentUser, createAnnouncement, deleteAnnouncement } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', audience: 'ALL' as const });
  const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Announcements</h1><button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium" style={{ backgroundColor: 'var(--color-accent)' }}><Plus size={18} /> New Announcement</button></div>
      {showForm && (<div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Create Announcement</h3><div className="space-y-4"><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className="w-full px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} /><textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Message" className="w-full px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} rows={3} /><select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value as any }))} className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><option value="ALL">Everyone</option><option value="DANCERS">Dancers Only</option><option value="INSTRUCTORS">Instructors Only</option></select><button onClick={() => { if (form.title && form.message && currentUser) { createAnnouncement({ authorId: currentUser.id, title: form.title, message: form.message, audience: form.audience }); setForm({ title: '', message: '', audience: 'ALL' }); setShowForm(false); } }} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: 'var(--color-accent)' }}>Publish</button></div></div>)}
      <div className="space-y-3">{sortedAnnouncements.map(ann => { const author = users.find(u => u.id === ann.authorId); return (<div key={ann.id} className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{ann.title}</h3><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: ann.audience === 'ALL' ? 'var(--color-bg-tertiary)' : 'var(--color-purple-light)', color: ann.audience === 'ALL' ? 'var(--color-text-secondary)' : 'var(--color-purple-deep)' }}>{ann.audience}</span></div><p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>{ann.message}</p><p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>By {author?.name} • {format(new Date(ann.createdAt), 'MMM d, h:mm a')}</p></div><button onClick={() => { if (confirm('Delete this announcement?')) deleteAnnouncement(ann.id); }} style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></button></div></div>); })}</div>
    </div>
  );
}

function AdminCalendar() {
  const { sessions } = useApp();
  return (<div><h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Studio Calendar</h1><CalendarView sessions={sessions} linkPrefix="/admin/sessions" /></div>);
}

function AdminSettings() {
  const { currentUser, users } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  if (!currentUser) return null;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
      {saved && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>✓ Settings saved!</div>}
      <div className="space-y-6">
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4"><Settings size={20} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Appearance</h2></div>
          <div className="flex items-center justify-between"><div><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Theme</p><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Choose your preferred color scheme</p></div><button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span></button></div>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4"><User size={20} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>System Information</h2></div>
          <div className="space-y-3"><div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Version</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>1.0.0</span></div><div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total Users</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{totalUsers}</span></div><div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Active Users</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{activeUsers}</span></div></div>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-4"><User size={20} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Account</h2></div>
          <div className="space-y-3"><div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Email</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.email}</span></div><div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}><span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Role</span><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentUser.role}</span></div></div>
        </div>
      </div>
    </div>
  );
}

// ============ KIOSK PAGES ============
const CHECK_IN_WINDOW_MINUTES = 30;
const INACTIVITY_TIMEOUT_MS = 45000;

function isWithinCheckInWindow(startsAt: string): boolean {
  const now = new Date();
  const start = new Date(startsAt);
  const diffMs = start.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes <= CHECK_IN_WINDOW_MINUTES && diffMinutes >= -CHECK_IN_WINDOW_MINUTES;
}

function useInactivityReset(navigate: any, path: string) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => { clearTimeout(timer); timer = setTimeout(() => navigate(path), INACTIVITY_TIMEOUT_MS); };
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => { clearTimeout(timer); window.removeEventListener('mousemove', resetTimer); window.removeEventListener('touchstart', resetTimer); };
  }, [navigate, path]);
}

function KioskSetup() {
  const { kiosk, activateKiosk, deactivateKiosk, login, users } = useApp();
  const navigate = useNavigate();
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const staffUsers = users.filter(u => (u.role === 'ADMIN' || u.role === 'INSTRUCTOR') && u.isActive);
  const handleActivate = () => { if (!authEmail) { setAuthError('Please select a staff account'); return; } const success = login(authEmail); if (success) { activateKiosk(); navigate('/kiosk'); } else { setAuthError('Authentication failed'); } };
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-purple-darkest)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-purple-light)' }}>GRVMNT</h1><p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>Kiosk Setup</p></div>
        <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {kiosk.isActive ? (<div className="text-center"><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-success)', opacity: 0.2 }}><Check size={32} style={{ color: 'var(--color-success)' }} /></div><h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Kiosk Active</h2><p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>The check-in kiosk is running.</p><div className="space-y-3"><Link to="/kiosk" className="block w-full py-3 px-4 text-white font-semibold rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>Open Kiosk</Link><button onClick={deactivateKiosk} className="block w-full py-3 px-4 font-semibold rounded-lg" style={{ border: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>Deactivate</button></div></div>) : (<div><h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Activate Kiosk</h2><p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Select a staff account to activate.</p><div className="space-y-2 mb-6">{staffUsers.map(user => (<button key={user.id} onClick={() => { setAuthEmail(user.email); setAuthError(''); }} className="w-full text-left px-4 py-3 rounded-lg border-2 transition-all" style={{ borderColor: authEmail === user.email ? 'var(--color-accent)' : 'var(--color-border)', backgroundColor: authEmail === user.email ? 'var(--color-purple-light)' : 'transparent' }}><p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{user.name}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.role}</p></button>))}</div>{authError && <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{authError}</p>}<button onClick={handleActivate} className="w-full py-3 px-4 text-white font-semibold rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>Activate Kiosk</button></div>)}
        </div>
        <div className="text-center mt-6"><Link to="/login" className="text-sm" style={{ color: 'var(--color-text-muted)' }}>← Back to Login</Link></div>
      </div>
    </div>
  );
}

function KioskHome() {
  const { sessions, rooms, users, getRegistrationCount, getAttendanceCount } = useApp();
  const navigate = useNavigate();
  useInactivityReset(navigate, '/kiosk');
  const todaySessions = useMemo(() => { const now = new Date(); return sessions.filter(s => { const sessionDate = new Date(s.startsAt); return s.status === 'SCHEDULED' && sessionDate.toDateString() === now.toDateString() && isWithinCheckInWindow(s.startsAt); }).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()); }, [sessions]);
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-purple-darkest)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12"><h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--color-purple-light)' }}>GRVMNT</h1><p className="text-xl mt-2" style={{ color: 'var(--color-text-muted)' }}>CHECK IN</p><p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p></div>
        {todaySessions.length === 0 ? (<div className="text-center py-16"><Clock className="mx-auto mb-4" size={48} style={{ color: 'var(--color-text-muted)' }} /><p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>No classes available for check-in right now.</p></div>) : (<div className="grid gap-4"><p className="text-center text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Today's Classes</p>{todaySessions.map(session => { const room = rooms.find(r => r.id === session.roomId); const instructor = users.find(u => u.id === session.instructorId); const registered = getRegistrationCount(session.id); const checkedIn = getAttendanceCount(session.id); return (<button key={session.id} onClick={() => navigate(`/kiosk/session/${session.id}`)} className="rounded-2xl p-6 text-left transition-all" style={{ backgroundColor: 'var(--color-purple-dark)', border: '1px solid var(--color-border)' }}><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-white">{format(new Date(session.startsAt), 'h:mm a')}</p><h3 className="text-xl font-semibold text-white mt-1">{session.title}</h3><div className="flex items-center gap-4 mt-2" style={{ color: 'var(--color-text-muted)' }}><span className="flex items-center gap-1"><MapPin size={14} />{room?.name}</span><span className="flex items-center gap-1"><Users size={14} />{instructor?.name}</span></div></div><div className="text-right"><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{checkedIn}/{registered} checked in</p><div className="mt-2 px-6 py-3 text-white font-semibold rounded-xl" style={{ backgroundColor: 'var(--color-accent)' }}>Check In →</div></div></div></button>); })}</div>)}
        <div className="text-center mt-12"><Link to="/kiosk/setup" className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Kiosk Settings</Link></div>
      </div>
    </div>
  );
}

function KioskSessionSelect() {
  const { sessionId } = useParams();
  const { sessions, rooms, getRegistrationCount } = useApp();
  const navigate = useNavigate();
  useInactivityReset(navigate, '/kiosk');
  const session = sessions.find(s => s.id === sessionId);
  const room = session ? rooms.find(r => r.id === session.roomId) : null;
  if (!session) return (<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-purple-darkest)' }}><div className="text-center"><AlertCircle className="mx-auto mb-4" size={48} style={{ color: 'var(--color-error)' }} /><p className="text-white text-xl">Session not found.</p><button onClick={() => navigate('/kiosk')} className="mt-6 kiosk-btn text-white px-8" style={{ backgroundColor: 'var(--color-accent)' }}>← Back</button></div></div>);
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-purple-darkest)' }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/kiosk')} className="flex items-center gap-2 mb-8" style={{ color: 'var(--color-text-muted)' }}><ArrowLeft size={20} /> Back to classes</button>
        <div className="text-center mb-12"><h2 className="text-3xl font-bold text-white">{session.title}</h2><p className="text-xl mt-2" style={{ color: 'var(--color-purple-light)' }}>{format(new Date(session.startsAt), 'h:mm a')}</p><p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{room?.name} • {getRegistrationCount(session.id)} registered</p></div>
        <div className="text-center"><p className="text-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>Who are you?</p><button onClick={() => navigate(`/kiosk/session/${sessionId}/search`)} className="kiosk-btn w-full text-white px-8 flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--color-accent)' }}><Search size={24} /> Search your name</button></div>
      </div>
    </div>
  );
}

function KioskDancerSearch() {
  const { sessionId } = useParams();
  const { users, sessions } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  useInactivityReset(navigate, '/kiosk');
  const session = sessions.find(s => s.id === sessionId);
  const dancers = users.filter(u => u.role === 'DANCER' && u.isActive);
  const filteredDancers = query.length >= 2 ? dancers.filter(d => d.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-purple-darkest)' }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/kiosk/session/${sessionId}`)} className="flex items-center gap-2 mb-8" style={{ color: 'var(--color-text-muted)' }}><ArrowLeft size={20} /> Back</button>
        <div className="text-center mb-8"><h2 className="text-2xl font-bold text-white">Search Your Name</h2><p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>{session?.title} • {session && format(new Date(session.startsAt), 'h:mm a')}</p></div>
        <div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2" size={24} style={{ color: 'var(--color-text-muted)' }} /><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Start typing your name..." autoFocus className="w-full pl-14 pr-4 py-5 text-xl rounded-xl text-white focus:outline-none transition-colors" style={{ backgroundColor: 'var(--color-purple-dark)', border: '2px solid var(--color-border)' }} /></div>
        {filteredDancers.length > 0 ? (<div className="space-y-2">{filteredDancers.map(dancer => (<button key={dancer.id} onClick={() => navigate(`/kiosk/session/${sessionId}/confirm/${dancer.id}`)} className="w-full text-left px-6 py-5 rounded-xl transition-all" style={{ backgroundColor: 'var(--color-purple-dark)', border: '1px solid var(--color-border)' }}><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--color-accent)' }}>{dancer.name.charAt(0)}</div><p className="text-xl font-semibold text-white">{dancer.name}</p></div></button>))}</div>) : query.length >= 2 ? (<div className="text-center py-8"><p style={{ color: 'var(--color-text-muted)' }}>No dancers found matching "{query}"</p><p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>Please ask an instructor for help.</p></div>) : (<div className="text-center py-8"><p style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>Type at least 2 characters to search</p></div>)}
      </div>
    </div>
  );
}

function KioskConfirm() {
  const { sessionId, dancerId } = useParams();
  const { sessions, rooms, users, checkInDancer } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  useInactivityReset(navigate, '/kiosk');
  const session = sessions.find(s => s.id === sessionId);
  const room = session ? rooms.find(r => r.id === session.roomId) : null;
  const dancer = users.find(u => u.id === dancerId && u.role === 'DANCER');
  if (!session || !dancer) return (<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-purple-darkest)' }}><div className="text-center"><p className="text-white text-xl">Information not found.</p><button onClick={() => navigate('/kiosk')} className="mt-6 kiosk-btn text-white px-8" style={{ backgroundColor: 'var(--color-accent)' }}>← Back</button></div></div>);
  const handleConfirm = () => { const result = checkInDancer(dancer.id, session.id); if (result.success) { if (result.alreadyCheckedIn) { setError("You're already checked in!"); setTimeout(() => navigate('/kiosk'), 2000); } else { navigate(`/kiosk/session/${sessionId}/success/${dancerId}`); } } else { setError(result.message); } };
  return (
    <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: 'var(--color-purple-darkest)' }}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8"><h2 className="text-2xl font-bold text-white">{session.title}</h2><p className="text-xl mt-2" style={{ color: 'var(--color-purple-light)' }}>{format(new Date(session.startsAt), 'h:mm a')}</p><p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{room?.name}</p></div>
        <div className="rounded-2xl p-8 text-center mb-8" style={{ backgroundColor: 'var(--color-purple-dark)', border: '1px solid var(--color-border)' }}><p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Checking in:</p><div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-accent)' }}><span className="text-3xl font-bold text-white">{dancer.name.charAt(0)}</span></div><p className="text-2xl font-bold text-white">{dancer.name}</p></div>
        {error && (<div className="rounded-xl p-4 mb-6 text-center" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--color-warning)' }}><p style={{ color: 'var(--color-warning)' }}>{error}</p></div>)}
        <div className="space-y-3"><button onClick={handleConfirm} className="kiosk-btn w-full text-white px-8 flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--color-success)' }}><Check size={24} /> Confirm Check-In</button><button onClick={() => navigate(`/kiosk/session/${sessionId}/search`)} className="kiosk-btn w-full text-white px-8" style={{ backgroundColor: 'var(--color-purple-dark)' }}>← Back</button></div>
      </div>
    </div>
  );
}

function KioskSuccess() {
  const { sessionId, dancerId } = useParams();
  const { sessions, users } = useApp();
  const navigate = useNavigate();
  const session = sessions.find(s => s.id === sessionId);
  const dancer = users.find(u => u.id === dancerId);
  useEffect(() => { const timer = setTimeout(() => navigate('/kiosk'), 4000); return () => clearTimeout(timer); }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-purple-darkest)' }}>
      <div className="max-w-lg w-full text-center pulse-success">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: 'var(--color-success)' }}><Check className="text-white" size={48} /></div>
        <h2 className="text-3xl font-bold text-white mb-4">You're checked in!</h2>
        {dancer && <p className="text-xl mb-2" style={{ color: 'var(--color-purple-light)' }}>{dancer.name}</p>}
        {session && (<><p className="text-lg" style={{ color: 'var(--color-purple-light)' }}>{session.title}</p><p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{format(new Date(session.startsAt), 'h:mm a')}</p></>)}
        <p className="mt-8 text-lg" style={{ color: 'var(--color-text-muted)' }}>Have a great class! 🎶</p>
        <button onClick={() => navigate('/kiosk')} className="mt-8 kiosk-btn text-white px-8" style={{ backgroundColor: 'var(--color-purple-dark)' }}>Done</button>
      </div>
    </div>
  );
}

// ============ ROUTING ============
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function KioskRoute({ children }: { children: React.ReactNode }) {
  const { kiosk } = useApp();
  if (!kiosk.isActive) return <Navigate to="/kiosk/setup" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/kiosk/setup" element={<KioskSetup />} />
      <Route path="/kiosk" element={<KioskRoute><KioskHome /></KioskRoute>} />
      <Route path="/kiosk/session/:sessionId" element={<KioskRoute><KioskSessionSelect /></KioskRoute>} />
      <Route path="/kiosk/session/:sessionId/search" element={<KioskRoute><KioskDancerSearch /></KioskRoute>} />
      <Route path="/kiosk/session/:sessionId/confirm/:dancerId" element={<KioskRoute><KioskConfirm /></KioskRoute>} />
      <Route path="/kiosk/session/:sessionId/success/:dancerId" element={<KioskRoute><KioskSuccess /></KioskRoute>} />
      <Route path="/" element={<ProtectedRoute roles={['DANCER', 'INSTRUCTOR', 'ADMIN']}>{currentUser?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : currentUser?.role === 'INSTRUCTOR' ? <Navigate to="/instructor" replace /> : <DancerDashboard />}</ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute roles={['DANCER']}><DancerDashboard /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute roles={['DANCER']}><DancerSessions /></ProtectedRoute>} />
      <Route path="/sessions/:sessionId" element={<ProtectedRoute roles={['DANCER']}><DancerSessionDetail /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute roles={['DANCER']}><DancerCalendar /></ProtectedRoute>} />
      <Route path="/my-schedule" element={<ProtectedRoute roles={['DANCER']}><DancerMySchedule /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute roles={['DANCER']}><DancerAttendance /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={['DANCER']}><DancerProfile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute roles={['DANCER']}><DancerSettings /></ProtectedRoute>} />
      <Route path="/instructor" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorDashboard /></ProtectedRoute>} />
      <Route path="/instructor/sessions" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorSessions /></ProtectedRoute>} />
      <Route path="/instructor/calendar" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorCalendar /></ProtectedRoute>} />
      <Route path="/instructor/sessions/new" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorNewSession /></ProtectedRoute>} />
      <Route path="/instructor/sessions/:sessionId" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorSessionDetail /></ProtectedRoute>} />
      <Route path="/instructor/sessions/:sessionId/attendance" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorSessionAttendance /></ProtectedRoute>} />
      <Route path="/instructor/availability" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorAvailabilityPage /></ProtectedRoute>} />
      <Route path="/instructor/settings" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorSettings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/schedule" element={<ProtectedRoute roles={['ADMIN']}><AdminSchedule /></ProtectedRoute>} />
      <Route path="/admin/sessions" element={<ProtectedRoute roles={['ADMIN']}><AdminSessions /></ProtectedRoute>} />
      <Route path="/admin/calendar" element={<ProtectedRoute roles={['ADMIN']}><AdminCalendar /></ProtectedRoute>} />
      <Route path="/admin/dancers" element={<ProtectedRoute roles={['ADMIN']}><AdminDancers /></ProtectedRoute>} />
      <Route path="/admin/instructors" element={<ProtectedRoute roles={['ADMIN']}><AdminInstructors /></ProtectedRoute>} />
      <Route path="/admin/rooms" element={<ProtectedRoute roles={['ADMIN']}><AdminRooms /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute roles={['ADMIN']}><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={['ADMIN']}><AdminSettings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}
