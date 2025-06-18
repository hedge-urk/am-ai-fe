import { useState } from 'react';
import type { FormEvent } from 'react';
import './EntityForm.css';

// Get API endpoint from environment variables, fallback to dummy URL if not set
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://api.example.com/entities';

interface FormData {
  entityName: string;
  dateOfBirth: string;
  country: string;
}

export const EntityForm = () => {
  const [formData, setFormData] = useState<FormData>({
    entityName: '',
    dateOfBirth: '',
    country: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      console.log('Success:', data);
      setFormData({
        entityName: '',
        dateOfBirth: '',
        country: ''
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="entity-form">
        <div className="form-header">
          <h2>Entity Information</h2>
          <p className="form-subtitle">Please fill in the details below</p>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label htmlFor="entityName">
              <span className="label-text">Entity Name</span>
              <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="entityName"
              name="entityName"
              value={formData.entityName}
              onChange={handleChange}
              placeholder="Enter entity name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">
              <span className="label-text">Date of Birth</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">
              <span className="label-text">Country</span>
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter country name"
            />
          </div>
        </div>

        <div className="form-footer">
          <button type="submit" className="submit-button">
            <span className="button-text">Save Information</span>
          </button>
        </div>
      </form>
    </div>
  );
}; 