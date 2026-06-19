import React, { useState, useEffect, useRef } from 'react';
import Login from './pages/Login'; 
import Sidebar from './components/Sidebar';
import MetricsRibbon from './components/MetricsRibbon';
import MasterTable from './components/MasterTable';
import useDraggable from './components/useDraggable';

// --- STABLE HARDWARE ACCELERATED MODAL WRAPPER ---
function DraggableModal({ title, onClose, children, width = '550px' }) {
  const modalRef = useRef(null);
  const headerRef = useRef(null);
  useDraggable(modalRef, headerRef);

  return (
    <div className="modal-overlay">
      {/* Absolute positional offsets provide clean structural center coordinates for drifting anchors */}
      <div ref={modalRef} className="modal-content" style={{ width, top: '25%', left: '35%' }}>
        <div ref={headerRef} className="modal-header">
          <h3>{title}</h3>
          <span style={{ cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }} onClick={onClose}>×</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('scms_token');
    return (!savedToken || savedToken === 'null' || savedToken === 'undefined') ? null : savedToken;
  });

  const [currentMenu, setCurrentMenu] = useState('store-config'); 
  const [activeTab, setActiveTab] = useState('store'); 
  const [search, setSearch] = useState('');
  
  // Data State Repositories
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  const [modalType, setModalType] = useState(null); 
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form Field State Trackers
  const [storeForm, setStoreForm] = useState({ store_code: '', store_name: '', store_type: 'BLOCK', officer_name: '', officer_mobile: '', officer_email: '' });
  const [empForm, setEmpForm] = useState({ emp_name: '', emp_designation: '', emp_contact_no: '', emp_emailid: '', store_code: '' });
  const [materialForm, setMaterialForm] = useState({ material_id: '', material_code: '', material_description: '', bis_code: '', hsn_code: '' });
  const [vendorForm, setVendorForm] = useState({ supplier_id: '', supplier_name: '', supplier_description: '', supplier_address: '', supplier_contact_no: '', supplier_email: '' });
  const [mnfForm, setMnfForm] = useState({ mnf_id: '', mnf_name: '', address: '', web_site: '' });

  const reloadData = () => {
    if (!token || token === 'null' || token === '') return;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    fetch('http://localhost:8080/api/admin/stores', { headers }).then(res => res.json()).then(d => setStores(d));
    fetch('http://localhost:8080/api/admin/employees', { headers }).then(res => res.json()).then(d => setEmployees(d));
    fetch('http://localhost:8080/api/admin/materials', { headers }).then(res => res.json()).then(d => setMaterials(d));
    fetch('http://localhost:8080/api/admin/suppliers', { headers }).then(res => res.json()).then(d => setSuppliers(d));
    fetch('http://localhost:8080/api/admin/manufacturers', { headers }).then(res => res.json()).then(d => setManufacturers(d));
  };

  useEffect(() => { if (token) reloadData(); }, [token]);

  const handleFormSubmit = async (endpoint, bodyData) => {
    const res = await fetch(`http://localhost:8080/api/admin/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(bodyData)
    });
    if (res.ok) {
      alert('Operational record saved successfully!');
      setModalType(null);
      reloadData();
    } else {
      alert('Failed to execute record write action.');
    }
  };

  if (!token) return <Login onLoginSuccess={(t) => { setToken(t); localStorage.setItem('scms_token', t); }} />;

  return (
    <div className="scms-layout">
      <Sidebar currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} />

      <div className="main-workspace">
        <header className="navbar-top">
          <div className="nav-profile"><strong>Himanish Saha</strong> | Administrator | RD Division Store</div>
          <div className="nav-actions">
            <a href="http://localhost:8081/" className="notification-link" title="Notifications">🔔</a>
            <button className="logout-btn" onClick={() => { setToken(null); localStorage.removeItem('scms_token'); }}>LOGOUT</button>
          </div>
        </header>

        <div className="content-area">
          <MetricsRibbon />

          <div className="data-card">
            {currentMenu === 'store-config' && (
              <>
                <div className="tabs-bar">
                  {['store', 'employee', 'material', 'vendor', 'manufacturer'].map(t => (
                    <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => { setActiveTab(t); setSearch(''); }}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="toolbar">
                  <div><button className="btn-util">CSV</button><button className="btn-util">Excel</button><button className="btn-util">PDF</button></div>
                  <div className="search-box">
                    <label>Search:</label>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Live matching ${activeTab} fields...`} />
                    <button className="action-btn-green" style={{ marginLeft: '10px' }} 
                      onClick={() => setModalType(`add${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}>
                      + Add {activeTab.toUpperCase()}
                    </button>
                  </div>
                </div>

                <div className="table-wrapper">
                  <MasterTable 
                    activeTab={activeTab} 
                    search={search} 
                    datasets={{ stores, employees, materials, suppliers, manufacturers }} 
                    setModalType={setModalType} 
                    setSelectedRecord={setSelectedRecord} 
                  />
                </div>
              </>
            )}

            {currentMenu !== 'store-config' && <div style={{ padding: '20px' }}><h3>Operational Dashboard Component Module Mounted</h3></div>}
          </div>
        </div>
      </div>

      {/* ==================== HIGH PERFORMANCE FORM MODALS ==================== */}
      
      {modalType === 'addStore' && (
        <DraggableModal title="Add New Store Hub" onClose={() => setModalType(null)}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label>Store Code</label><input type="text" onChange={e => setStoreForm({...storeForm, store_code: e.target.value})} /></div>
            <div><label>Store Name</label><input type="text" onChange={e => setStoreForm({...storeForm, store_name: e.target.value})} /></div>
            <div><label>Store Type</label><select onChange={e => setStoreForm({...storeForm, store_type: e.target.value})}><option value="BLOCK">BLOCK</option><option value="DIVISION">DIVISION</option></select></div>
            <div><label>Officer Name</label><input type="text" onChange={e => setStoreForm({...storeForm, officer_name: e.target.value})} /></div>
            <div><label>Officer Mobile</label><input type="text" onChange={e => setStoreForm({...storeForm, officer_mobile: e.target.value})} /></div>
            <div><label>Officer Email</label><input type="email" onChange={e => setStoreForm({...storeForm, officer_email: e.target.value})} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn-util" onClick={() => setModalType(null)}>Cancel</button>
            <button className="action-btn-green" onClick={() => handleFormSubmit('stores', { store_code: storeForm.store_code, store_name: storeForm.store_name, store_type: storeForm.store_type, officer_incharger_name: storeForm.officer_name, officer_incharger_mobile_no: storeForm.officer_mobile, officer_incharger_email: storeForm.officer_email })}>Save Store</button>
          </div>
        </DraggableModal>
      )}

      {modalType === 'addEmployee' && (
        <DraggableModal title="Add New System Employee Staff" onClose={() => setModalType(null)}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label>Full Name</label><input type="text" onChange={e => setEmpForm({...empForm, emp_name: e.target.value})} /></div>
            <div><label>Designation</label><input type="text" onChange={e => setEmpForm({...empForm, emp_designation: e.target.value})} /></div>
            <div><label>Contact Mobile</label><input type="text" onChange={e => setEmpForm({...empForm, emp_contact_no: e.target.value})} /></div>
            <div><label>Email Address</label><input type="email" onChange={e => setEmpForm({...empForm, emp_emailid: e.target.value})} /></div>
            <div><label>Assigned Store Code</label><input type="text" onChange={e => setEmpForm({...empForm, store_code: e.target.value})} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn-util" onClick={() => setModalType(null)}>Cancel</button>
            <button className="action-btn-green" onClick={() => handleFormSubmit('employees', empForm)}>Save Profile</button>
          </div>
        </DraggableModal>
      )}

      {modalType === 'addMaterial' && (
        <DraggableModal title="Add Material Master Record" onClose={() => setModalType(null)}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label>Material ID (Int PK)</label><input type="text" onChange={e => setMaterialForm({...materialForm, material_id: e.target.value})} /></div>
            <div><label>Material Code</label><input type="text" onChange={e => setMaterialForm({...materialForm, material_code: e.target.value})} /></div>
            <div><label>Material Description</label><input type="text" onChange={e => setMaterialForm({...materialForm, material_description: e.target.value})} /></div>
            <div><label>BIS Code Reference</label><input type="text" onChange={e => setMaterialForm({...materialForm, bis_code: e.target.value})} /></div>
            <div><label>HSN Core Code</label><input type="text" onChange={e => setMaterialForm({...materialForm, hsn_code: e.target.value})} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn-util" onClick={() => setModalType(null)}>Cancel</button>
            <button className="action-btn-green" onClick={() => handleFormSubmit('materials', materialForm)}>Save Material</button>
          </div>
        </DraggableModal>
      )}

      {modalType === 'addVendor' && (
        <DraggableModal title="Add Approved Supplier Vendor" onClose={() => setModalType(null)}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label>Supplier ID</label><input type="text" onChange={e => setVendorForm({...vendorForm, supplier_id: e.target.value})} /></div>
            <div><label>Supplier Name</label><input type="text" onChange={e => setVendorForm({...vendorForm, supplier_name: e.target.value})} /></div>
            <div><label>Inventory Profile Details</label><input type="text" onChange={e => setVendorForm({...vendorForm, supplier_description: e.target.value})} /></div>
            <div><label>Corporate Address Location</label><input type="text" onChange={e => setVendorForm({...vendorForm, supplier_address: e.target.value})} /></div>
            <div><label>Contact Phone Number</label><input type="text" onChange={e => setVendorForm({...vendorForm, supplier_contact_no: e.target.value})} /></div>
            <div><label>Email Address</label><input type="email" onChange={e => setVendorForm({...vendorForm, supplier_email: e.target.value})} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn-util" onClick={() => setModalType(null)}>Cancel</button>
            <button className="action-btn-green" onClick={() => handleFormSubmit('suppliers', vendorForm)}>Save Vendor</button>
          </div>
        </DraggableModal>
      )}

      {modalType === 'addManufacturer' && (
        <DraggableModal title="Add Industrial Manufacturer Record" onClose={() => setModalType(null)}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label>Manufacturer ID</label><input type="text" onChange={e => setMnfForm({...mnfForm, mnf_id: e.target.value})} /></div>
            <div><label>Manufacturer Corporate Name</label><input type="text" onChange={e => setMnfForm({...mnfForm, mnf_name: e.target.value})} /></div>
            <div><label>Plant Operations Address</label><input type="text" onChange={e => setMnfForm({...mnfForm, address: e.target.value})} /></div>
            <div><label>Web Endpoint URL</label><input type="text" onChange={e => setMnfForm({...mnfForm, web_site: e.target.value})} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn-util" onClick={() => setModalType(null)}>Cancel</button>
            <button className="action-btn-green" onClick={() => handleFormSubmit('manufacturers', mnfForm)}>Save Manufacturer</button>
          </div>
        </DraggableModal>
      )}

      {modalType === 'viewStore' && selectedRecord && (
        <DraggableModal title="Store Registry Inspector" onClose={() => setModalType(null)}>
          <div className="modal-body">
            <p><strong>Store Name Target:</strong> {selectedRecord.store_name}</p>
            <p><strong>Type Mapping:</strong> {selectedRecord.store_type}</p>
            <p><strong>Officer Incharge Name:</strong> {selectedRecord.officer_incharger_name || 'N/A'}</p>
            <p><strong>Officer Incharge Phone:</strong> {selectedRecord.officer_incharger_mobile_no || 'N/A'}</p>
          </div>
          <div className="modal-footer"><button className="btn-util" onClick={() => setModalType(null)}>Close</button></div>
        </DraggableModal>
      )}

      {modalType === 'pwdRequirement' && (
        <DraggableModal title="Security Policy System Rules" onClose={() => setModalType(null)}>
          <div className="modal-body">
            <h4>Password Complexity Policy Rule Matrix</h4>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '22px' }}>
              <li>Must be at least 8 characters in length.</li>
              <li>Must contain mandatory uppercase variations.</li>
            </ul>
          </div>
          <div className="modal-footer"><button className="btn-util" onClick={() => setModalType(null)}>Close Window</button></div>
        </DraggableModal>
      )}
    </div>
  );
}