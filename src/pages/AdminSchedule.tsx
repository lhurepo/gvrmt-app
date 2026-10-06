import { useState } from 'react';
import { WeekCalendar } from '../components/WeekCalendar';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { Session } from '../types';
import { useApp } from '../store';
import { CalendarView } from '../App';
import { LayoutGrid, List } from 'lucide-react';

export function AdminSchedule() {
  const { cancelSession, sessions } = useApp();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ startsAt: Date; endsAt: Date } | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleCreateSession = (startsAt: Date, endsAt: Date) => {
    setSelectedTimeSlot({ startsAt, endsAt });
    setIsCreateModalOpen(true);
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedTimeSlot(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSession(null);
  };

  const handleEditSession = (session: Session) => {
    // For now, just close the detail modal
    // In a full implementation, you'd open an edit modal with pre-filled data
    console.log('Edit session:', session);
    handleCloseDetailModal();
  };

  const handleDeleteSession = (sessionId: string) => {
    cancelSession(sessionId);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">
            {viewMode === 'week' 
              ? 'Drag on the calendar to create new sessions, or click on existing sessions to view details'
              : 'Click on a day to view scheduled sessions'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'week'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={18} />
            <span className="text-sm font-medium">Week</span>
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="text-sm font-medium">Month</span>
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <WeekCalendar
          onCreateSession={handleCreateSession}
          onSessionClick={handleSessionClick}
        />
      ) : (
        <CalendarView
          sessions={sessions}
          linkPrefix="/admin/sessions"
        />
      )}

      {selectedTimeSlot && (
        <CreateSessionModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          startsAt={selectedTimeSlot.startsAt}
          endsAt={selectedTimeSlot.endsAt}
        />
      )}

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onEdit={handleEditSession}
          onDelete={handleDeleteSession}
        />
      )}
    </div>
  );
}
