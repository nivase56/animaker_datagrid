"use client";

import React, { useEffect, useRef, useState } from "react";

type Coord = { r: number; c: number };

function normalizedBounds(a: Coord, b: Coord) {
  const r1 = Math.min(a.r, b.r);
  const r2 = Math.max(a.r, b.r);
  const c1 = Math.min(a.c, b.c);
  const c2 = Math.max(a.c, b.c);
  return { r1, r2, c1, c2 };
}

export default function DataGrid() {
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [data, setData] = useState<string[][]>(() =>
    Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ""))
  );
  const [rowLabels, setRowLabels] = useState<string[]>(() =>
    Array.from({ length: 5 }, (_, i) => `R${i + 1}`)
  );
  const [colHeaders, setColHeaders] = useState<string[]>(() =>
    Array.from({ length: 5 }, (_, i) => `C${i + 1}`)
  );

  const [selectStart, setSelectStart] = useState<Coord | null>(null);
  const [selectEnd, setSelectEnd] = useState<Coord | null>(null);
  const selectingRef = useRef(false);

  const [editing, setEditing] = useState<Coord | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerUp() {
      selectingRef.current = false;
    }
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "c") {
        if (selectStart && selectEnd) {
          e.preventDefault();
          const { r1, r2, c1, c2 } = normalizedBounds(selectStart, selectEnd);
          const lines: string[] = [];
          for (let r = r1; r <= r2; r++) {
            const row: string[] = [];
            for (let c = c1; c <= c2; c++) row.push(data[r][c] ?? "");
            lines.push(row.join("\t"));
          }
          const text = lines.join("\n");
          navigator.clipboard?.writeText(text).catch(() => {});
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, selectStart, selectEnd]);

  function startSelection(r: number, c: number) {
    setSelectStart({ r, c });
    setSelectEnd({ r, c });
    selectingRef.current = true;
    setEditing(null);
  }

  function extendSelection(r: number, c: number) {
    if (selectingRef.current) setSelectEnd({ r, c });
  }

  function finishSelection() {
    selectingRef.current = false;
  }

  function setCell(r: number, c: number, value: string) {
    setData((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = value;
      return next;
    });
  }

  function addRow() {
    setRows((n) => {
      const next = n + 1;
      setData((prev) => {
        const copy = prev.map((r) => r.slice());
        copy.push(Array.from({ length: cols }, () => ""));
        return copy;
      });
      setRowLabels((prev) => [...prev, `R${next}`]);
      return next;
    });
  }

  function addCol() {
    setCols((n) => {
      const next = n + 1;
      setData((prev) => prev.map((row) => [...row, ""]));
      setColHeaders((prev) => [...prev, `C${next}`]);
      return next;
    });
  }

  function onCellDoubleClick(r: number, c: number) {
    setEditing({ r, c });
    setEditingValue(data[r][c] ?? "");
  }

  function commitEdit() {
    if (editing) {
      setCell(editing.r, editing.c, editingValue);
      setEditing(null);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    e.preventDefault();

    const rowsText = text.split(/\r?\n/).filter((r) => r.length > 0);
    const parsed = rowsText.map((r) => r.split("\t"));

    const start = selectStart ?? { r: 0, c: 0 };
    const pasteR = parsed.length;
    const pasteC = parsed[0]?.length ?? 0;

    const needRows = Math.max(0, start.r + pasteR - rows);
    const needCols = Math.max(0, start.c + pasteC - cols);
    if (needRows > 0) setRows((n) => n + needRows);
    if (needCols > 0) setCols((n) => n + needCols);

    setTimeout(() => {
      setData((prev) => {
        const next = Array.from(
          { length: Math.max(rows, start.r + pasteR) },
          (_, r) =>
            Array.from({ length: Math.max(cols, start.c + pasteC) }, (_, c) =>
              prev[r] && prev[r][c] ? prev[r][c] : ""
            )
        );
        for (let r = 0; r < pasteR; r++) {
          for (let c = 0; c < pasteC; c++) {
            const rr = start.r + r;
            const cc = start.c + c;
            next[rr][cc] = parsed[r][c] ?? "";
          }
        }
        return next;
      });
    }, 0);
  }

  const {
    r1: selR1,
    r2: selR2,
    c1: selC1,
    c2: selC2,
  } = selectStart && selectEnd
    ? normalizedBounds(selectStart, selectEnd)
    : { r1: -1, r2: -2, c1: -1, c2: -2 };

  return (
    <div className="datagrid-wrapper">
      {/* TOP RIGHT BUTTON */}
      <div className="w-full flex justify-end">
        <button className="btn add-col-btn" onClick={addCol}>
          Add Column
        </button>
      </div>
      <div
        className="datagrid-container"
        tabIndex={0}
        onPaste={handlePaste}
        ref={containerRef}
      >
        <table className="datagrid-table" role="grid">
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

          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={`r-${r}`}>
                <th className="label-cell">{rowLabels[r]}</th>
                {Array.from({ length: cols }).map((_, c) => {
                  const isSelected =
                    r >= selR1 && r <= selR2 && c >= selC1 && c <= selC2;
                  const isEditing =
                    editing && editing.r === r && editing.c === c;

                  return (
                    <td
                      key={`c-${r}-${c}`}
                      className={`cell ${isSelected ? "selected" : ""}`}
                      onPointerDown={(ev) => {
                        ev.preventDefault();
                        startSelection(r, c);
                      }}
                      onPointerEnter={() => extendSelection(r, c)}
                      onPointerUp={() => finishSelection()}
                      onDoubleClick={() => onCellDoubleClick(r, c)}
                      onClick={() => {
                        setSelectStart({ r, c });
                        setSelectEnd({ r, c });
                        setEditing(null);
                      }}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="cell-input"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => commitEdit()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit();
                            if (e.key === "Escape") setEditing(null);
                          }}
                        />
                      ) : (
                        <div className="cell-display">{data[r][c]}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTTOM LEFT BUTTON */}
      <button className="btn add-row-btn" onClick={addRow}>
        Add Row
      </button>
    </div>
  );
}
