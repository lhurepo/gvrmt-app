import { useState } from 'react';
import { format } from 'date-fns';
import { X, Edit2, Trash2, MapPin, Clock, Users, Calendar } from 'lucide-react';
import { useApp } from '../store';
import { Session, SessionLevel } from '../types';
import { getLevelColor } from '../utils/levelColors';

interface SessionDetailModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}

export function SessionDetailModal({ session, isOpen, onClose, onEdit, onDelete }: SessionDetailModalProps) {
  const { rooms, users, getRegistrationCount } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const room = rooms.find(r => r.id === session.roomId);
  const instructor = users.find(u => u.id === session.instructorId);
  const registered = getRegistrationCount(session.id);
  const levelColor = getLevelColor(session.level);

  const handleDelete = () => {
    onDelete(session.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-12 rounded-full"
              style={{ backgroundColor: levelColor.border }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{session.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: levelColor.bg,
                    color: levelColor.text,
                  }}
                >
                  {levelColor.label}
                </span>
                <span className="text-sm text-gray-500">{session.danceStyle}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(session.startsAt), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(session.startsAt), 'h:mm a')} - {format(new Date(session.endsAt), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Location & Instructor */}
          <div className="grid grid-cols-2 gap-4">
            {room && (
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-medium text-gray-900">{room.name}</p>
                  <p className="text-sm text-gray-500">Capacity: {room.capacity}</p>
                </div>
              </div>
            )}
            {instructor && (
              <div className="flex items-start gap-3">
                <Users className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Instructor</p>
                  <p className="font-medium text-gray-900">{instructor.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Capacity */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Registration</span>
              <span className="text-sm font-semibold text-gray-900">
                {registered} / {session.capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${(registered / session.capacity) * 100}%`,
                  backgroundColor: 'var(--color-accent)'
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {session.capacity - registered} spots remaining
            </p>
          </div>

          {/* Additional Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Walk-ins</span>
              <span className="font-medium text-gray-900">
                {session.allowWalkIns ? 'Allowed' : 'Not Allowed'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-gray-900 capitalize">{session.status.toLowerCase()}</span>
            </div>
          </div>

          {/* Description */}
          {session.description && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
              <p className="text-sm text-gray-600">{session.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-red-600">Delete this session?</p>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span className="text-sm font-medium">Delete</span>
              </button>
              <button
                onClick={() => onEdit(session)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit2 size={18} />
                <span className="text-sm font-medium">Edit Session</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
