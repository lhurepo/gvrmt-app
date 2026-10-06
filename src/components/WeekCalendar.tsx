import { useState, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../store';
import { getLevelColor, LEVEL_COLORS } from '../utils/levelColors';
import { Session, SessionLevel } from '../types';

interface WeekCalendarProps {
  onSessionClick?: (session: Session) => void;
  onCreateSession?: (startsAt: Date, endsAt: Date) => void;
}

export function WeekCalendar({ onSessionClick, onCreateSession }: WeekCalendarProps) {
  const { sessions, rooms, users } = useApp();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: Date; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: Date; hour: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  const getSessionsForDay = (day: Date) => {
    return sessions.filter(s => {
      const sessionDate = new Date(s.startsAt);
      return isSameDay(sessionDate, day) && s.status === 'SCHEDULED';
    });
  };

  const getSessionPosition = (session: Session) => {
    const start = new Date(session.startsAt);
    const end = new Date(session.endsAt);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = ((startHour - 6) / 16) * 100;
    const height = ((endHour - startHour) / 16) * 100;
    return { top: `${top}%`, height: `${height}%` };
  };

  const handleMouseDown = (day: Date, hour: number) => {
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
  };

  const handleMouseMove = (day: Date, hour: number) => {
    if (isDragging && dragStart && isSameDay(dragStart.day, day)) {
      setDragEnd({ day, hour });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && onCreateSession) {
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;
      
      const startsAt = setMinutes(setHours(dragStart.day, startHour), 0);
      const endsAt = setMinutes(setHours(dragEnd.day, endHour), 0);
      
      onCreateSession(startsAt, endsAt);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const getDragSelection = () => {
    if (!isDragging || !dragStart || !dragEnd) return null;
    
    const startHour = Math.min(dragStart.hour, dragEnd.hour);
    const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;
    const top = ((startHour - 6) / 16) * 100;
    const height = ((endHour - startHour) / 16) * 100;
    
    return {
      day: dragStart.day,
      top: `${top}%`,
      height: `${height}%`
    };
  };

  const dragSelection = getDragSelection();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </h2>
        <button
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200">
            <div className="p-2 text-xs text-gray-500 text-center">Time</div>
            {weekDays.map(day => (
              <div
                key={day.toISOString()}
                className={`p-2 text-center border-l border-gray-200 ${
                  isSameDay(day, new Date()) ? 'bg-purple-50' : ''
                }`}
              >
                <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                <div className={`text-lg font-semibold ${
                  isSameDay(day, new Date()) ? 'text-purple-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div
            ref={calendarRef}
            className="grid grid-cols-[80px_repeat(7,1fr)] relative"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Time Labels */}
            <div className="relative">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-100 text-xs text-gray-500 text-right pr-2 pt-1"
                >
                  {hour === 6 ? '6 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map(day => (
              <div
                key={day.toISOString()}
                className={`relative border-l border-gray-200 ${
                  isSameDay(day, new Date()) ? 'bg-purple-50/30' : ''
                }`}
              >
                {/* Hour Slots */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-100 cursor-crosshair hover:bg-purple-50/50 transition-colors"
                    onMouseDown={() => handleMouseDown(day, hour)}
                    onMouseMove={() => handleMouseMove(day, hour)}
                  />
                ))}

                {/* Sessions */}
                {getSessionsForDay(day).map(session => {
                  const position = getSessionPosition(session);
                  const levelColor = getLevelColor(session.level);

                  return (
                    <div
                      key={session.id}
                      className="absolute left-2 right-2 rounded-lg p-3 cursor-pointer hover:opacity-90 transition-all overflow-hidden border-l-4 shadow-sm hover:shadow-md"
                      style={{
                        top: position.top,
                        height: position.height,
                        backgroundColor: levelColor.bg,
                        borderLeftColor: levelColor.border,
                        color: levelColor.text
                      }}
                      onClick={() => onSessionClick?.(session)}
                    >
                      <div className="text-sm font-semibold truncate mb-1">{session.title}</div>
                      <div className="text-xs opacity-75">
                        {format(new Date(session.startsAt), 'h:mm a')}
                      </div>
                    </div>
                  );
                })}

                {/* Drag Selection */}
                {dragSelection && isSameDay(dragSelection.day, day) && (
                  <div
                    className="absolute left-1 right-1 bg-purple-200/50 border-2 border-purple-400 border-dashed rounded-lg pointer-events-none flex items-center justify-center"
                    style={{
                      top: dragSelection.top,
                      height: dragSelection.height
                    }}
                  >
                    <Plus className="text-purple-600" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 flex items-center gap-6">
        <span className="text-sm text-gray-600 font-medium">Session Levels:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: LEVEL_COLORS.beginner.bg, borderLeft: `3px solid ${LEVEL_COLORS.beginner.border}` }} />
          <span className="text-sm text-gray-700">Beginner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: LEVEL_COLORS.intermediate.bg, borderLeft: `3px solid ${LEVEL_COLORS.intermediate.border}` }} />
          <span className="text-sm text-gray-700">Intermediate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: LEVEL_COLORS.advanced.bg, borderLeft: `3px solid ${LEVEL_COLORS.advanced.border}` }} />
          <span className="text-sm text-gray-700">Advanced</span>
        </div>
      </div>
    </div>
  );
}
