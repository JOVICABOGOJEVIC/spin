import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTeams, deleteTeam, setCurrentTeam } from '../../redux/features/teamSlice';
import { toast } from 'react-toastify';
import { ArrowUpRight, Trash2, Users, CheckCircle, XCircle, Briefcase } from 'lucide-react';

const TeamList = () => {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.team || { teams: [], loading: false });
  const { workers } = useSelector((state) => state.worker || { workers: [] });

  useEffect(() => {
    dispatch(getTeams());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      dispatch(deleteTeam({ id }));
    }
  };

  const handleEdit = (team) => {
    dispatch(setCurrentTeam(team));
    const event = new CustomEvent('team-edit', { detail: team });
    window.dispatchEvent(event);
  };
  
  // Find worker names by id
  const getWorkerName = (workerId) => {
    const worker = workers?.find(w => w._id === workerId);
    return worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown';
  };
  
  // Count team members
  const getMemberCount = (memberIds) => {
    return memberIds?.length || 0;
  };

  if (loading) {
    return <div className="flex justify-center mt-8">Loading teams...</div>;
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No teams found. Create a new team to get started.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <ul className="grid grid-cols-1 gap-4">
        {teams.map((team) => (
          <li 
            key={team._id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <h3 className="font-semibold text-lg text-background mr-2">
                    {team.name}
                  </h3>
                  {team.isActive ? (
                    <span className="flex items-center text-green-600 text-xs">
                      <CheckCircle size={14} className="mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 text-xs">
                      <XCircle size={14} className="mr-1" />
                      Inactive
                    </span>
                  )}
                </div>
                
                {team.description && (
                  <p className="text-gray-600 text-sm mb-2">{team.description}</p>
                )}
                
                {team.leader && (
                  <div className="flex items-center text-gray-700 text-sm mb-1">
                    <span className="font-medium">Team Lead:</span>
                    <span className="ml-1">{getWorkerName(team.leader)}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600 text-sm">
                  <Users size={14} className="mr-1" />
                  <span>{getMemberCount(team.members)} team members</span>
                </div>
                
                {team.specializations && team.specializations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {team.specializations.map(spec => (
                      <span 
                        key={spec} 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                      >
                        <Briefcase size={10} className="mr-1" />
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Edit team"
                >
                  <ArrowUpRight size={16} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(team._id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Delete team"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamList; 