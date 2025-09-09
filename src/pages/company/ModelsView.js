import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Form, Button, Table, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { getModels, createModel, updateModel, deleteModel, loadMockModels } from '../../redux/features/modelSlice';
import './styles.css';

const ModelsView = () => {
  const dispatch = useDispatch();
  const { models, loading, error } = useSelector((state) => state.model);
  
  const [formData, setFormData] = useState({
    brand: '',
    modelName: '',
    type: '',
    commonIssues: '',
    averageRepairTime: '',
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load models on component mount
  useEffect(() => {
    dispatch(getModels())
      .unwrap()
      .then((data) => {
        if (!data || data.length === 0) {
          // If no models returned from API, load mock data
          dispatch(loadMockModels());
        }
      })
      .catch(() => {
        // If API call fails, load mock data
        dispatch(loadMockModels());
      });
  }, [dispatch]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'commonIssues') {
      setFormData({
        ...formData,
        [name]: value.split(',').map(issue => issue.trim())
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission for adding/editing model
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert common issues array to string for form display
    const modelData = {
      ...formData,
      averageRepairTime: Number(formData.averageRepairTime)
    };
    
    if (isEditing) {
      dispatch(updateModel({ id: currentModelId, updatedModelData: modelData }))
        .then(() => {
          resetForm();
        });
    } else {
      dispatch(createModel({ modelData }))
        .then(() => {
          resetForm();
        });
    }
  };

  // Reset form and state
  const resetForm = () => {
    setFormData({
      brand: '',
      modelName: '',
      type: '',
      commonIssues: '',
      averageRepairTime: '',
    });
    setIsAdding(false);
    setIsEditing(false);
    setCurrentModelId(null);
  };

  // Start editing a model
  const handleEdit = (model) => {
    setCurrentModelId(model._id);
    setFormData({
      brand: model.brand,
      modelName: model.modelName,
      type: model.type,
      commonIssues: Array.isArray(model.commonIssues) ? model.commonIssues.join(', ') : '',
      averageRepairTime: model.averageRepairTime,
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  // Delete a model
  const handleDelete = (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj model?')) {
      dispatch(deleteModel(id));
    }
  };
  
  // Filter models based on search term
  const filteredModels = models.filter(
    (model) =>
      model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Upravljanje modelima uređaja</h2>
      
      {/* Add/Edit Form */}
      <div className="mb-4">
        {!isAdding ? (
          <Button 
            variant="primary" 
            onClick={() => setIsAdding(true)}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" /> Dodaj novi model
          </Button>
        ) : (
          <div className="card">
            <div className="card-header">
              {isEditing ? 'Izmeni model' : 'Dodaj novi model'}
            </div>
            <div className="card-body">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Brend</Form.Label>
                      <Form.Control
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Naziv modela</Form.Label>
                      <Form.Control
                        type="text"
                        name="modelName"
                        value={formData.modelName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tip uređaja</Form.Label>
                      <Form.Control
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Česti kvarovi (razdvojeni zarezom)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="commonIssues"
                        value={formData.commonIssues}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Prosečno vreme popravke (sati)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.5"
                        name="averageRepairTime"
                        value={formData.averageRepairTime}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit">
                    {isEditing ? 'Sačuvaj izmene' : 'Dodaj model'}
                  </Button>
                  <Button variant="secondary" onClick={resetForm}>
                    Odustani
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Pretraži modele po brendu, nazivu ili tipu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>
      
      {/* Models Table */}
      {loading ? (
        <p>Učitavanje...</p>
      ) : models.length === 0 ? (
        <p>Nema dostupnih modela. Dodajte prvi model.</p>
      ) : (
        <div className="table-responsive">
          <Table striped hover className="models-table">
            <thead>
              <tr>
                <th>Brend</th>
                <th>Naziv modela</th>
                <th>Tip uređaja</th>
                <th>Česti kvarovi</th>
                <th>Prosečno vreme popravke (h)</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => (
                <tr key={model._id}>
                  <td>{model.brand}</td>
                  <td>{model.modelName}</td>
                  <td>{model.type}</td>
                  <td>
                    {Array.isArray(model.commonIssues) && model.commonIssues.length > 0 ? (
                      <ul className="mb-0 ps-3">
                        {model.commonIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      "Nema podataka"
                    )}
                  </td>
                  <td>{model.averageRepairTime}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(model)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(model._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ModelsView; 