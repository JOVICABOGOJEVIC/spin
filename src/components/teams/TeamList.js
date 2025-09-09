import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { getTeams, deleteTeam } from '../../redux/actions/teamActions';
import { getWorkers } from '../../redux/actions/workerActions';
import TeamForm from './TeamForm';
import LoadingSpinner from '../shared/LoadingSpinner';

const TeamList = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { teams, loading } = useSelector(state => state.team);
  const { workers } = useSelector(state => state.worker);

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
        await dispatch(deleteTeam(teamId));
        toast.success('Tim je uspešno obrisan');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Greška pri brisanju tima');
      }
    }
  };

  const getWorkerNames = (workerIds) => {
    return workerIds
      .map(id => workers.find(w => w._id === id))
      .filter(worker => worker)
      .map(worker => worker.name)
      .join(', ');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-white">Timovi</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj tim
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team._id} className="bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">{team.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{team.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(team._id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center text-gray-400 text-sm">
                <Users className="w-4 h-4 mr-2" />
                <span>Članovi tima:</span>
              </div>
              <p className="text-sm text-white mt-1">
                {team.workers?.length > 0 
                  ? getWorkerNames(team.workers)
                  : 'Nema dodeljenih radnika'}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded ${team.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {team.isActive ? 'Aktivan' : 'Neaktivan'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TeamForm
          isEdit={isEdit}
          team={selectedTeam}
          onClose={() => setShowModal(false)}
          availableWorkers={workers}
        />
      )}
    </div>
  );
};

export default TeamList; 