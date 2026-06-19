import React from 'react';

export default function MasterTable({ activeTab, search, datasets, setModalType, setSelectedRecord }) {
  const { stores, employees, materials, suppliers, manufacturers } = datasets;

  // SAFE REAL-TIME FILTERING SCANNERS: Custom targeted scans across accurate unique properties
  const getFilteredRows = (dataset, searchKey) => {
    if (!Array.isArray(dataset)) return [];
    if (!search.trim()) return dataset;
    return dataset.filter(row => {
      const fieldVal = row[searchKey];
      return fieldVal && String(fieldVal).toLowerCase().includes(search.toLowerCase().trim());
    });
  };

  switch (activeTab) {
    case 'store': {
      const filtered = getFilteredRows(stores, 'store_name');
      return (
        <table>
          <thead><tr><th>Store Code</th><th>Store Name</th><th>Store Type</th><th>Custodian Inspector</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map((store, idx) => (
              <tr key={idx}>
                <td>{store.store_code}</td>
                <td style={{ fontWeight: '500' }}>{store.store_name}</td>
                <td>{store.store_type}</td>
                <td>{store.officer_incharger_name || 'N/A'}</td>
                <td><button className="badge-btn green" onClick={() => { setSelectedRecord(store); setModalType('viewStore'); }}>view</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'employee': {
      const filtered = getFilteredRows(employees, 'emp_name');
      return (
        <table>
          <thead><tr><th>Employee Name</th><th>Designation Mapping</th><th>Contact Number</th><th>Action Controllers</th></tr></thead>
          <tbody>
            {filtered.map((emp, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 'bold' }}>{emp.emp_name}</td>
                <td>{emp.emp_designation}</td>
                <td>{emp.emp_contact_no}</td>
                <td>
                  <button className="badge-btn blue" onClick={() => { setSelectedRecord(emp); setModalType('pwdRequirement'); }}>Change password</button>
                  <button className="badge-btn green">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'material': {
      const filtered = getFilteredRows(materials, 'material_description');
      return (
        <table>
          <thead><tr><th>Material Code</th><th>Material Description</th><th>BIS Reference</th><th>HSN Code</th></tr></thead>
          <tbody>
            {filtered.map((mat, idx) => (
              <tr key={idx}>
                <td>{mat.material_code}</td>
                <td style={{ fontWeight: '500' }}>{mat.material_description}</td>
                <td>{mat.bis_code || 'N/A'}</td>
                <td>{mat.hsn_code || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'vendor': {
      const filtered = getFilteredRows(suppliers, 'supplier_name');
      return (
        <table>
          <thead><tr><th>Supplier Name</th><th>Description</th><th>Address</th><th>Contact No</th></tr></thead>
          <tbody>
            {filtered.map((sup, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 'bold' }}>{sup.supplier_name}</td>
                <td>{sup.supplier_description}</td>
                <td>{sup.supplier_address}</td>
                <td>{sup.supplier_contact_no}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'manufacturer': {
      const filtered = getFilteredRows(manufacturers, 'mnf_name');
      return (
        <table>
          <thead><tr><th>Manufacturer Name</th><th>Plant Location Address</th><th>Web Matrix Endpoint</th></tr></thead>
          <tbody>
            {filtered.map((mnf, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 'bold' }}>{mnf.mnf_name}</td>
                <td>{mnf.address}</td>
                <td>{mnf.web_site}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    default:
      return null;
  }
}