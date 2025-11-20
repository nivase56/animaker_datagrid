import React from "react";
import DataGridCell from "./DataGridCell";

interface DataGridRowProps {
  r: number;
  rowLabel: string;
  cols: number;
  data: string[];
  selR1: number;
  selR2: number;
  selC1: number;
  selC2: number;
  editing: { r: number; c: number } | null;
  editingValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  cellProps: (r: number, c: number) => {
    onPointerDown: (ev: React.PointerEvent<HTMLTableCellElement>) => void;
    onPointerEnter: () => void;
    onPointerUp: () => void;
    onDoubleClick: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  };
}

const DataGridRow: React.FC<DataGridRowProps> = ({
  r, rowLabel, cols, data, selR1, selR2, selC1, selC2, editing, editingValue, inputRef, cellProps
}) => (
  <tr key={`r-${r}`}>
    <th className="label-cell">{rowLabel}</th>
    {Array.from({ length: cols }).map((_, c) => {
      const isSelected = r >= selR1 && r <= selR2 && c >= selC1 && c <= selC2;
  const isEditing = !!(editing && editing.r === r && editing.c === c);
      return (
        <DataGridCell
          key={`cell-${r}-${c}`}
          r={r}
          c={c}
          value={data[c]}
          isSelected={isSelected}
          isEditing={isEditing}
          editingValue={editingValue}
          inputRef={inputRef}
          {...cellProps(r, c)}
        />
      );
    })}
  </tr>
);

export default DataGridRow;
