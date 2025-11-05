import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { getTeams, deleteTeam } from '../../redux/features/teamSlice';
import { getWorkers } from '../../redux/features/workerSlice';
import TeamForm from './TeamForm';

const TeamList = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { teams, loading } = useSelector(state => state.team || { teams: [], loading: false });
  const { workers } = useSelector(state => state.worker || { workers: [] });

  useEffect(() => {
    dispatch(getTeams());
    dispatch(getWorkers());
  }, [dispatch]);

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedTeam(null);
    setShowModal(true);
  };

  const handleEdit = (team) => {
    setIsEdit(true);
    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleDelete = async (teamId) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj tim?')) {
      try {
        await dispatch(deleteTeam({ id: teamId })).unwrap();
        toast.success('Tim je uspešno obrisan');
      } catch (error) {
        toast.error(error?.message || 'Greška pri brisanju tima');
      }
    }
  };

  const getWorkerNames = (members) => {
    if (!members || !Array.isArray(members) || members.length === 0) {
      return 'Nema dodeljenih radnika';
    }

    const memberNames = members
      .map((member) => {
        if (!member) return null;

        // If backend already populated the worker document
        if (typeof member === 'object') {
          if (member.firstName || member.lastName) {
            return `${member.firstName || ''} ${member.lastName || ''}`.trim();
          }

          if (member._id) {
            const worker = workers.find((w) => w._id === member._id);
            if (worker) {
              return `${worker.firstName} ${worker.lastName}`;
            }
          }
          return null;
        }

        // Otherwise treat it as an ID
        const worker = workers.find((w) => w._id === member);
        return worker ? `${worker.firstName} ${worker.lastName}` : null;
      })
      .filter(Boolean);

    return memberNames.length > 0 ? memberNames.join(', ') : 'Nema dodeljenih radnika';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen p-2 sm:p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen p-2 sm:p-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Timovi</h2>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} /> 
              <span className="hidden sm:inline">Dodaj tim</span>
              <span className="sm:hidden">Dodaj</span>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 sm:p-8 text-center text-gray-400 shadow-lg">
          Nema timova. Dodajte svoj prvi tim da počnete.
        </div>
        
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <TeamForm
                isEdit={isEdit}
                team={selectedTeam}
                onClose={() => setShowModal(false)}
                availableWorkers={workers}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-2 sm:p-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Timovi</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> 
            <span className="hidden sm:inline">Dodaj tim</span>
            <span className="sm:hidden">Dodaj</span>
          </button>
        </div>
      </div>
      
      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {teams.map(team => (
          <div key={team._id} className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                  <Users size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-white truncate">{team.name}</h3>
                  {team.description && (
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{team.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                  title="Izmeni tim"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(team._id)}
                  className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                  title="Obriši tim"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="text-xs sm:text-sm space-y-1 border-t border-gray-700 pt-2 sm:pt-3">
              <div className="flex items-center text-gray-300">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-gray-400 mr-2">Članovi:</span>
                <span className="truncate">{getWorkerNames(team.members || team.workers)}</span>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs ${team.active !== false ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {team.active !== false ? 'Aktivan' : 'Neaktivan'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <TeamForm
              isEdit={isEdit}
              team={selectedTeam}
              onClose={() => setShowModal(false)}
              availableWorkers={workers}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamList;
