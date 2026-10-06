import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { format } from 'date-fns';
import { ArrowLeft, UserPlus, X, Users } from 'lucide-react';

export function AdminTeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teams, teamMemberships, teamCoaches, users, addTeamMember, removeTeamMember, assignCoach, removeCoach, archiveTeam, getDancerProfile } = useApp();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [selectedDancer, setSelectedDancer] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');

  const team = teams.find(t => t.id === teamId);
  if (!team) return <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>Team not found.</div>;

  const members = teamMemberships.filter(m => m.teamId === teamId && m.status === 'ACTIVE');
  const coaches = teamCoaches.filter(c => c.teamId === teamId);
  const dancers = users.filter(u => u.role === 'DANCER' && u.isActive);
  const instructors = users.filter(u => u.role === 'INSTRUCTOR' && u.isActive);

  const handleAddMember = () => {
    if (!selectedDancer) return;
    const result = addTeamMember(teamId!, selectedDancer);
    if (result.success) {
      setSelectedDancer('');
      setShowAddMember(false);
    } else {
      alert(result.message);
    }
  };

  const handleAddCoach = () => {
    if (!selectedCoach) return;
    assignCoach(teamId!, selectedCoach);
    setSelectedCoach('');
    setShowAddCoach(false);
  };

  const handleArchive = () => {
    if (confirm('Archive this team? Historical data will be preserved.')) {
      archiveTeam(teamId!);
      navigate('/admin/teams');
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="rounded-2xl p-8 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-6 h-20 rounded-full" style={{ backgroundColor: team.calendarColor }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{team.name}</h1>
              {team.description && <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>{team.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {(team.ageRangeMin || team.ageRangeMax) && <span>Ages {team.ageRangeMin || '?'}-{team.ageRangeMax || '?'}</span>}
                {team.skillLevel && (
                  <span className="px-2 py-1 rounded-full text-xs capitalize" style={{
                    backgroundColor: team.skillLevel === 'beginner' ? '#d1fae5' : team.skillLevel === 'intermediate' ? '#fef3c7' : '#fee2e2',
                    color: team.skillLevel === 'beginner' ? '#065f46' : team.skillLevel === 'intermediate' ? '#92400e' : '#991b1b'
                  }}>
                    {team.skillLevel}
                  </span>
                )}
                <span className="px-2 py-1 rounded-full text-xs" style={{
                  backgroundColor: team.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                  color: team.status === 'ACTIVE' ? '#065f46' : '#991b1b'
                }}>
                  {team.status}
                </span>
              </div>
            </div>
          </div>
          {team.status === 'ACTIVE' && (
            <button onClick={handleArchive} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--color-error)', color: 'var(--color-error)' }}>
              Archive Team
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Members</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{members.length}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Coaches</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{coaches.length}</p>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="rounded-2xl p-8 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Users size={20} /> Members
          </h2>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>

        {showAddMember && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex gap-3">
              <select
                value={selectedDancer}
                onChange={e => setSelectedDancer(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">Select dancer...</option>
                {dancers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <button onClick={handleAddMember} className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>Add</button>
              <button onClick={() => setShowAddMember(false)} className="px-4 py-2 rounded-lg" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {members.map(membership => {
            const dancer = users.find(u => u.id === membership.dancerId);
            const profile = dancer ? getDancerProfile(dancer.id) : null;
            return (
              <div key={membership.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: dancer?.avatar || 'var(--color-accent)' }}>
                    {dancer?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{dancer?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Member since {format(new Date(membership.startDate), 'MMM d, yyyy')}
                      {profile?.dateOfBirth && ` • DOB: ${format(new Date(profile.dateOfBirth), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeTeamMember(membership.id)}
                  className="p-2 rounded-lg hover:bg-red-50"
                  style={{ color: 'var(--color-error)' }}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
          {members.length === 0 && <p className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No members yet.</p>}
        </div>
      </div>

      {/* Coaches Section */}
      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Coaches</h2>
          <button
            onClick={() => setShowAddCoach(!showAddCoach)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <UserPlus size={16} /> Add Coach
          </button>
        </div>

        {showAddCoach && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex gap-3">
              <select
                value={selectedCoach}
                onChange={e => setSelectedCoach(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">Select instructor...</option>
                {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <button onClick={handleAddCoach} className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>Add</button>
              <button onClick={() => setShowAddCoach(false)} className="px-4 py-2 rounded-lg" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {coaches.map(coach => {
            const instructor = users.find(u => u.id === coach.instructorId);
            return (
              <div key={coach.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: instructor?.avatar || 'var(--color-accent)' }}>
                    {instructor?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{instructor?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Assigned {format(new Date(coach.assignedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeCoach(coach.id)}
                  className="p-2 rounded-lg hover:bg-red-50"
                  style={{ color: 'var(--color-error)' }}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
          {coaches.length === 0 && <p className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No coaches assigned.</p>}
        </div>
      </div>
    </div>
  );
}
