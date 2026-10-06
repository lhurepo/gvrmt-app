export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'DANCER' | 'PARENT';
export type SessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
export type SessionLevel = 'beginner' | 'intermediate' | 'advanced';
export type RegistrationStatus = 'REGISTERED' | 'CANCELLED';
export type RegistrationSource = 'WEB' | 'KIOSK' | 'INSTRUCTOR' | 'ADMIN';
export type AttendanceStatus = 'UNMARKED' | 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
export type AttendanceSource = 'KIOSK' | 'INSTRUCTOR' | 'ADMIN';
export type AnnouncementAudience = 'ALL' | 'DANCERS' | 'INSTRUCTORS';

// Team types
export type TeamStatus = 'ACTIVE' | 'ARCHIVED';
export type MembershipStatus = 'ACTIVE' | 'WITHDRAWN';
export type MembershipRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// Financial types
export type FeeCategory = 'TUITION' | 'REGISTRATION' | 'COMPETITION' | 'COSTUME' | 'COACH_TRAVEL' | 'DROP_IN' | 'PRIVATE_LESSON' | 'SOLO_DUO_TRIO' | 'WORKSHOP' | 'RENTAL';
export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'E_TRANSFER' | 'CASH' | 'SQUARE' | 'STRIPE';
export type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME';

// Activity types
export type ActivityType = 'CLASS' | 'TEAM_PRACTICE' | 'TECH_DROP_IN' | 'WORKSHOP' | 'PRIVATE_LESSON' | 'SOLO_DUO_TRIO' | 'ADDITIONAL_PRACTICE' | 'RENTAL' | 'SPECIAL_ACTIVITY';

// Request types
export type BookingRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type SubstituteRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ASSIGNED' | 'CANCELLED';

// Notification types
export type NotificationType = 'REGISTRATION_CONFIRMATION' | 'TEAM_ASSIGNMENT' | 'SUBSTITUTE_REQUEST' | 'SCHEDULE_CHANGE' | 'CANCELLATION' | 'PAYMENT_RECEIVED' | 'MEMBERSHIP_REQUEST';

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

// Team interfaces
export interface Team {
  id: string;
  name: string;
  description?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
  skillLevel?: SessionLevel;
  seasonStart?: string;
  seasonEnd?: string;
  status: TeamStatus;
  calendarColor: string;
  createdById: string;
  createdAt: string;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  dancerId: string;
  status: MembershipStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface TeamMembershipRequest {
  id: string;
  teamId: string;
  dancerId: string;
  requestedById: string;
  status: MembershipRequestStatus;
  message?: string;
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedById?: string;
}

export interface TeamCoach {
  id: string;
  teamId: string;
  instructorId: string;
  assignedAt: string;
}

// Guardian/Family interfaces
export interface Guardian {
  id: string;
  userId: string;
  relationship?: string;
  createdAt: string;
}

export interface GuardianDancerLink {
  id: string;
  guardianId: string;
  dancerId: string;
  verifiedAt?: string;
  verifiedById?: string;
  createdAt: string;
}

// Financial interfaces
export interface Fee {
  id: string;
  name: string;
  category: FeeCategory;
  amount: number; // stored in cents
  currency: string;
  description?: string;
  billingPeriod?: BillingPeriod;
  dueDate?: string;
  teamId?: string;
  sessionId?: string;
  createdById: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  dancerId: string;
  feeId?: string;
  amount: number; // stored in cents
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string;
  teamId?: string;
  sessionId?: string;
  payerId?: string; // guardian or dancer
  createdById: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number; // stored in cents
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  recordedById: string;
  recordedAt: string;
  verifiedAt?: string;
  verifiedById?: string;
  stripePaymentIntentId?: string;
  notes?: string;
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  amount: number; // stored in cents
  createdAt: string;
}

// Recurring series
export interface RecurringSeries {
  id: string;
  title: string;
  activityType: ActivityType;
  instructorId?: string;
  roomId?: string;
  teamId?: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startDate: string;
  endDate?: string;
  createdById: string;
  createdAt: string;
}

export interface SeriesException {
  id: string;
  seriesId: string;
  date: string;
  type: 'CANCELLED' | 'RESCHEDULED' | 'MODIFIED';
  newStartsAt?: string;
  newEndsAt?: string;
  newInstructorId?: string;
  newRoomId?: string;
  reason?: string;
  createdById: string;
  createdAt: string;
}

// Booking and substitute requests
export interface BookingRequest {
  id: string;
  activityType: ActivityType;
  requestedById: string;
  requestedRoomId?: string;
  requestedInstructorId?: string;
  requestedStartsAt: string;
  requestedEndsAt: string;
  purpose?: string;
  participantIds?: string[];
  status: BookingRequestStatus;
  rejectionReason?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface SubstituteRequest {
  id: string;
  sessionId: string;
  originalInstructorId: string;
  requestedById: string;
  reason?: string;
  status: SubstituteRequestStatus;
  substituteInstructorId?: string;
  acceptedAt?: string;
  assignedAt?: string;
  assignedById?: string;
  createdAt: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
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
  level?: SessionLevel;
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
