import { useState } from 'react';
import { useApp } from '../store';
import { format } from 'date-fns';
import { Plus, Users, Calendar, Edit2, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminTeams() {
  const { teams, teamMemberships, teamCoaches, users, createTeam } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    ageRangeMin: '',
    ageRangeMax: '',
    skillLevel: 'beginner' as const,
    calendarColor: '#824fb7',
  });

  const activeTeams = teams.filter(t => t.status === 'ACTIVE');
  const archivedTeams = teams.filter(t => t.status === 'ARCHIVED');

  const handleCreateTeam = () => {
    if (!newTeam.name) return;
    createTeam({
      name: newTeam.name,
      description: newTeam.description || undefined,
      ageRangeMin: newTeam.ageRangeMin ? parseInt(newTeam.ageRangeMin) : undefined,
      ageRangeMax: newTeam.ageRangeMax ? parseInt(newTeam.ageRangeMax) : undefined,
      skillLevel: newTeam.skillLevel,
      status: 'ACTIVE',
      calendarColor: newTeam.calendarColor,
      createdById: 'u1', // Current user
    });
    setNewTeam({ name: '', description: '', ageRangeMin: '', ageRangeMax: '', skillLevel: 'beginner', calendarColor: '#824fb7' });
    setShowCreateForm(false);
  };

  const getTeamStats = (teamId: string) => {
    const members = teamMemberships.filter(m => m.teamId === teamId && m.status === 'ACTIVE');
    const coaches = teamCoaches.filter(c => c.teamId === teamId);
    return { memberCount: members.length, coachCount: coaches.length };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Teams</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Plus size={18} /> Create Team
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>New Team</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={newTeam.name}
              onChange={e => setNewTeam(t => ({ ...t, name: e.target.value }))}
              placeholder="Team name"
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <input
              type="text"
              value={newTeam.description}
              onChange={e => setNewTeam(t => ({ ...t, description: e.target.value }))}
              placeholder="Description"
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <input
              type="number"
              value={newTeam.ageRangeMin}
              onChange={e => setNewTeam(t => ({ ...t, ageRangeMin: e.target.value }))}
              placeholder="Min age"
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <input
              type="number"
              value={newTeam.ageRangeMax}
              onChange={e => setNewTeam(t => ({ ...t, ageRangeMax: e.target.value }))}
              placeholder="Max age"
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <select
              value={newTeam.skillLevel}
              onChange={e => setNewTeam(t => ({ ...t, skillLevel: e.target.value as any }))}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input
              type="color"
              value={newTeam.calendarColor}
              onChange={e => setNewTeam(t => ({ ...t, calendarColor: e.target.value }))}
              className="px-4 py-2 rounded-lg h-[42px]"
              style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
            />
          </div>
          <button
            onClick={handleCreateTeam}
            className="mt-4 px-4 py-2 text-white rounded-lg text-sm"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Create Team
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTeams.map(team => {
          const stats = getTeamStats(team.id);
          return (
            <Link
              key={team.id}
              to={`/admin/teams/${team.id}`}
              className="rounded-xl p-6 transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-12 rounded-full" style={{ backgroundColor: team.calendarColor }} />
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>{team.name}</h3>
                    {team.description && <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{team.description}</p>}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {(team.ageRangeMin || team.ageRangeMax) && (
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>Ages {team.ageRangeMin || '?'}-{team.ageRangeMax || '?'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{stats.memberCount} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{stats.coachCount} coach{stats.coachCount !== 1 ? 'es' : ''}</span>
                </div>
                {team.skillLevel && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{
                      backgroundColor: team.skillLevel === 'beginner' ? '#d1fae5' : team.skillLevel === 'intermediate' ? '#fef3c7' : '#fee2e2',
                      color: team.skillLevel === 'beginner' ? '#065f46' : team.skillLevel === 'intermediate' ? '#92400e' : '#991b1b'
                    }}>
                      {team.skillLevel}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {archivedTeams.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Archived Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedTeams.map(team => {
              const stats = getTeamStats(team.id);
              return (
                <div
                  key={team.id}
                  className="rounded-xl p-6 opacity-60"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-12 rounded-full" style={{ backgroundColor: team.calendarColor }} />
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{team.name}</h3>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {stats.memberCount} members • {stats.coachCount} coaches
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
