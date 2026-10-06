import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { useApp } from '../store';
import { SessionLevel } from '../types';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  startsAt: Date;
  endsAt: Date;
}

export function CreateSessionModal({ isOpen, onClose, startsAt, endsAt }: CreateSessionModalProps) {
  const { rooms, users, createSession, currentUser } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    danceStyle: 'Hip Hop',
    instructorId: '',
    roomId: '',
    capacity: 20,
    allowWalkIns: true,
    level: 'beginner' as SessionLevel,
  });
  const [error, setError] = useState('');

  const instructors = users.filter(u => u.role === 'INSTRUCTOR' && u.isActive);

  useEffect(() => {
    if (instructors.length > 0 && !formData.instructorId) {
      setFormData(prev => ({ ...prev, instructorId: instructors[0].id }));
    }
    if (rooms.length > 0 && !formData.roomId) {
      setFormData(prev => ({ ...prev, roomId: rooms[0].id }));
    }
  }, [instructors, rooms, formData.instructorId, formData.roomId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.instructorId || !formData.roomId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to create a session');
      return;
    }

    const result = createSession({
      title: formData.title,
      danceStyle: formData.danceStyle,
      instructorId: formData.instructorId,
      roomId: formData.roomId,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      capacity: formData.capacity,
      allowWalkIns: formData.allowWalkIns,
      status: 'SCHEDULED',
      createdById: currentUser.id,
      level: formData.level,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Create New Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <div>{format(startsAt, 'EEEE, MMMM d, yyyy')}</div>
              <div className="text-gray-500">
                {format(startsAt, 'h:mm a')} - {format(endsAt, 'h:mm a')}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Hip Hop Fundamentals"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dance Style *
            </label>
            <select
              value={formData.danceStyle}
              onChange={(e) => setFormData(prev => ({ ...prev, danceStyle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="Hip Hop">Hip Hop</option>
              <option value="Breaking">Breaking</option>
              <option value="Popping">Popping</option>
              <option value="House">House</option>
              <option value="Locking">Locking</option>
              <option value="Contemporary">Contemporary</option>
              <option value="Afrobeats">Afrobeats</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as SessionLevel[]).map((level) => {
                const colors = {
                  beginner: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
                  intermediate: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
                  advanced: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
                };
                const color = colors[level];
                const isSelected = formData.level === level;
                
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, level }))}
                    className="px-3 py-2 rounded-lg border-2 transition-all capitalize font-medium"
                    style={{
                      backgroundColor: isSelected ? color.bg : 'white',
                      borderColor: isSelected ? color.border : '#e5e7eb',
                      color: isSelected ? color.text : '#6b7280',
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructor *
            </label>
            <select
              value={formData.instructorId}
              onChange={(e) => setFormData(prev => ({ ...prev, instructorId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select instructor</option>
              {instructors.map(instructor => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room *
            </label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select room</option>
              {rooms.filter(r => r.isActive).map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
              max="100"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowWalkIns"
              checked={formData.allowWalkIns}
              onChange={(e) => setFormData(prev => ({ ...prev, allowWalkIns: e.target.checked }))}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="allowWalkIns" className="ml-2 text-sm text-gray-700">
              Allow walk-ins
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
