import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  User, DancerProfile, InstructorProfile, Room, Session,
  Registration, Attendance, InstructorAvailability, Announcement,
  KioskSession, AttendanceStatus, AttendanceSource,
  Team, TeamMembership, TeamCoach, Guardian, GuardianDancerLink,
  Fee, Invoice, Payment, PaymentAllocation
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
  { id: 'u14', name: 'Sarah Martinez', email: 'sarah@grvmnt.test', role: 'PARENT', isActive: true, avatar: '#d8aafb' },
  { id: 'u15', name: 'David Singh', email: 'david@grvmnt.test', role: 'PARENT', isActive: true, avatar: '#824fb7' },
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
  'Contemporary': 'https://image.qwenlm.ai/generated-images/ffb07fbe-89e5-491d-9cb0-8d6b6bdd6988/_result.png',
  'Afrobeats': 'https://image.qwenlm.ai/generated-images/c6dd8d12-f4aa-4c61-afdf-856de11281d1/_result.png',
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
  { id: 's1', title: 'Hip Hop Fundamentals', danceStyle: 'Hip Hop', instructorId: 'u2', roomId: 'r1', startsAt: makeTime(18, 0, 0), endsAt: makeTime(19, 0, 0), capacity: 20, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Hip Hop'], level: 'beginner' },
  { id: 's2', title: 'Beginner Popping', danceStyle: 'Popping', instructorId: 'u3', roomId: 'r2', startsAt: makeTime(19, 30, 0), endsAt: makeTime(20, 30, 0), capacity: 15, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Popping'], level: 'beginner' },
  { id: 's3', title: 'Advanced Choreo', danceStyle: 'Hip Hop', instructorId: 'u2', roomId: 'r1', startsAt: makeTime(20, 0, 0), endsAt: makeTime(21, 30, 0), capacity: 20, status: 'SCHEDULED', allowWalkIns: false, createdById: 'u1', image: danceStyleImages['Hip Hop'], level: 'advanced' },
  { id: 's4', title: 'House Grooves', danceStyle: 'House', instructorId: 'u2', roomId: 'r2', startsAt: makeTime(17, 0, 0), endsAt: makeTime(18, 0, 0), capacity: 12, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['House'], level: 'intermediate' },
  { id: 's5', title: 'Locking Basics', danceStyle: 'Locking', instructorId: 'u3', roomId: 'r3', startsAt: makeTime(18, 30, 0), endsAt: makeTime(19, 30, 0), capacity: 10, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Locking'], level: 'beginner' },
  { id: 's6', title: 'Hip Hop Fundamentals', danceStyle: 'Hip Hop', instructorId: 'u2', roomId: 'r1', startsAt: makeTime(18, 0, 1), endsAt: makeTime(19, 0, 1), capacity: 20, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Hip Hop'], level: 'beginner' },
  { id: 's7', title: 'Open Choreo', danceStyle: 'Hip Hop', instructorId: 'u3', roomId: 'r2', startsAt: makeTimePast(18, 0, 1), endsAt: makeTimePast(19, 0, 1), capacity: 15, status: 'COMPLETED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Hip Hop'], level: 'intermediate' },
  { id: 's8', title: 'Breaking Foundations', danceStyle: 'Breaking', instructorId: 'u2', roomId: 'r1', startsAt: makeTimePast(18, 0, 2), endsAt: makeTimePast(19, 30, 2), capacity: 18, status: 'COMPLETED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Breaking'], level: 'beginner' },
  { id: 's9', title: 'Contemporary Flow', danceStyle: 'Contemporary', instructorId: 'u2', roomId: 'r2', startsAt: makeTime(19, 0, 2), endsAt: makeTime(20, 30, 2), capacity: 15, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Contemporary'], level: 'intermediate' },
  { id: 's10', title: 'Afrobeats Vibes', danceStyle: 'Afrobeats', instructorId: 'u3', roomId: 'r1', startsAt: makeTime(17, 30, 3), endsAt: makeTime(18, 30, 3), capacity: 20, status: 'SCHEDULED', allowWalkIns: true, createdById: 'u1', image: danceStyleImages['Afrobeats'], level: 'intermediate' },
  { id: 's11', title: 'Contemporary Expressions', danceStyle: 'Contemporary', instructorId: 'u2', roomId: 'r3', startsAt: makeTime(16, 0, 4), endsAt: makeTime(17, 30, 4), capacity: 12, status: 'SCHEDULED', allowWalkIns: false, createdById: 'u1', image: danceStyleImages['Contemporary'], level: 'advanced' },
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

// Teams seed data
const seedTeams: Team[] = [
  { id: 't1', name: 'Junior Hip Hop', description: 'Competitive hip hop team for ages 8-12', ageRangeMin: 8, ageRangeMax: 12, skillLevel: 'intermediate', status: 'ACTIVE', calendarColor: '#824fb7', createdById: 'u1', createdAt: makeTimePast(9, 0, 30) },
  { id: 't2', name: 'Senior Breaking', description: 'Advanced breaking crew for competitions', ageRangeMin: 13, ageRangeMax: 18, skillLevel: 'advanced', status: 'ACTIVE', calendarColor: '#421c89', createdById: 'u1', createdAt: makeTimePast(9, 0, 30) },
  { id: 't3', name: 'Contemporary Ensemble', description: 'Contemporary dance team focusing on artistic expression', ageRangeMin: 10, ageRangeMax: 16, skillLevel: 'intermediate', status: 'ACTIVE', calendarColor: '#6d3f9a', createdById: 'u1', createdAt: makeTimePast(9, 0, 30) },
];

const seedTeamMemberships: TeamMembership[] = [
  { id: 'tm1', teamId: 't1', dancerId: 'u4', status: 'ACTIVE', startDate: makeTimePast(9, 0, 25), createdAt: makeTimePast(9, 0, 25) },
  { id: 'tm2', teamId: 't1', dancerId: 'u5', status: 'ACTIVE', startDate: makeTimePast(9, 0, 25), createdAt: makeTimePast(9, 0, 25) },
  { id: 'tm3', teamId: 't1', dancerId: 'u9', status: 'ACTIVE', startDate: makeTimePast(9, 0, 20), createdAt: makeTimePast(9, 0, 20) },
  { id: 'tm4', teamId: 't2', dancerId: 'u6', status: 'ACTIVE', startDate: makeTimePast(9, 0, 25), createdAt: makeTimePast(9, 0, 25) },
  { id: 'tm5', teamId: 't2', dancerId: 'u8', status: 'ACTIVE', startDate: makeTimePast(9, 0, 25), createdAt: makeTimePast(9, 0, 25) },
  { id: 'tm6', teamId: 't3', dancerId: 'u7', status: 'ACTIVE', startDate: makeTimePast(9, 0, 25), createdAt: makeTimePast(9, 0, 25) },
  { id: 'tm7', teamId: 't1', dancerId: 'u6', status: 'ACTIVE', startDate: makeTimePast(9, 0, 15), createdAt: makeTimePast(9, 0, 15) }, // u6 in multiple teams
];

const seedTeamCoaches: TeamCoach[] = [
  { id: 'tc1', teamId: 't1', instructorId: 'u2', assignedAt: makeTimePast(9, 0, 30) },
  { id: 'tc2', teamId: 't2', instructorId: 'u3', assignedAt: makeTimePast(9, 0, 30) },
  { id: 'tc3', teamId: 't3', instructorId: 'u2', assignedAt: makeTimePast(9, 0, 30) },
];

// Guardian/Family seed data
const seedGuardians: Guardian[] = [
  { id: 'g1', userId: 'u14', relationship: 'Parent', createdAt: makeTimePast(9, 0, 30) },
  { id: 'g2', userId: 'u15', relationship: 'Parent', createdAt: makeTimePast(9, 0, 30) },
];

const seedGuardianDancerLinks: GuardianDancerLink[] = [
  { id: 'gdl1', guardianId: 'g1', dancerId: 'u9', verifiedAt: makeTimePast(9, 0, 30), verifiedById: 'u1', createdAt: makeTimePast(9, 0, 30) },
  { id: 'gdl2', guardianId: 'g1', dancerId: 'u10', verifiedAt: makeTimePast(9, 0, 30), verifiedById: 'u1', createdAt: makeTimePast(9, 0, 30) },
  { id: 'gdl3', guardianId: 'g2', dancerId: 'u11', verifiedAt: makeTimePast(9, 0, 30), verifiedById: 'u1', createdAt: makeTimePast(9, 0, 30) },
];

// Financial seed data
const seedFees: Fee[] = [
  { id: 'f1', name: 'Monthly Tuition - Junior Hip Hop', category: 'TUITION', amount: 15000, currency: 'CAD', billingPeriod: 'MONTHLY', teamId: 't1', createdById: 'u1', createdAt: makeTimePast(9, 0, 30) },
  { id: 'f2', name: 'Competition Registration Fee', category: 'COMPETITION', amount: 7500, currency: 'CAD', teamId: 't1', createdById: 'u1', createdAt: makeTimePast(9, 0, 20) },
  { id: 'f3', name: 'Costume Fee', category: 'COSTUME', amount: 12000, currency: 'CAD', teamId: 't2', createdById: 'u1', createdAt: makeTimePast(9, 0, 15) },
];

const seedInvoices: Invoice[] = [
  { id: 'inv1', dancerId: 'u4', feeId: 'f1', amount: 15000, currency: 'CAD', status: 'PAID', dueDate: makeTime(9, 0, 5), teamId: 't1', payerId: 'g1', createdById: 'u1', createdAt: makeTimePast(9, 0, 10) },
  { id: 'inv2', dancerId: 'u5', feeId: 'f1', amount: 15000, currency: 'CAD', status: 'PAID', dueDate: makeTime(9, 0, 5), teamId: 't1', payerId: 'g1', createdById: 'u1', createdAt: makeTimePast(9, 0, 10) },
  { id: 'inv3', dancerId: 'u9', feeId: 'f1', amount: 15000, currency: 'CAD', status: 'OVERDUE', dueDate: makeTimePast(9, 0, 2), teamId: 't1', payerId: 'g1', createdById: 'u1', createdAt: makeTimePast(9, 0, 10) },
  { id: 'inv4', dancerId: 'u6', feeId: 'f3', amount: 12000, currency: 'CAD', status: 'PARTIALLY_PAID', dueDate: makeTime(9, 0, 10), teamId: 't2', createdById: 'u1', createdAt: makeTimePast(9, 0, 15) },
];

const seedPayments: Payment[] = [
  { id: 'p1', invoiceId: 'inv1', amount: 15000, currency: 'CAD', method: 'E_TRANSFER', status: 'COMPLETED', reference: 'ET-001', recordedById: 'u1', recordedAt: makeTimePast(9, 0, 8), verifiedAt: makeTimePast(9, 0, 7), verifiedById: 'u1' },
  { id: 'p2', invoiceId: 'inv2', amount: 15000, currency: 'CAD', method: 'E_TRANSFER', status: 'COMPLETED', reference: 'ET-002', recordedById: 'u1', recordedAt: makeTimePast(9, 0, 8), verifiedAt: makeTimePast(9, 0, 7), verifiedById: 'u1' },
  { id: 'p3', invoiceId: 'inv4', amount: 6000, currency: 'CAD', method: 'E_TRANSFER', status: 'COMPLETED', reference: 'ET-003', recordedById: 'u1', recordedAt: makeTimePast(9, 0, 12), verifiedAt: makeTimePast(9, 0, 11), verifiedById: 'u1' },
];

const seedPaymentAllocations: PaymentAllocation[] = [
  { id: 'pa1', paymentId: 'p1', invoiceId: 'inv1', amount: 15000, createdAt: makeTimePast(9, 0, 7) },
  { id: 'pa2', paymentId: 'p2', invoiceId: 'inv2', amount: 15000, createdAt: makeTimePast(9, 0, 7) },
  { id: 'pa3', paymentId: 'p3', invoiceId: 'inv4', amount: 6000, createdAt: makeTimePast(9, 0, 11) },
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
  // New entities
  teams: Team[];
  teamMemberships: TeamMembership[];
  teamCoaches: TeamCoach[];
  guardians: Guardian[];
  guardianDancerLinks: GuardianDancerLink[];
  fees: Fee[];
  invoices: Invoice[];
  payments: Payment[];
  paymentAllocations: PaymentAllocation[];
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
  // Team functions
  createTeam: (team: Omit<Team, 'id' | 'createdAt'>) => { success: boolean; message: string };
  updateTeam: (id: string, updates: Partial<Team>) => void;
  archiveTeam: (id: string) => void;
  addTeamMember: (teamId: string, dancerId: string) => { success: boolean; message: string };
  removeTeamMember: (membershipId: string) => void;
  assignCoach: (teamId: string, instructorId: string) => void;
  removeCoach: (coachId: string) => void;
  getTeamMembers: (teamId: string) => TeamMembership[];
  getTeamCoaches: (teamId: string) => TeamCoach[];
  getDancerTeams: (dancerId: string) => Team[];
  // Guardian/Family functions
  linkGuardianToDancer: (guardianId: string, dancerId: string) => void;
  unlinkGuardianFromDancer: (linkId: string) => void;
  getGuardianChildren: (guardianId: string) => User[];
  getDancerGuardians: (dancerId: string) => Guardian[];
  // Financial functions
  createFee: (fee: Omit<Fee, 'id' | 'createdAt'>) => void;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  recordPayment: (payment: Omit<Payment, 'id' | 'recordedAt'>) => { success: boolean; message: string };
  getDancerInvoices: (dancerId: string) => Invoice[];
  getDancerBalance: (dancerId: string) => number;
  getTeamInvoices: (teamId: string) => Invoice[];
  getInvoicePayments: (invoiceId: string) => Payment[];
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
    teams: seedTeams,
    teamMemberships: seedTeamMemberships,
    teamCoaches: seedTeamCoaches,
    guardians: seedGuardians,
    guardianDancerLinks: seedGuardianDancerLinks,
    fees: seedFees,
    invoices: seedInvoices,
    payments: seedPayments,
    paymentAllocations: seedPaymentAllocations,
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

  // Team functions
  const createTeam = (team: Omit<Team, 'id' | 'createdAt'>) => {
    if (!team.name || !team.createdById) return { success: false, message: 'Missing required fields.' };
    const newTeam: Team = { ...team, id: uuidv4(), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, teams: [...s.teams, newTeam] }));
    return { success: true, message: 'Team created!' };
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    if (!id) return;
    setState(s => ({ ...s, teams: s.teams.map(t => t.id === id ? { ...t, ...updates } : t) }));
  };

  const archiveTeam = (id: string) => {
    if (!id) return;
    setState(s => ({ ...s, teams: s.teams.map(t => t.id === id ? { ...t, status: 'ARCHIVED' as const } : t) }));
  };

  const addTeamMember = (teamId: string, dancerId: string) => {
    if (!teamId || !dancerId) return { success: false, message: 'Invalid parameters.' };
    const existing = state.teamMemberships.find(m => m.teamId === teamId && m.dancerId === dancerId && m.status === 'ACTIVE');
    if (existing) return { success: false, message: 'Dancer is already a member.' };
    const newMembership: TeamMembership = {
      id: uuidv4(), teamId, dancerId, status: 'ACTIVE',
      startDate: new Date().toISOString(), createdAt: new Date().toISOString()
    };
    setState(s => ({ ...s, teamMemberships: [...s.teamMemberships, newMembership] }));
    return { success: true, message: 'Member added!' };
  };

  const removeTeamMember = (membershipId: string) => {
    if (!membershipId) return;
    setState(s => ({
      ...s,
      teamMemberships: s.teamMemberships.map(m =>
        m.id === membershipId ? { ...m, status: 'WITHDRAWN' as const, endDate: new Date().toISOString() } : m
      )
    }));
  };

  const assignCoach = (teamId: string, instructorId: string) => {
    if (!teamId || !instructorId) return;
    const existing = state.teamCoaches.find(c => c.teamId === teamId && c.instructorId === instructorId);
    if (existing) return;
    const newCoach: TeamCoach = { id: uuidv4(), teamId, instructorId, assignedAt: new Date().toISOString() };
    setState(s => ({ ...s, teamCoaches: [...s.teamCoaches, newCoach] }));
  };

  const removeCoach = (coachId: string) => {
    if (!coachId) return;
    setState(s => ({ ...s, teamCoaches: s.teamCoaches.filter(c => c.id !== coachId) }));
  };

  const getTeamMembers = (teamId: string) => state.teamMemberships.filter(m => m.teamId === teamId && m.status === 'ACTIVE');
  const getTeamCoaches = (teamId: string) => state.teamCoaches.filter(c => c.teamId === teamId);
  const getDancerTeams = (dancerId: string) => {
    const memberships = state.teamMemberships.filter(m => m.dancerId === dancerId && m.status === 'ACTIVE');
    return memberships.map(m => state.teams.find(t => t.id === m.teamId)).filter((t): t is Team => !!t);
  };

  // Guardian/Family functions
  const linkGuardianToDancer = (guardianId: string, dancerId: string) => {
    if (!guardianId || !dancerId) return;
    const existing = state.guardianDancerLinks.find(l => l.guardianId === guardianId && l.dancerId === dancerId);
    if (existing) return;
    const newLink: GuardianDancerLink = {
      id: uuidv4(), guardianId, dancerId,
      verifiedAt: new Date().toISOString(), verifiedById: state.currentUser?.id,
      createdAt: new Date().toISOString()
    };
    setState(s => ({ ...s, guardianDancerLinks: [...s.guardianDancerLinks, newLink] }));
  };

  const unlinkGuardianFromDancer = (linkId: string) => {
    if (!linkId) return;
    setState(s => ({ ...s, guardianDancerLinks: s.guardianDancerLinks.filter(l => l.id !== linkId) }));
  };

  const getGuardianChildren = (guardianId: string) => {
    const links = state.guardianDancerLinks.filter(l => l.guardianId === guardianId);
    return links.map(l => state.users.find(u => u.id === l.dancerId)).filter((u): u is User => !!u);
  };

  const getDancerGuardians = (dancerId: string) => {
    const links = state.guardianDancerLinks.filter(l => l.dancerId === dancerId);
    return links.map(l => state.guardians.find(g => g.id === l.guardianId)).filter((g): g is Guardian => !!g);
  };

  // Financial functions
  const createFee = (fee: Omit<Fee, 'id' | 'createdAt'>) => {
    if (!fee.name || fee.amount <= 0 || !fee.createdById) return;
    const newFee: Fee = { ...fee, id: uuidv4(), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, fees: [...s.fees, newFee] }));
  };

  const createInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    if (!invoice.dancerId || invoice.amount <= 0 || !invoice.createdById) return;
    const newInvoice: Invoice = { ...invoice, id: uuidv4(), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, invoices: [...s.invoices, newInvoice] }));
  };

  const recordPayment = (payment: Omit<Payment, 'id' | 'recordedAt'>) => {
    if (!payment.invoiceId || payment.amount <= 0 || !payment.recordedById) {
      return { success: false, message: 'Invalid payment data.' };
    }
    const invoice = state.invoices.find(i => i.id === payment.invoiceId);
    if (!invoice) return { success: false, message: 'Invoice not found.' };
    
    // Calculate current balance
    const currentPayments = state.payments.filter(p => p.invoiceId === payment.invoiceId && p.status === 'COMPLETED');
    const paidAmount = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = invoice.amount - paidAmount;
    
    if (payment.amount > remainingBalance) {
      return { success: false, message: 'Payment amount exceeds remaining balance.' };
    }
    
    const newPayment: Payment = { ...payment, id: uuidv4(), recordedAt: new Date().toISOString() };
    const newAllocation: PaymentAllocation = {
      id: uuidv4(), paymentId: '', invoiceId: payment.invoiceId,
      amount: payment.amount, createdAt: new Date().toISOString()
    };
    
    setState(s => {
      const paymentWithId = { ...newPayment, id: uuidv4() };
      const allocationWithPaymentId = { ...newAllocation, paymentId: paymentWithId.id };
      
      // Update invoice status
      const newPaidAmount = paidAmount + payment.amount;
      let newStatus = invoice.status;
      if (newPaidAmount >= invoice.amount) newStatus = 'PAID';
      else if (newPaidAmount > 0) newStatus = 'PARTIALLY_PAID';
      
      return {
        ...s,
        payments: [...s.payments, paymentWithId],
        paymentAllocations: [...s.paymentAllocations, allocationWithPaymentId],
        invoices: s.invoices.map(i => i.id === payment.invoiceId ? { ...i, status: newStatus } : i)
      };
    });
    
    return { success: true, message: 'Payment recorded!' };
  };

  const getDancerInvoices = (dancerId: string) => state.invoices.filter(i => i.dancerId === dancerId);
  
  const getDancerBalance = (dancerId: string) => {
    const invoices = state.invoices.filter(i => i.dancerId === dancerId && i.status !== 'VOID');
    let totalBalance = 0;
    invoices.forEach(invoice => {
      const payments = state.payments.filter(p => p.invoiceId === invoice.id && p.status === 'COMPLETED');
      const paid = payments.reduce((sum, p) => sum + p.amount, 0);
      totalBalance += invoice.amount - paid;
    });
    return totalBalance;
  };

  const getTeamInvoices = (teamId: string) => state.invoices.filter(i => i.teamId === teamId);
  const getInvoicePayments = (invoiceId: string) => state.payments.filter(p => p.invoiceId === invoiceId);

  const value: AppContextType = {
    ...state, login, logout, registerDancer, cancelRegistration, checkInDancer,
    markAttendance, createSession, updateSession, cancelSession, completeSession,
    addUser, updateUser, deactivateUser, addRoom, updateRoom, setAvailability,
    createAnnouncement, deleteAnnouncement, activateKiosk, deactivateKiosk,
    getRegistrationCount, getAttendanceCount, getDancerAttendance,
    getSessionRegistrations, getSessionAttendance, getUserById, getRoomById,
    getDancerProfile, getInstructorProfile,
    // Team functions
    createTeam, updateTeam, archiveTeam, addTeamMember, removeTeamMember,
    assignCoach, removeCoach, getTeamMembers, getTeamCoaches, getDancerTeams,
    // Guardian/Family functions
    linkGuardianToDancer, unlinkGuardianFromDancer, getGuardianChildren, getDancerGuardians,
    // Financial functions
    createFee, createInvoice, recordPayment, getDancerInvoices, getDancerBalance,
    getTeamInvoices, getInvoicePayments
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
