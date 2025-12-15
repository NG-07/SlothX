import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaBriefcase, FaHome, FaDollarSign, FaClipboardCheck } from 'react-icons/fa';
import { predictCreditRisk } from '../services/api';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

const initialFormData = {
  // Personal Information
  code_gender: 'M',
  flag_own_car: 'N',
  flag_own_realty: 'Y',
  cnt_children: 0,
  name_family_status: 'Single / not married',

  // Financial Information
  amt_income_total: '',
  amt_credit: '',
  amt_annuity: '',
  amt_goods_price: '',

  // Employment Information
  name_income_type: 'Working',
  name_education_type: 'Secondary / secondary special',
  occupation_type: '',
  organization_type: '',
  days_birth: '',
  days_employed: '',

  // Housing
  name_housing_type: 'House / apartment',
  region_population_relative: '',

  // Contact
  flag_mobil: 1,
  flag_work_phone: 0,
  flag_phone: 1,
  flag_email: 0,

  // External Scores
  ext_source_1: '',
  ext_source_2: '',
  ext_source_3: '',

  // Contract
  name_contract_type: 'Cash loans',
};

const PredictionForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const validateForm = () => {
    const required = ['amt_income_total', 'amt_credit', 'days_birth', 'days_employed'];
    for (const field of required) {
      if (!formData[field] && formData[field] !== 0) {
        toast.error(`Please fill in ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare data - convert empty strings to null for optional fields
      const submitData = { ...formData };
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      const response = await predictCreditRisk(submitData);
      setResult(response);
      toast.success('Prediction completed successfully!');
    } catch (error) {
      console.error('Prediction error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to get prediction. Please check if the API is running.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData(initialFormData);
    setActiveSection('personal');
  };

  const calculateAge = (days) => {
    if (!days) return '';
    return Math.floor(Math.abs(days) / 365);
  };

  if (loading) {
    return <LoadingSpinner text="Analyzing credit risk..." />;
  }

  if (result) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <ResultCard result={result} onReset={handleReset} />
      </div>
    );
  }

  const sections = [
    { id: 'personal', label: 'Personal', icon: <FaUser /> },
    { id: 'financial', label: 'Financial', icon: <FaDollarSign /> },
    { id: 'employment', label: 'Employment', icon: <FaBriefcase /> },
    { id: 'housing', label: 'Housing', icon: <FaHome /> },
  ];

  return (
    <div className="container">
      <div className="section-title" style={{ marginBottom: '32px' }}>
        <h2>Credit Risk Assessment</h2>
        <p>Fill in the applicant details to get a risk prediction</p>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`btn ${activeSection === section.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        {activeSection === 'personal' && (
          <div className="card fade-in">
            <div className="card-header">
              <FaUser />
              <h2>Personal Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Gender <span>*</span></label>
                <select name="code_gender" value={formData.code_gender} onChange={handleChange} className="form-control">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label>Age (Years) <span>*</span></label>
                <input
                  type="number"
                  name="days_birth"
                  value={formData.days_birth ? calculateAge(formData.days_birth) : ''}
                  onChange={(e) => {
                    const age = e.target.value;
                    setFormData(prev => ({ ...prev, days_birth: age ? -age * 365 : '' }));
                  }}
                  className="form-control"
                  placeholder="e.g., 30"
                  min="18"
                  max="100"
                />
                <p className="form-hint">Applicant's age in years</p>
              </div>

              <div className="form-group">
                <label>Number of Children</label>
                <input
                  type="number"
                  name="cnt_children"
                  value={formData.cnt_children}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Family Status <span>*</span></label>
                <select name="name_family_status" value={formData.name_family_status} onChange={handleChange} className="form-control">
                  <option value="Single / not married">Single / Not Married</option>
                  <option value="Married">Married</option>
                  <option value="Civil marriage">Civil Marriage</option>
                  <option value="Separated">Separated</option>
                  <option value="Widow">Widow</option>
                </select>
              </div>

              <div className="form-group">
                <label>Owns a Car</label>
                <select name="flag_own_car" value={formData.flag_own_car} onChange={handleChange} className="form-control">
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Owns Property</label>
                <select name="flag_own_realty" value={formData.flag_own_realty} onChange={handleChange} className="form-control">
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Financial Information */}
        {activeSection === 'financial' && (
          <div className="card fade-in">
            <div className="card-header">
              <FaDollarSign />
              <h2>Financial Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Total Annual Income <span>*</span></label>
                <input
                  type="number"
                  name="amt_income_total"
                  value={formData.amt_income_total}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 200000"
                  min="0"
                />
                <p className="form-hint">Annual income in local currency</p>
              </div>

              <div className="form-group">
                <label>Credit Amount Requested <span>*</span></label>
                <input
                  type="number"
                  name="amt_credit"
                  value={formData.amt_credit}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 500000"
                  min="0"
                />
                <p className="form-hint">Total loan amount requested</p>
              </div>

              <div className="form-group">
                <label>Loan Annuity</label>
                <input
                  type="number"
                  name="amt_annuity"
                  value={formData.amt_annuity}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 25000"
                  min="0"
                />
                <p className="form-hint">Monthly payment amount (optional)</p>
              </div>

              <div className="form-group">
                <label>Goods Price</label>
                <input
                  type="number"
                  name="amt_goods_price"
                  value={formData.amt_goods_price}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 450000"
                  min="0"
                />
                <p className="form-hint">Price of goods for consumer loans (optional)</p>
              </div>

              <div className="form-group">
                <label>Contract Type</label>
                <select name="name_contract_type" value={formData.name_contract_type} onChange={handleChange} className="form-control">
                  <option value="Cash loans">Cash Loan</option>
                  <option value="Revolving loans">Revolving Loan</option>
                </select>
              </div>

              <div className="form-group">
                <label>External Score 1</label>
                <input
                  type="number"
                  name="ext_source_1"
                  value={formData.ext_source_1}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0.0 - 1.0"
                  min="0"
                  max="1"
                  step="0.01"
                />
                <p className="form-hint">External credit score (0-1)</p>
              </div>

              <div className="form-group">
                <label>External Score 2</label>
                <input
                  type="number"
                  name="ext_source_2"
                  value={formData.ext_source_2}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0.0 - 1.0"
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>External Score 3</label>
                <input
                  type="number"
                  name="ext_source_3"
                  value={formData.ext_source_3}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0.0 - 1.0"
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        {/* Employment Information */}
        {activeSection === 'employment' && (
          <div className="card fade-in">
            <div className="card-header">
              <FaBriefcase />
              <h2>Employment Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Income Type <span>*</span></label>
                <select name="name_income_type" value={formData.name_income_type} onChange={handleChange} className="form-control">
                  <option value="Working">Working</option>
                  <option value="Commercial associate">Commercial Associate</option>
                  <option value="Pensioner">Pensioner</option>
                  <option value="State servant">State Servant</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div className="form-group">
                <label>Education Level <span>*</span></label>
                <select name="name_education_type" value={formData.name_education_type} onChange={handleChange} className="form-control">
                  <option value="Secondary / secondary special">Secondary / Secondary Special</option>
                  <option value="Higher education">Higher Education</option>
                  <option value="Incomplete higher">Incomplete Higher</option>
                  <option value="Lower secondary">Lower Secondary</option>
                  <option value="Academic degree">Academic Degree</option>
                </select>
              </div>

              <div className="form-group">
                <label>Years Employed <span>*</span></label>
                <input
                  type="number"
                  name="days_employed"
                  value={formData.days_employed ? Math.abs(formData.days_employed) / 365 : ''}
                  onChange={(e) => {
                    const years = e.target.value;
                    setFormData(prev => ({ ...prev, days_employed: years ? -years * 365 : '' }));
                  }}
                  className="form-control"
                  placeholder="e.g., 5"
                  min="0"
                  step="0.1"
                />
                <p className="form-hint">Years at current employment</p>
              </div>

              <div className="form-group">
                <label>Occupation Type</label>
                <select name="occupation_type" value={formData.occupation_type} onChange={handleChange} className="form-control">
                  <option value="">Select occupation...</option>
                  <option value="Laborers">Laborers</option>
                  <option value="Sales staff">Sales Staff</option>
                  <option value="Core staff">Core Staff</option>
                  <option value="Managers">Managers</option>
                  <option value="Drivers">Drivers</option>
                  <option value="High skill tech staff">High Skill Tech Staff</option>
                  <option value="Accountants">Accountants</option>
                  <option value="Medicine staff">Medicine Staff</option>
                  <option value="Security staff">Security Staff</option>
                  <option value="Cooking staff">Cooking Staff</option>
                  <option value="Cleaning staff">Cleaning Staff</option>
                  <option value="Private service staff">Private Service Staff</option>
                  <option value="Low-skill Laborers">Low-skill Laborers</option>
                  <option value="Secretaries">Secretaries</option>
                  <option value="Waiters/barmen staff">Waiters/Barmen Staff</option>
                  <option value="Realty agents">Realty Agents</option>
                  <option value="HR staff">HR Staff</option>
                  <option value="IT staff">IT Staff</option>
                </select>
              </div>

              <div className="form-group">
                <label>Organization Type</label>
                <select name="organization_type" value={formData.organization_type} onChange={handleChange} className="form-control">
                  <option value="">Select organization...</option>
                  <option value="Business Entity Type 3">Business Entity Type 3</option>
                  <option value="Business Entity Type 2">Business Entity Type 2</option>
                  <option value="Business Entity Type 1">Business Entity Type 1</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Government">Government</option>
                  <option value="Medicine">Medicine</option>
                  <option value="School">School</option>
                  <option value="Trade: type 7">Trade: Type 7</option>
                  <option value="Construction">Construction</option>
                  <option value="Transport: type 4">Transport: Type 4</option>
                  <option value="Industry: type 9">Industry: Type 9</option>
                  <option value="Security">Security</option>
                  <option value="Military">Military</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Has Work Phone</label>
                <select name="flag_work_phone" value={formData.flag_work_phone} onChange={handleChange} className="form-control">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Has Email</label>
                <select name="flag_email" value={formData.flag_email} onChange={handleChange} className="form-control">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Housing Information */}
        {activeSection === 'housing' && (
          <div className="card fade-in">
            <div className="card-header">
              <FaHome />
              <h2>Housing Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Housing Type <span>*</span></label>
                <select name="name_housing_type" value={formData.name_housing_type} onChange={handleChange} className="form-control">
                  <option value="House / apartment">House / Apartment</option>
                  <option value="With parents">With Parents</option>
                  <option value="Municipal apartment">Municipal Apartment</option>
                  <option value="Rented apartment">Rented Apartment</option>
                  <option value="Office apartment">Office Apartment</option>
                  <option value="Co-op apartment">Co-op Apartment</option>
                </select>
              </div>

              <div className="form-group">
                <label>Region Population Relative</label>
                <input
                  type="number"
                  name="region_population_relative"
                  value={formData.region_population_relative}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 0.02"
                  min="0"
                  max="1"
                  step="0.001"
                />
                <p className="form-hint">Normalized population of region (0-1)</p>
              </div>

              <div className="form-group">
                <label>Has Mobile Phone</label>
                <select name="flag_mobil" value={formData.flag_mobil} onChange={handleChange} className="form-control">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Has Home Phone</label>
                <select name="flag_phone" value={formData.flag_phone} onChange={handleChange} className="form-control">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation and Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {activeSection !== 'personal' && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
                }}
              >
                Previous
              </button>
            )}
            {activeSection !== 'housing' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1].id);
                }}
              >
                Next
              </button>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary btn-lg">
            <FaClipboardCheck /> Get Risk Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;
