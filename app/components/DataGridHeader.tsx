import React from "react";

interface DataGridHeaderProps {
  colHeaders: string[];
}

const DataGridHeader: React.FC<DataGridHeaderProps> = ({ colHeaders }) => (
  <thead>
    <tr>
      <th className="corner" />
      {colHeaders.map((h, c) => (
        <th key={`h-${c}`} className="header-cell">
          <div className="header-inner">{h}</div>
        </th>
      ))}
    </tr>
  </thead>
);

export default DataGridHeader;
