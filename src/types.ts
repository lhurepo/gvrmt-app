export type UserRole = 'DANCER' | 'INSTRUCTOR' | 'ADMIN';
export type SessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
export type RegistrationStatus = 'REGISTERED' | 'CANCELLED';
export type RegistrationSource = 'WEB' | 'KIOSK' | 'INSTRUCTOR' | 'ADMIN';
export type AttendanceStatus = 'UNMARKED' | 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
export type AttendanceSource = 'KIOSK' | 'INSTRUCTOR' | 'ADMIN';
export type AnnouncementAudience = 'ALL' | 'DANCERS' | 'INSTRUCTORS';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  biography?: string;
  isActive: boolean;
  avatar?: string;
}

export interface DancerProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  danceStyles: string[];
  notes?: string;
  kioskEnabled: boolean;
}

export interface InstructorProfile {
  id: string;
  userId: string;
  danceStylesTaught: string[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  image?: string;
}

export interface Session {
  id: string;
  title: string;
  danceStyle: string;
  description?: string;
  instructorId: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: SessionStatus;
  allowWalkIns: boolean;
  createdById: string;
  image?: string;
}

export interface Registration {
  id: string;
  sessionId: string;
  dancerId: string;
  status: RegistrationStatus;
  source: RegistrationSource;
  registeredAt: string;
  cancelledAt?: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  dancerId: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  checkedInAt?: string;
  markedById?: string;
}

export interface InstructorAvailability {
  id: string;
  instructorId: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  expiresAt?: string;
  createdAt: string;
}

export interface KioskSession {
  isActive: boolean;
  token?: string;
}
