import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  User, DancerProfile, InstructorProfile, Room, Session,
  Registration, Attendance, InstructorAvailability, Announcement,
  KioskSession, AttendanceStatus, AttendanceSource
} from './types';

const today = new Date();

const seedUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@grvmnt.test', role: 'ADMIN', isActive: true, avatar: '#824fb7' },
  { id: 'u2', name: 'Cherrie', email: 'cherrie@grvmnt.test', role: 'INSTRUCTOR', isActive: true, biography: 'Hip hop and contemporary specialist with 10+ years experience.', avatar: '#421c89' },
  { id: 'u3', name: 'Joaquin Garcia', email: 'joaquin@grvmnt.test', role: 'INSTRUCTOR', isActive: true, biography: 'Popping and locking expert.', avatar: '#6d3f9a' },
  { id: 'u4', name: 'Manny Wong', email: 'manny@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#d8aafb' },
  { id: 'u5', name: 'Jamey Laoroekutai', email: 'jamey@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#824fb7' },
  { id: 'u6', name: 'Man Vo', email: 'man@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#421c89' },
  { id: 'u7', name: 'Hikaru Un', email: 'hikaru@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#6d3f9a' },
  { id: 'u8', name: 'Sogo Matsuda', email: 'sogo@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#d8aafb' },
  { id: 'u9', name: 'Alex Martinez', email: 'alex@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#824fb7' },
  { id: 'u10', name: 'Jamie Chen', email: 'jamie@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#421c89' },
  { id: 'u11', name: 'Taylor Singh', email: 'taylor@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#6d3f9a' },
  { id: 'u12', name: 'Morgan Lee', email: 'morgan@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#d8aafb' },
  { id: 'u13', name: 'Riley Johnson', email: 'riley@grvmnt.test', role: 'DANCER', isActive: true, avatar: '#824fb7' },
];

const seedDancerProfiles: DancerProfile[] = [
  { id: 'dp1', userId: 'u4', danceStyles: ['Hip Hop', 'Breaking'], kioskEnabled: true },
  { id: 'dp2', userId: 'u5', danceStyles: ['Popping', 'Locking'], kioskEnabled: true },
  { id: 'dp3', userId: 'u6', danceStyles: ['Hip Hop', 'House'], kioskEnabled: true },
  { id: 'dp4', userId: 'u7', danceStyles: ['Contemporary', 'Hip Hop'], kioskEnabled: true },
  { id: 'dp5', userId: 'u8', danceStyles: ['Breaking', 'Hip Hop'], kioskEnabled: true },
  { id: 'dp6', userId: 'u9', danceStyles: ['Hip Hop'], kioskEnabled: false, dateOfBirth: '2015-03-15' },
  { id: 'dp7', userId: 'u10', danceStyles: ['Popping', 'Locking'], kioskEnabled: false, dateOfBirth: '2014-07-22' },
  { id: 'dp8', userId: 'u11', danceStyles: ['House', 'Hip Hop'], kioskEnabled: false, dateOfBirth: '2016-01-10' },
  { id: 'dp9', userId: 'u12', danceStyles: ['Hip Hop', 'Afrobeats'], kioskEnabled: false, dateOfBirth: '2015-09-05' },
  { id: 'dp10', userId: 'u13', danceStyles: ['Breaking'], kioskEnabled: false, dateOfBirth: '2016-11-20' },
];

const seedInstructorProfiles: InstructorProfile[] = [
  { id: 'ip1', userId: 'u2', danceStylesTaught: ['Hip Hop', 'Contemporary', 'House'] },
  { id: 'ip2', userId: 'u3', danceStylesTaught: ['Popping', 'Locking', 'Breaking'] },
];

