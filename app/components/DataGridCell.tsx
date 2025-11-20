import React from "react";

interface DataGridCellProps {
  r: number;
  c: number;
  value: string;
  isSelected: boolean;
  isEditing: boolean;
  editingValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPointerDown: (ev: React.PointerEvent<HTMLTableCellElement>) => void;
  onPointerEnter: () => void;
  onPointerUp: () => void;
  onDoubleClick: () => void;
}

const DataGridCell: React.FC<DataGridCellProps> = ({
  r, c, value, isSelected, isEditing, editingValue, inputRef,
  onChange, onBlur, onKeyDown, onPointerDown, onPointerEnter, onPointerUp, onDoubleClick
}) => (
  <td
    data-row={r}
    data-col={c}
    key={`c-${r}-${c}`}
    className={`cell ${isSelected ? "selected" : ""}`}
    onPointerDown={onPointerDown}
    onPointerEnter={onPointerEnter}
    onPointerUp={onPointerUp}
    onDoubleClick={onDoubleClick}
  >
    {isEditing ? (
      <input
        ref={inputRef}
        autoFocus
        className="cell-input"
        value={editingValue}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    ) : (
      <div className="cell-display">{value}</div>
    )}
  </td>
);

export default DataGridCell;
