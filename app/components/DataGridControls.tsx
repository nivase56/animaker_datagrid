import React from "react";

interface DataGridControlsProps {
  onAddRow: () => void;
  onAddCol: () => void;
}

const DataGridControls: React.FC<DataGridControlsProps> = ({ onAddRow, onAddCol }) => (
  <div className="w-full flex justify-between gap-2 mb-2">
    <button className="px-4 shadow-md font-semibold rounded-md bg-[#ddffdd]" onClick={onAddRow}>
      Add Row +
    </button>
    <button className="p-2 shadow-md font-semibold rounded-md bg-[#ffdddd]" onClick={onAddCol}>
      Add Column +
    </button>
  </div>
);

export default DataGridControls;
