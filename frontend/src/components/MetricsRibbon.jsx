import React from 'react';

export default function MetricsRibbon() {
  return (
    <div className="metrics-ribbon">
      <div className="metric-card orange"><h3>393</h3><p>Indent Processing</p></div>
      <div className="metric-card light-orange"><h3>8442</h3><p>Active Issues</p></div>
      <div className="metric-card blue"><h3>1579</h3><p>Gatepasses Issued</p></div>
      <div className="metric-card green"><h3>3038</h3><p>Items Received</p></div>
    </div>
  );
}