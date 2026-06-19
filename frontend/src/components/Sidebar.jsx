import React from 'react';

export default function Sidebar({ currentMenu, setCurrentMenu }) {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">SCMS</div>
      
      <div className="sidebar-group">Store Transactions</div>
      <div className={`sidebar-item ${currentMenu === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentMenu('transactions')}>
        • Active Store Ledger
      </div>

      <div className="sidebar-group">Planning</div>
      <div className={`sidebar-item ${currentMenu === 'planning' ? 'active' : ''}`} onClick={() => setCurrentMenu('planning')}>
        • Requisition Proposals
      </div>

      <div className="sidebar-group">Admin</div>
      <div className={`sidebar-item ${currentMenu === 'store-config' ? 'active' : ''}`} onClick={() => setCurrentMenu('store-config')}>
        • Store Configuration
      </div>
      <div className={`sidebar-item ${currentMenu === 'generate-so' ? 'active' : ''}`} onClick={() => setCurrentMenu('generate-so')}>
        • Generate SO
      </div>
      <div className={`sidebar-item ${currentMenu === 'rate-config' ? 'active' : ''}`} onClick={() => setCurrentMenu('rate-config')}>
        • Rate Configuration
      </div>
      <div className={`sidebar-item ${currentMenu === 'approve-emp' ? 'active' : ''}`} onClick={() => setCurrentMenu('approve-emp')}>
        • Approve Employee
      </div>
      <div className={`sidebar-item ${currentMenu === 'stock-status' ? 'active' : ''}`} onClick={() => setCurrentMenu('stock-status')}>
        • View Stock Status
      </div>

      <div className="sidebar-group">MIS</div>
      <div className={`sidebar-item ${currentMenu === 'mis' ? 'active' : ''}`} onClick={() => setCurrentMenu('mis')}>
        • System Audit Reports
      </div>
    </div>
  );
}