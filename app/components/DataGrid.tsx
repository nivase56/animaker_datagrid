"use client";

import React, { useEffect, useRef, useState } from "react";
import DataGridHeader from "./DataGridHeader";
import DataGridRow from "./DataGridRow";
import DataGridControls from "./DataGridControls";

type Coord = { r: number; c: number };

function normalizedBounds(a: Coord, b: Coord) {
  const r1 = Math.min(a.r, b.r);
  const r2 = Math.max(a.r, b.r);
  const c1 = Math.min(a.c, b.c);
  const c2 = Math.max(a.c, b.c);
  return { r1, r2, c1, c2 };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function DataGrid() {
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [data, setData] = useState<string[][]>(() =>
    Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ""))
  );
  const [rowLabels, setRowLabels] = useState<string[]>(() =>
    Array.from({ length: 5 }, (_, i) => `Label ${i + 1}`)
  );
  const [colHeaders, setColHeaders] = useState<string[]>(() =>
    Array.from({ length: 5 }, (_, i) => `Head ${i + 1}`)
  );
  // load persisted grid
  useEffect(() => {
    try {
      const raw = localStorage.getItem("animaker-datagrid:v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.data && Array.isArray(parsed.data)) {
  // avoid sync setState warning
        setTimeout(() => {
          setData(parsed.data);
          setRows(parsed.rows ?? parsed.data.length ?? 5);
          setCols(parsed.cols ?? parsed.data[0]?.length ?? 5);
          setRowLabels(
            parsed.rowLabels ??
              Array.from(
                { length: parsed.rows ?? parsed.data.length },
                (_, i) => `R${i + 1}`
              )
          );
          setColHeaders(
            parsed.colHeaders ??
              Array.from(
                { length: parsed.cols ?? parsed.data[0]?.length ?? 5 },
                (_, i) => `C${i + 1}`
              )
          );
        }, 0);
      }
    } catch {

    }
  }, []);

  // persist changes
  useEffect(() => {
    try {
      const payload = { rows, cols, data, rowLabels, colHeaders };
      localStorage.setItem("animaker-datagrid:v1", JSON.stringify(payload));
    } catch {

    }
  }, [rows, cols, data, rowLabels, colHeaders]);
  const pointerIsDownRef = useRef(false);
  const pointerMovedRef = useRef(false);
  const pointerDownCellRef = useRef<Coord | null>(null);
  const [focused, setFocused] = useState<Coord | null>(null);

  const [selectStart, setSelectStart] = useState<Coord | null>(null);
  const [selectEnd, setSelectEnd] = useState<Coord | null>(null);
  const selectingRef = useRef(false);

  const [editing, setEditing] = useState<Coord | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerUp() {
      selectingRef.current = false;
      pointerIsDownRef.current = false;
      pointerMovedRef.current = false;
      pointerDownCellRef.current = null;
    }
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, []);

  // keyboard handlers
  useEffect(() => {
    function writeSelectionToClipboard(cut = false) {

      const sel = editing
        ? { r1: editing.r, r2: editing.r, c1: editing.c, c2: editing.c }
        : selectStart && selectEnd
        ? normalizedBounds(selectStart, selectEnd)
        : focused
        ? { r1: focused.r, r2: focused.r, c1: focused.c, c2: focused.c }
        : null;
      if (!sel) return;
      const { r1, r2, c1, c2 } = sel;
      const lines: string[] = [];
      for (let r = r1; r <= r2; r++) {
        const row: string[] = [];
        for (let c = c1; c <= c2; c++) {
          if (editing && editing.r === r && editing.c === c) row.push(editingValue ?? "");
          else row.push((data[r] && data[r][c]) || "");
        }
        lines.push(row.join("\t"));
      }
      const text = lines.join("\n");
      navigator.clipboard
        ?.writeText(text)
        .then(() => {
          if (cut) {
            setData((prev) => {
              const next = prev.map((row) => row.slice());
              for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                  next[r][c] = "";
                }
              }
              return next;
            });
            if (editing) setEditing(null);
          }
        })
        .catch(() => {});
    }

    function onKey(e: KeyboardEvent) {
      const meta = e.ctrlKey || e.metaKey;

      if (meta && (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "x")) {
        e.preventDefault();
        writeSelectionToClipboard(e.key.toLowerCase() === "x");
        return;
      }


      if (!editing) {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          const cur = focused ?? selectStart ?? { r: 0, c: 0 };
          let nr = cur.r;
          let nc = cur.c;
          if (e.key === "ArrowLeft") nc = clamp(nc - 1, 0, cols - 1);
          if (e.key === "ArrowRight") nc = clamp(nc + 1, 0, cols - 1);
          if (e.key === "ArrowUp") nr = clamp(nr - 1, 0, rows - 1);
          if (e.key === "ArrowDown") nr = clamp(nr + 1, 0, rows - 1);
          setSelectStart({ r: nr, c: nc });
          setSelectEnd({ r: nr, c: nc });
          setFocused({ r: nr, c: nc });
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          const cur = focused ?? selectStart ?? { r: 0, c: 0 };
          setEditing(cur);
          setEditingValue(data[cur.r][cur.c] ?? "");
          return;
        }

        if (e.key === "Tab") {
          e.preventDefault();
          const cur = focused ?? selectStart ?? { r: 0, c: 0 };
          let nr = cur.r;
          let nc = cur.c + (e.shiftKey ? -1 : 1);
          if (nc >= cols) {
            nc = 0;
            nr = clamp(nr + 1, 0, rows - 1);
          }
          if (nc < 0) {
            nc = cols - 1;
            nr = clamp(nr - 1, 0, rows - 1);
          }
          setSelectStart({ r: nr, c: nc });
          setSelectEnd({ r: nr, c: nc });
          setFocused({ r: nr, c: nc });
          return;
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, selectStart, selectEnd, focused, editing, editingValue, rows, cols]);

  // auto-resize editing input
  useEffect(() => {
    function adjust() {
      const inp = inputRef.current;
      const meas = measureRef.current;
      if (!inp || !meas || !editing) return;

      meas.textContent = editingValue ?? "";

  const desired = meas.scrollWidth + 12;
      const td = containerRef.current?.querySelector(
        `td[data-row='${editing.r}'][data-col='${editing.c}']`
      ) as HTMLElement | null;
      const max = td ? Math.max(40, td.clientWidth - 8) : 400;
      const width = Math.min(desired, max);
      inp.style.width = width + "px";
    }

    adjust();
    window.addEventListener("resize", adjust);
    return () => window.removeEventListener("resize", adjust);
  }, [editingValue, editing, rows, cols]);



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
  setRowLabels((prev) => [...prev, `Label ${prev.length + 1}`]);
      return next;
    });
  }

  function addCol() {
    setData((prev) => {
  return prev.map((row) => [...row, ""]);
    });

    setColHeaders((prev) => [...prev, `Head ${prev.length + 1}`]);

    setCols((prev) => prev + 1);
  }

  function onCellDoubleClick(r: number, c: number) {
    setEditing({ r, c });
    setEditingValue(data[r][c] ?? "");
  }

  function commitEdit() {
    if (editing) {
      setCell(editing.r, editing.c, editingValue);
      const cur = editing;
      setTimeout(() => {
        setEditing(null);
        setFocused(cur);
      }, 0);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {

    if (editing) return;
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    e.preventDefault();


    const singleCell =
      selectStart &&
      selectEnd &&
      selectStart.r === selectEnd.r &&
      selectStart.c === selectEnd.c;
    const isTSV = text.includes("\t") || text.includes("\n");


    if (singleCell && isTSV) {
      const rowsText = text.split(/\r?\n/).filter((r) => r.length > 0);
      const parsed = rowsText.map((r) => r.split("\t"));
      const start = selectStart;
      const pasteR = parsed.length;
      const pasteC = parsed[0]?.length ?? 0;
      const newRows = Math.max(rows, start.r + pasteR);
      const newCols = Math.max(cols, start.c + pasteC);
      if (newRows !== rows) setRows(newRows);
      if (newCols !== cols) setCols(newCols);
      if (newRows !== rows)
        setRowLabels((prev) => {
          const out = prev.slice();
          while (out.length < newRows) out.push(`Row ${out.length + 1}`);
          return out;
        });
      if (newCols !== cols)
        setColHeaders((prev) => {
          const out = prev.slice();
          while (out.length < newCols) out.push(`Column ${out.length + 1}`);
          return out;
        });
      setData((prev) => {
        const next = Array.from({ length: newRows }, (_, r) =>
          Array.from(
            { length: newCols },
            (_, c) => (prev[r] && prev[r][c]) || ""
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
      return;
    }


    if (singleCell && !isTSV) {
      setEditing(selectStart);
      setEditingValue(text);
      setCell(selectStart.r, selectStart.c, text);
      setFocused(selectStart);
      return;
    }


    const rowsText = text.split(/\r?\n/).filter((r) => r.length > 0);
    const parsed = rowsText.map((r) => r.split("\t"));

    const start = selectStart ?? focused ?? { r: 0, c: 0 };
    const pasteR = parsed.length;
    const pasteC = parsed[0]?.length ?? 0;

    const newRows = Math.max(rows, start.r + pasteR);
    const newCols = Math.max(cols, start.c + pasteC);
    if (newRows !== rows) setRows(newRows);
    if (newCols !== cols) setCols(newCols);
    if (newRows !== rows)
      setRowLabels((prev) => {
        const out = prev.slice();
        while (out.length < newRows) out.push(`Label ${out.length + 1}`);
        return out;
      });
    if (newCols !== cols)
      setColHeaders((prev) => {
        const out = prev.slice();
        while (out.length < newCols) out.push(`Head ${out.length + 1}`);
        return out;
      });

    setData((prev) => {
      const next = Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) => (prev[r] && prev[r][c]) || "")
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
    <div className="datagrid-wrapper ">
      <DataGridControls onAddRow={addRow} onAddCol={addCol} />
      <div
        className="datagrid-container rounded-md"
        tabIndex={0}
        onPaste={handlePaste}
        ref={containerRef}
      >
        <table className="datagrid-table" role="grid">
          <DataGridHeader colHeaders={colHeaders} />
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <DataGridRow
                key={`r-${r}`}
                r={r}
                rowLabel={rowLabels[r]}
                cols={cols}
                data={data[r]}
                selR1={selR1}
                selR2={selR2}
                selC1={selC1}
                selC2={selC2}
                editing={editing}
                editingValue={editingValue}
                inputRef={inputRef}
                cellProps={(rowIdx, colIdx) => ({
                  onPointerDown: (ev: React.PointerEvent<HTMLTableCellElement>) => {
                    ev.preventDefault();
                    containerRef.current?.focus();
                    pointerIsDownRef.current = true;
                    pointerMovedRef.current = false;
                    pointerDownCellRef.current = { r: rowIdx, c: colIdx };
                    if (ev.shiftKey && focused) {

                      setSelectStart(focused);
                      setSelectEnd({ r: rowIdx, c: colIdx });
                    } else {
                      setSelectStart({ r: rowIdx, c: colIdx });
                      setSelectEnd({ r: rowIdx, c: colIdx });
                      setFocused({ r: rowIdx, c: colIdx });
                    }
                  },
                  onPointerEnter: () => {
                    if (pointerIsDownRef.current) {
                      pointerMovedRef.current = true;
                      if (!selectingRef.current && pointerDownCellRef.current) {
                        startSelection(pointerDownCellRef.current.r, pointerDownCellRef.current.c);
                      }
                      extendSelection(rowIdx, colIdx);
                    }
                  },
                  onPointerUp: (ev?: React.PointerEvent<HTMLTableCellElement>) => {
                    if (!pointerMovedRef.current) {
                      if (editing && (editing.r !== rowIdx || editing.c !== colIdx)) {
                        commitEdit();
                      }
                      // Prevent edit mode on shift-click (selection extension)
                      if (ev && ev.shiftKey && focused) {
                        // Only update selection, do not enter edit mode or change focus
                        setSelectStart(focused);
                        setSelectEnd({ r: rowIdx, c: colIdx });
                        setEditing(null);
                      } else if (data[rowIdx][colIdx]) {
                        setSelectStart({ r: rowIdx, c: colIdx });
                        setSelectEnd({ r: rowIdx, c: colIdx });
                        setFocused({ r: rowIdx, c: colIdx });
                        setEditing({ r: rowIdx, c: colIdx });
                        setEditingValue(data[rowIdx][colIdx]);
                      } else {
                        setSelectStart({ r: rowIdx, c: colIdx });
                        setSelectEnd({ r: rowIdx, c: colIdx });
                        setFocused({ r: rowIdx, c: colIdx });
                        setEditing(null);
                      }
                    } else {
                      finishSelection();
                    }
                    pointerIsDownRef.current = false;
                    pointerMovedRef.current = false;
                    pointerDownCellRef.current = null;
                  },
                  onDoubleClick: () => onCellDoubleClick(rowIdx, colIdx),
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditingValue(e.target.value),
                  onBlur: () => commitEdit(),
                  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitEdit();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setEditing(null);
                    }
                  },
                })}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          visibility: "hidden",
          whiteSpace: "pre",
          fontFamily: "inherit",
          padding: "4px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