const seedRooms: Room[] = [
  { id: 'r1', name: 'Studio A', capacity: 25, isActive: true, image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=600&fit=crop' },
  { id: 'r2', name: 'Studio B', capacity: 15, isActive: true, image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop' },
  { id: 'r3', name: 'Studio C', capacity: 10, isActive: true, image: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800&h=600&fit=crop' },
];

const danceStyleImages: Record<string, string> = {
  'Hip Hop': 'https://images.unsplash.com/photo-1547153725-6c91c404c9a8?w=800&h=600&fit=crop',
  'Breaking': 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=600&fit=crop',
  'Popping': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop',
  'House': 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=600&fit=crop',
  'Locking': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop',
};

function makeTime(hour: number, minute: number = 0, dayOffset: number = 0): string {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function makeTimePast(hour: number, minute: number = 0, daysAgo: number = 0): string {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const seedSessions: Session[] = [
  { id: 's1', title: 'Hip Hop Fundamentals', danceStyle: 'Hip Hop', instructorId: 'u2', roomId: 'r1', startsAt: makeTime(18, 0, 0), endsAt: makeTime(19, 0, 0), capacity: 20, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Hip Hop'] },
  { id: 's2', title: 'Beginner Popping', danceStyle: 'Popping', instructorId: 'u3', roomId: 'r2', startsAt: makeTime(19, 30, 0), endsAt: makeTime(20, 30, 0), capacity: 15, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Popping'] },
  { id: 's3', title: 'Advanced Choreo', danceStyle: 'Hip Hop', instructorId: 'u2', roomId: 'r1', startsAt: makeTime(20, 0, 0), endsAt: makeTime(21, 30, 0), capacity: 20, status: 'SCHEDULED', allowWalkIns: false, createdById: 'u1', image: danceStyleImages['Hip Hop'] },
  { id: 's4', title: 'House Grooves', danceStyle: 'House', instructorId: 'u2', roomId: 'r2', startsAt: makeTime(17, 0, 0), endsAt: makeTime(18, 0, 0), capacity: 12, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['House'] },
  { id: 's5', title: 'Locking Basics', danceStyle: 'Locking', instructorId: 'u3', roomId: 'r3', startsAt: makeTime(18, 30, 0), endsAt: makeTime(19, 30, 0), capacity: 10, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Locking'] },
  { id: 's6', title: 'Hip Hop Fundamentals', danceStyle: 'Hip Hop', instructorId: 'u2', roomId: 'r1', startsAt: makeTime(18, 0, 1), endsAt: makeTime(19, 0, 1), capacity: 20, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Hip Hop'] },
  { id: 's7', title: 'Open Choreo', danceStyle: 'Hip Hop', instructorId: 'u3', roomId: 'r2', startsAt: makeTimePast(18, 0, 1), endsAt: makeTimePast(19, 0, 1), capacity: 15, status: 'COMPLETED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Hip Hop'] },
  { id: 's8', title: 'Breaking Foundations', danceStyle: 'Breaking', instructorId: 'u2', roomId: 'r1', startsAt: makeTimePast(18, 0, 2), endsAt: makeTimePast(19, 30, 2), capacity: 18, status: 'COMPLETED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Breaking'] },
];

const seedRegistrations: Registration[] = [
  { id: 'reg1', sessionId: 's1', dancerId: 'u4', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(10, 0, 0) },
  { id: 'reg2', sessionId: 's1', dancerId: 'u5', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(10, 30, 0) },
  { id: 'reg3', sessionId: 's1', dancerId: 'u7', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(11, 0, 0) },
  { id: 'reg4', sessionId: 's2', dancerId: 'u5', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(9, 0, 0) },
  { id: 'reg5', sessionId: 's2', dancerId: 'u10', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(9, 30, 0) },
  { id: 'reg6', sessionId: 's1', dancerId: 'u6', status: 'REGISTERED', source: 'ADMIN', registeredAt: makeTime(8, 0, 0) },
  { id: 'reg7', sessionId: 's1', dancerId: 'u8', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(12, 0, 0) },
  { id: 'reg8', sessionId: 's3', dancerId: 'u4', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(10, 0, 0) },
  { id: 'reg9', sessionId: 's3', dancerId: 'u7', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(10, 30, 0) },
  { id: 'reg10', sessionId: 's4', dancerId: 'u8', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(11, 0, 0) },
  { id: 'reg11', sessionId: 's5', dancerId: 'u10', status: 'REGISTERED', source: 'WEB', registeredAt: makeTime(11, 30, 0) },
  { id: 'reg12', sessionId: 's1', dancerId: 'u9', status: 'REGISTERED', source: 'ADMIN', registeredAt: makeTime(8, 30, 0) },
  { id: 'reg13', sessionId: 's1', dancerId: 'u11', status: 'REGISTERED', source: 'ADMIN', registeredAt: makeTime(9, 0, 0) },
  { id: 'reg14', sessionId: 's7', dancerId: 'u4', status: 'REGISTERED', source: 'WEB', registeredAt: makeTimePast(10, 0, 1) },
  { id: 'reg15', sessionId: 's7', dancerId: 'u5', status: 'REGISTERED', source: 'WEB', registeredAt: makeTimePast(10, 30, 1) },
  { id: 'reg16', sessionId: 's8', dancerId: 'u8', status: 'REGISTERED', source: 'WEB', registeredAt: makeTimePast(11, 0, 2) },
];

const seedAttendance: Attendance[] = [
  { id: 'att1', sessionId: 's7', dancerId: 'u4', status: 'PRESENT', source: 'KIOSK', checkedInAt: makeTime(17, 54, -1) },
  { id: 'att2', sessionId: 's7', dancerId: 'u5', status: 'LATE', source: 'INSTRUCTOR', markedById: 'u3' },
  { id: 'att3', sessionId: 's8', dancerId: 'u8', status: 'PRESENT', source: 'KIOSK', checkedInAt: makeTime(17, 58, -2) },
  { id: 'att4', sessionId: 's1', dancerId: 'u7', status: 'PRESENT', source: 'KIOSK', checkedInAt: makeTime(17, 55, 0) },
  { id: 'att5', sessionId: 's1', dancerId: 'u8', status: 'PRESENT', source: 'KIOSK', checkedInAt: makeTime(17, 58, 0) },
];

const seedAvailability: InstructorAvailability[] = [
  { id: 'av1', instructorId: 'u2', startsAt: makeTime(16, 0, 1), endsAt: makeTime(22, 0, 1), notes: 'Available all evening' },
  { id: 'av2', instructorId: 'u2', startsAt: makeTime(16, 0, 2), endsAt: makeTime(22, 0, 2), notes: 'Available all evening' },
  { id: 'av3', instructorId: 'u3', startsAt: makeTime(18, 0, 1), endsAt: makeTime(21, 0, 1), notes: 'Evening only' },
  { id: 'av4', instructorId: 'u3', startsAt: makeTime(10, 0, 3), endsAt: makeTime(14, 0, 3), notes: 'Morning availability' },
];

const seedAnnouncements: Announcement[] = [
  { id: 'a1', authorId: 'u1', title: 'Studio Closed Monday', message: 'The studio will be closed this Monday for maintenance. All Monday classes are cancelled.', audience: 'ALL', createdAt: makeTime(9, 0, -1) },
  { id: 'a2', authorId: 'u1', title: 'Audition Workshop', message: 'Open audition workshop this Saturday at 2 PM. All styles welcome! Sign up at the front desk.', audience: 'DANCERS', createdAt: makeTime(10, 0, -2) },
  { id: 'a3', authorId: 'u2', title: 'Schedule Change', message: 'Thursday House class moved to Studio A starting next week.', audience: 'ALL', createdAt: makeTime(14, 0, 0) },
];

interface AppState {
  currentUser: User | null;
  users: User[];
  dancerProfiles: DancerProfile[];
  instructorProfiles: InstructorProfile[];
  rooms: Room[];
  sessions: Session[];
  registrations: Registration[];
  attendance: Attendance[];
  availability: InstructorAvailability[];
  announcements: Announcement[];
  kiosk: KioskSession;
}

interface AppContextType extends AppState {
  login: (email: string) => boolean;
  logout: () => void;
  registerDancer: (dancerId: string, sessionId: string) => { success: boolean; message: string };
  cancelRegistration: (dancerId: string, sessionId: string) => void;
  checkInDancer: (dancerId: string, sessionId: string) => { success: boolean; message: string; alreadyCheckedIn?: boolean };
  markAttendance: (sessionId: string, dancerId: string, status: AttendanceStatus, source: AttendanceSource, markedById: string) => void;
  createSession: (session: Omit<Session, 'id'>) => { success: boolean; message: string };
  updateSession: (id: string, updates: Partial<Session>) => void;
  cancelSession: (id: string) => void;
  completeSession: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deactivateUser: (id: string) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  setAvailability: (instructorId: string, slots: Omit<InstructorAvailability, 'id' | 'instructorId'>[]) => void;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  activateKiosk: () => void;
  deactivateKiosk: () => void;
  getRegistrationCount: (sessionId: string) => number;
  getAttendanceCount: (sessionId: string) => number;
  getDancerAttendance: (dancerId: string) => Attendance[];
  getSessionRegistrations: (sessionId: string) => Registration[];
  getSessionAttendance: (sessionId: string) => Attendance[];
  getUserById: (id: string) => User | undefined;
  getRoomById: (id: string) => Room | undefined;
  getDancerProfile: (userId: string) => DancerProfile | undefined;
  getInstructorProfile: (userId: string) => InstructorProfile | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: seedUsers,
    dancerProfiles: seedDancerProfiles,
    instructorProfiles: seedInstructorProfiles,
    rooms: seedRooms,
    sessions: seedSessions,
    registrations: seedRegistrations,
    attendance: seedAttendance,
    availability: seedAvailability,
    announcements: seedAnnouncements,
    kiosk: { isActive: false },
  });

  const login = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const user = state.users.find(u => u.email === email.trim().toLowerCase() && u.isActive);
    if (user) {
      setState(s => ({ ...s, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => setState(s => ({ ...s, currentUser: null }));

  const registerDancer = (dancerId: string, sessionId: string) => {
    if (!dancerId || !sessionId) return { success: false, message: 'Invalid parameters.' };
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return { success: false, message: 'Session not found.' };
    if (session.status !== 'SCHEDULED') return { success: false, message: 'Session is not available.' };
    const existing = state.registrations.find(r => r.sessionId === sessionId && r.dancerId === dancerId && r.status === 'REGISTERED');
    if (existing) return { success: false, message: 'Already registered.' };
    const activeCount = state.registrations.filter(r => r.sessionId === sessionId && r.status === 'REGISTERED').length;
    if (activeCount >= session.capacity) return { success: false, message: 'This class is full.' };
    const newReg: Registration = { id: uuidv4(), sessionId, dancerId, status: 'REGISTERED', source: 'WEB', registeredAt: new Date().toISOString() };
    setState(s => ({ ...s, registrations: [...s.registrations, newReg] }));
    return { success: true, message: 'Successfully registered!' };
  };

  const cancelRegistration = (dancerId: string, sessionId: string) => {
    if (!dancerId || !sessionId) return;
    setState(s => ({
      ...s,
      registrations: s.registrations.map(r =>
        r.sessionId === sessionId && r.dancerId === dancerId && r.status === 'REGISTERED'
          ? { ...r, status: 'CANCELLED' as const, cancelledAt: new Date().toISOString() }
          : r
      )
    }));
  };

  const checkInDancer = (dancerId: string, sessionId: string) => {
    if (!dancerId || !sessionId) return { success: false, message: 'Invalid parameters.' };
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return { success: false, message: 'Session not found.' };
    if (session.status === 'CANCELLED') return { success: false, message: 'This class has been cancelled.' };
    if (session.status === 'COMPLETED') return { success: false, message: 'This class has already ended.' };
    const existingAttendance = state.attendance.find(a => a.sessionId === sessionId && a.dancerId === dancerId && (a.status === 'PRESENT' || a.status === 'LATE'));
    if (existingAttendance) return { success: true, message: "You're already checked in.", alreadyCheckedIn: true };
    const registration = state.registrations.find(r => r.sessionId === sessionId && r.dancerId === dancerId && r.status === 'REGISTERED');
    setState(s => {
      let newRegistrations = [...s.registrations];
      let newAttendance = [...s.attendance];
      if (!registration) {
        if (!session.allowWalkIns) return s;
        const activeCount = s.registrations.filter(r => r.sessionId === sessionId && r.status === 'REGISTERED').length;
        if (activeCount >= session.capacity) return s;
        const newReg: Registration = { id: uuidv4(), sessionId, dancerId, status: 'REGISTERED', source: 'KIOSK', registeredAt: new Date().toISOString() };
        newRegistrations = [...newRegistrations, newReg];
      }
      const newAtt: Attendance = { id: uuidv4(), sessionId, dancerId, status: 'PRESENT', source: 'KIOSK', checkedInAt: new Date().toISOString() };
      newAttendance = [...newAttendance, newAtt];
      return { ...s, registrations: newRegistrations, attendance: newAttendance };
    });
    return { success: true, message: "You're checked in!" };
  };

  const markAttendance = (sessionId: string, dancerId: string, status: AttendanceStatus, source: AttendanceSource, markedById: string) => {
    if (!sessionId || !dancerId || !markedById) return;
    setState(s => {
      const existing = s.attendance.find(a => a.sessionId === sessionId && a.dancerId === dancerId);
      if (existing) {
        return { ...s, attendance: s.attendance.map(a => a.id === existing.id ? { ...a, status, source, markedById } : a) };
      }
      const newAtt: Attendance = { id: uuidv4(), sessionId, dancerId, status, source, markedById, checkedInAt: status === 'PRESENT' || status === 'LATE' ? new Date().toISOString() : undefined };
      return { ...s, attendance: [...s.attendance, newAtt] };
    });
  };

  const createSession = (session: Omit<Session, 'id'>) => {
    if (!session.title || !session.instructorId || !session.roomId || !session.startsAt || !session.endsAt) return { success: false, message: 'Missing required fields.' };
    const startsAtDate = new Date(session.startsAt);
    const endsAtDate = new Date(session.endsAt);
    if (startsAtDate >= endsAtDate) return { success: false, message: 'End time must be after start time.' };
    if (session.capacity <= 0) return { success: false, message: 'Capacity must be greater than 0.' };
    const room = state.rooms.find(r => r.id === session.roomId);
    if (room && session.capacity > room.capacity) return { success: false, message: `Capacity cannot exceed room capacity of ${room.capacity}.` };
    const roomConflict = state.sessions.find(s => s.roomId === session.roomId && s.status !== 'CANCELLED' && new Date(s.startsAt) < endsAtDate && new Date(s.endsAt) > startsAtDate);
    if (roomConflict) return { success: false, message: 'Room is already booked for this time.' };
    const instructorConflict = state.sessions.find(s => s.instructorId === session.instructorId && s.status !== 'CANCELLED' && new Date(s.startsAt) < endsAtDate && new Date(s.endsAt) > startsAtDate);
    if (instructorConflict) return { success: false, message: 'Instructor is already teaching at this time.' };
    const newSession: Session = { ...session, id: uuidv4() };
    setState(s => ({ ...s, sessions: [...s.sessions, newSession] }));
    return { success: true, message: 'Session created!' };
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    if (!id) return;
    setState(s => ({ ...s, sessions: s.sessions.map(sess => sess.id === id ? { ...sess, ...updates } : sess) }));
  };

  const cancelSession = (id: string) => {
    if (!id) return;
    setState(s => ({ ...s, sessions: s.sessions.map(sess => sess.id === id ? { ...sess, status: 'CANCELLED' as const } : sess) }));
  };

  const completeSession = (id: string) => {
    if (!id) return;
    setState(s => ({ ...s, sessions: s.sessions.map(sess => sess.id === id ? { ...sess, status: 'COMPLETED' as const } : sess) }));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    if (!user.name || !user.email) return;
    const newUser: User = { ...user, id: uuidv4() };
    setState(s => {
      let newState = { ...s, users: [...s.users, newUser] };
      if (user.role === 'DANCER') newState.dancerProfiles = [...s.dancerProfiles, { id: uuidv4(), userId: newUser.id, danceStyles: [], kioskEnabled: true }];
      else if (user.role === 'INSTRUCTOR') newState.instructorProfiles = [...s.instructorProfiles, { id: uuidv4(), userId: newUser.id, danceStylesTaught: [] }];
      return newState;
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    if (!id) return;
    setState(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, ...updates } : u) }));
  };

  const deactivateUser = (id: string) => {
    if (!id) return;
    setState(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, isActive: false } : u) }));
  };

  const addRoom = (room: Omit<Room, 'id'>) => {
    if (!room.name || room.capacity <= 0) return;
    const newRoom: Room = { ...room, id: uuidv4() };
    setState(s => ({ ...s, rooms: [...s.rooms, newRoom] }));
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    if (!id) return;
    setState(s => ({ ...s, rooms: s.rooms.map(r => r.id === id ? { ...r, ...updates } : r) }));
  };

  const setAvailability = (instructorId: string, slots: Omit<InstructorAvailability, 'id' | 'instructorId'>[]) => {
    if (!instructorId) return;
    setState(s => {
      const filtered = s.availability.filter(a => a.instructorId !== instructorId);
      const newSlots = slots.map(slot => ({ ...slot, id: uuidv4(), instructorId }));
      return { ...s, availability: [...filtered, ...newSlots] };
    });
  };

  const createAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    if (!announcement.title || !announcement.message || !announcement.authorId) return;
    const newAnn: Announcement = { ...announcement, id: uuidv4(), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, announcements: [...s.announcements, newAnn] }));
  };

  const deleteAnnouncement = (id: string) => {
    if (!id) return;
    setState(s => ({ ...s, announcements: s.announcements.filter(a => a.id !== id) }));
  };

  const activateKiosk = () => setState(s => ({ ...s, kiosk: { isActive: true, token: uuidv4() } }));
  const deactivateKiosk = () => setState(s => ({ ...s, kiosk: { isActive: false, token: undefined } }));

  const getRegistrationCount = (sessionId: string) => state.registrations.filter(r => r.sessionId === sessionId && r.status === 'REGISTERED').length;
  const getAttendanceCount = (sessionId: string) => state.attendance.filter(a => a.sessionId === sessionId && (a.status === 'PRESENT' || a.status === 'LATE')).length;
  const getDancerAttendance = (dancerId: string) => state.attendance.filter(a => a.dancerId === dancerId);
  const getSessionRegistrations = (sessionId: string) => state.registrations.filter(r => r.sessionId === sessionId && r.status === 'REGISTERED');
  const getSessionAttendance = (sessionId: string) => state.attendance.filter(a => a.sessionId === sessionId);
  const getUserById = (id: string) => state.users.find(u => u.id === id);
  const getRoomById = (id: string) => state.rooms.find(r => r.id === id);
  const getDancerProfile = (userId: string) => state.dancerProfiles.find(d => d.userId === userId);
  const getInstructorProfile = (userId: string) => state.instructorProfiles.find(i => i.userId === userId);

  const value: AppContextType = {
    ...state, login, logout, registerDancer, cancelRegistration, checkInDancer,
    markAttendance, createSession, updateSession, cancelSession, completeSession,
    addUser, updateUser, deactivateUser, addRoom, updateRoom, setAvailability,
    createAnnouncement, deleteAnnouncement, activateKiosk, deactivateKiosk,
    getRegistrationCount, getAttendanceCount, getDancerAttendance,
    getSessionRegistrations, getSessionAttendance, getUserById, getRoomById,
    getDancerProfile, getInstructorProfile
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
