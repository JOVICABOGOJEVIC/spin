import React, { useState, useEffect } from 'react';
import { getBusinessType } from '../../utils/businessTypeUtils';

const ProjectsView = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    startDate: '',
    estimatedEndDate: '',
    status: 'planned',
    description: '',
    budget: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const businessType = getBusinessType();
  
  // Get different project types based on business type
  const getProjectTypes = () => {
    switch(businessType) {
      case 'Carpenter':
        return [
          'Custom Furniture', 
          'Kitchen Remodel', 
          'Deck/Patio', 
          'Cabinets', 
          'Flooring', 
          'Other'
        ];
      case 'Tile Installer':
        return [
          'Bathroom', 
          'Kitchen', 
          'Floor Tiling', 
          'Outdoor Tiling', 
          'Backsplash', 
          'Other'
        ];
      case 'Painter':
        return [
          'Interior Painting', 
          'Exterior Painting', 
          'Decorative Painting', 
          'Commercial Space', 
          'Residential Space', 
          'Other'
        ];
      case 'Facade Specialist':
        return [
          'Building Exterior', 
          'Insulation', 
          'Restoration', 
          'Commercial Building', 
          'Residential Building', 
          'Other'
        ];
      default:
        return ['General Project', 'Custom Work', 'Repair', 'Installation', 'Other'];
    }
  };
  
  useEffect(() => {
    // Mock data fetching - in a real app, this would be an API call
    const fetchProjects = () => {
      // Create mock projects based on business type
      const mockProjects = [];
      const count = Math.floor(Math.random() * 4) + 2; // 2-5 projects
      const projectTypes = getProjectTypes();
      const statuses = ['planned', 'in_progress', 'completed', 'on_hold'];
      
      for (let i = 0; i < count; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Started 0-30 days ago
        
        const estimatedEndDate = new Date(startDate);
        estimatedEndDate.setDate(estimatedEndDate.getDate() + Math.floor(Math.random() * 60) + 15); // 15-75 days duration
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const progress = status === 'completed' ? 100 : 
                        status === 'planned' ? 0 : 
                        Math.floor(Math.random() * 80) + 10; // 10-90% for in progress
        
        mockProjects.push({
          id: `project-${i + 1}`,
          name: `${projectTypes[Math.floor(Math.random() * projectTypes.length)]} Project`,
          client: `Client ${i + 1}`,
          startDate: startDate.toISOString().split('T')[0],
          estimatedEndDate: estimatedEndDate.toISOString().split('T')[0],
          status,
          progress,
          description: `Sample project description for ${businessType} work.`,
          budget: (Math.random() * 9000 + 1000).toFixed(2) // 1000-10000
        });
      }
      
      setProjects(mockProjects);
      setLoading(false);
    };
    
    fetchProjects();
  }, [businessType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ 
      ...newProject, 
      [name]: name === 'budget' ? parseFloat(value) : value
    });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call
    const newProjectWithId = {
      ...newProject,
      id: `project-${projects.length + 1}`,
      progress: newProject.status === 'completed' ? 100 : 
               newProject.status === 'planned' ? 0 : 
               Math.floor(Math.random() * 80) + 10,
    };
    
    setProjects([...projects, newProjectWithId]);
    setNewProject({
      name: '',
      client: '',
      startDate: '',
      estimatedEndDate: '',
      status: 'planned',
      description: '',
      budget: ''
    });
    setShowAddForm(false);
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Count projects by status
  const plannedProjects = projects.filter(p => p.status === 'planned').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="projects-view">
      {/* Projects status summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-blue-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-blue-800">Planned</h3>
          <p className="text-lg font-bold">{plannedProjects}</p>
        </div>
        <div className="bg-yellow-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-yellow-800">In Progress</h3>
          <p className="text-lg font-bold">{inProgressProjects}</p>
        </div>
        <div className="bg-green-50 p-2 rounded-md flex-1">
          <h3 className="text-xs font-medium text-green-800">Completed</h3>
          <p className="text-lg font-bold">{completedProjects}</p>
        </div>
      </div>

      {/* Project form or list */}
      {showAddForm ? (
        <form onSubmit={handleAddProject} className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Add New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={newProject.name}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="client"
              placeholder="Client Name"
              value={newProject.client}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            />
            <div>
              <label className="block text-xs text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={newProject.startDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Estimated End Date</label>
              <input
                type="date"
                name="estimatedEndDate"
                value={newProject.estimatedEndDate}
                onChange={handleInputChange}
                required
                className="border p-2 rounded w-full"
              />
            </div>
            <select
              name="status"
              value={newProject.status}
              onChange={handleInputChange}
              required
              className="border p-2 rounded"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <input
              type="number"
              name="budget"
              placeholder="Budget"
              value={newProject.budget}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="border p-2 rounded"
            />
            <div className="md:col-span-2">
              <textarea
                name="description"
                placeholder="Project Description"
                value={newProject.description}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-3 py-1 bg-primary text-white rounded"
            >
              Add Project
            </button>
          </div>
        </form>
      ) : (
        <>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="mb-4 px-3 py-1 bg-primary text-white rounded-md text-sm"
          >
            Add New Project
          </button>
          
          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project/Client</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map(project => (
                    <tr key={project.id}>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-xs text-gray-500">{project.client}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project.startDate}</div>
                        <div className="text-xs text-gray-500">to {project.estimatedEndDate}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(project.status)}`}>
                          {formatStatus(project.status)}
                        </span>
                        {project.status === 'in_progress' && (
                          <div className="mt-1 h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No projects found. Add a project to get started.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsView; 