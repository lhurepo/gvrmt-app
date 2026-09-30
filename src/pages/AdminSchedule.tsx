import { useState } from 'react';
import { WeekCalendar } from '../components/WeekCalendar';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { Session } from '../types';

export function AdminSchedule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ startsAt: Date; endsAt: Date } | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleCreateSession = (startsAt: Date, endsAt: Date) => {
    setSelectedTimeSlot({ startsAt, endsAt });
    setIsModalOpen(true);
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    // You could navigate to session details or open an edit modal
    console.log('Session clicked:', session);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTimeSlot(null);
    setSelectedSession(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-600 mt-1">
          Drag on the calendar to create new sessions, or click on existing sessions to view details
        </p>
      </div>

      <WeekCalendar
        onCreateSession={handleCreateSession}
        onSessionClick={handleSessionClick}
      />

      {selectedTimeSlot && (
        <CreateSessionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          startsAt={selectedTimeSlot.startsAt}
          endsAt={selectedTimeSlot.endsAt}
        />
      )}
    </div>
  );
}
