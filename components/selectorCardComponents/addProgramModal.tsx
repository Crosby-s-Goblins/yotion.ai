import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Pose, Session } from './types';

interface AddProgramModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  userId: string;
  editing?: boolean;
  initialProgram?: Session | null;
  onDelete?: (id: string) => void;
}

interface PoseRow {
  poseId: number | null;
  timing: number;
  reverse: boolean;
  isAsymmetric: boolean;
}

export default function AddProgramModal({ open, onClose, onCreate, userId, editing = false, initialProgram, onDelete }: AddProgramModalProps) {
  const [programName, setProgramName] = useState('');
  const [error, setError] = useState('');
  const [poses, setPoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(false);
  const [poseRows, setPoseRows] = useState<PoseRow[]>([
    { poseId: null, timing: 60, reverse: false, isAsymmetric: false },
  ]);
  const [creating, setCreating] = useState(false);

  // Prefill fields if editing
  useEffect(() => {
    if (editing && initialProgram && open) {
      setProgramName(initialProgram.name || '');
      // Parse posesIn and poseTiming
      const posesIn: string[] = Array.isArray(initialProgram.posesIn)
        ? initialProgram.posesIn
        : typeof initialProgram.posesIn === 'string'
        ? JSON.parse(initialProgram.posesIn)
        : [];
      const poseTiming: number[] = Array.isArray(initialProgram.poseTiming)
        ? initialProgram.poseTiming.map(Number)
        : typeof initialProgram.poseTiming === 'string'
        ? JSON.parse(initialProgram.poseTiming).map(Number)
        : [];
      setPoseRows(
        posesIn.map((poseStr, idx) => {
          let poseId = poseStr;
          let reverse = false;
          if (typeof poseStr === 'string' && poseStr.endsWith('R')) {
            poseId = poseStr.slice(0, -1);
            reverse = true;
          }
          const pose = poses.find((p) => String(p.id) === String(poseId));
          return {
            poseId: Number(poseId),
            timing: poseTiming[idx] || 60,
            reverse,
            isAsymmetric: !!pose?.isAsymmetric,
          };
        })
      );
    } else if (!editing && open) {
      setProgramName('');
      setPoseRows([{ poseId: null, timing: 60, reverse: false, isAsymmetric: false }]);
    }
    // eslint-disable-next-line
  }, [editing, initialProgram, open, poses.length]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const fetchPoses = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('poseLibrary').select('*');
      setLoading(false);
      if (!error && data) {
        setPoses(data.sort((a: Pose, b: Pose) => a.name.localeCompare(b.name)));
      }
    };
    fetchPoses();
  }, [open]);

  useEffect(() => {
    setPoseRows((rows) =>
      rows.map((row) => {
        const pose = poses.find((p) => p.id === row.poseId);
        return { ...row, isAsymmetric: !!pose?.isAsymmetric };
      })
    );
  }, [poses]);

  if (!open) return null;

  const handleCreateOrUpdate = async () => {
    if (!programName.trim()) {
      setError('Program name is required.');
      return;
    }
    // Ignore the last (empty) row
    const validRows = poseRows.filter(row => row.poseId) as PoseRow[];
    if (validRows.length === 0 || validRows.some(row => !row.timing)) {
      setError('All poses and timings are required.');
      return;
    }
    setError('');
    setCreating(true);
    // Build posesIn and poseTiming arrays in order
    const posesIn = validRows.map(row =>
      row.isAsymmetric && row.reverse ? `${row.poseId}R` : String(row.poseId)
    );
    const poseTiming = validRows.map(row => Number(row.timing));
    // Build searchRes: comma-separated unique pose names in order
    const poseNames: string[] = [];
    validRows.forEach(row => {
      const pose = poses.find(p => p.id === row.poseId);
      if (pose && !poseNames.includes(pose.name)) {
        poseNames.push(pose.name);
      }
    });
    const searchRes = poseNames.join(', ');
    const supabase = createClient();
    let result;
    if (editing && initialProgram) {
      // Update
      const dbId = typeof initialProgram.id === 'string' && initialProgram.id.startsWith('user-')
        ? initialProgram.id.replace('user-', '')
        : initialProgram.id;
      result = await supabase.from('userSessionLibrary').update({
        name: programName.trim(),
        posesIn,
        poseTiming,
        searchRes,
      }).eq('id', dbId);
    } else {
      // Create
      result = await supabase.from('userSessionLibrary').insert({
        user_id: userId,
        name: programName.trim(),
        posesIn,
        poseTiming,
        searchRes,
      });
    }
    setCreating(false);
    if (result.error) {
      setError('Failed to save program.');
      return;
    }
    setProgramName('');
    setPoseRows([{ poseId: null, timing: 60, reverse: false, isAsymmetric: false }]);
    onCreate(programName.trim());
  };

  const handleDelete = async () => {
    if (!editing || !initialProgram) return;
    setCreating(true);
    const supabase = createClient();
    // Extract numeric id if prefixed
    const dbId = typeof initialProgram.id === 'string' && initialProgram.id.startsWith('user-')
      ? initialProgram.id.replace('user-', '')
      : initialProgram.id;
    const { error } = await supabase.from('userSessionLibrary').delete().eq('id', dbId);
    setCreating(false);
    if (error) {
      setError('Failed to delete program.');
      return;
    }
    if (onDelete) onDelete(String(initialProgram.id));
    handleClose();
  };

  const handleClose = () => {
    setProgramName('');
    setError('');
    setPoseRows([{ poseId: null, timing: 60, reverse: false, isAsymmetric: false }]);
    onClose();
  };

  const handlePoseChange = (idx: number, poseId: number) => {
    setPoseRows(rows => rows.map((row, i) =>
      i === idx ? { ...row, poseId, reverse: false, isAsymmetric: !!poses.find(p => p.id === poseId)?.isAsymmetric } : row
    ));
  };

  const handleTimingChange = (idx: number, timing: number) => {
    setPoseRows(rows => rows.map((row, i) =>
      i === idx ? { ...row, timing } : row
    ));
  };

  const handleReverseChange = (idx: number, reverse: boolean) => {
    setPoseRows(rows => rows.map((row, i) =>
      i === idx ? { ...row, reverse } : row
    ));
  };

  const handleRemoveRow = (idx: number) => {
    setPoseRows(rows => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);
  };

  // Move pose row up
  const moveRowUp = (idx: number) => {
    if (idx === 0) return;
    setPoseRows(rows => {
      const newRows = [...rows];
      const temp = newRows[idx - 1];
      newRows[idx - 1] = newRows[idx];
      newRows[idx] = temp;
      return newRows;
    });
  };

  // Move pose row down
  const moveRowDown = (idx: number) => {
    if (idx === poseRows.length - 1) return;
    setPoseRows(rows => {
      const newRows = [...rows];
      const temp = newRows[idx + 1];
      newRows[idx + 1] = newRows[idx];
      newRows[idx] = temp;
      return newRows;
    });
  };

  // Always show an empty row at the end for quick addition
  const displayRows: PoseRow[] = poseRows.some(row => !row.poseId)
    ? poseRows
    : [...poseRows, { poseId: null, timing: 60, reverse: false, isAsymmetric: false }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative bg-white border border-border/30 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-xl flex flex-col">
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-2xl font-bold">×</button>
        <div className="flex-grow flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-center mb-6 tracking-tight">{editing ? 'Edit Program' : 'Create a Custom Program'}</h2>
          <input
            type="text"
            className="w-full rounded-xl border border-border/30 py-2 px-4 mb-6 text-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            placeholder="Program Name"
            value={programName}
            onChange={e => setProgramName(e.target.value)}
            autoFocus
          />
          {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-6">
            {loading ? (
              <div className="text-center py-8">Loading poses...</div>
            ) : displayRows.map((row, idx) => (
              <div key={idx} className={`flex flex-row items-center gap-1 w-full bg-gray-50 rounded-xl py-1 px-2 border border-border/20 ${!row.poseId ? 'opacity-60' : ''}`}>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-primary p-1 h-7 w-7 disabled:opacity-30"
                    onClick={() => moveRowUp(idx)}
                    disabled={idx === 0 || !row.poseId}
                    title="Move up"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 8l-6 6h12l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/></svg>
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-primary p-1 h-7 w-7 disabled:opacity-30"
                    onClick={() => moveRowDown(idx)}
                    disabled={idx === poseRows.length - 1 || !row.poseId}
                    title="Move down"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 16l6-6H6l6 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/></svg>
                  </button>
                </div>
                <select
                  className="rounded-lg border border-border/20 py-2 px-3 text-base flex-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={row.poseId ?? ''}
                  onChange={e => {
                    handlePoseChange(idx, Number(e.target.value));
                    // If this is the last row and a pose is selected, add a new empty row
                    if (idx === poseRows.length - 1 && e.target.value) {
                      setPoseRows(rows => [...rows, { poseId: null, timing: 60, reverse: false, isAsymmetric: false }]);
                    }
                  }}
                >
                  <option value="" disabled>Select Pose</option>
                  {poses.map(pose => (
                    <option key={pose.id} value={pose.id}>{pose.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={10}
                  step={5}
                  className="rounded-lg border border-border/20 py-2 px-3 w-20 text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={row.timing}
                  onChange={e => handleTimingChange(idx, Number(e.target.value))}
                  placeholder="Seconds"
                  disabled={!row.poseId}
                />
                {row.isAsymmetric && row.poseId && (
                  <label className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={row.reverse}
                      onChange={e => handleReverseChange(idx, e.target.checked)}
                      className="accent-primary"
                    />
                    Reverse
                  </label>
                )}
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-red-500 p-1 h-7 w-7 rounded-full"
                  onClick={() => handleRemoveRow(idx)}
                  disabled={poseRows.length === 1 || !row.poseId}
                  title="Remove"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
          {/* No preview section */}
          {/* Sticky Footer Buttons */}
          <div className="flex gap-4 justify-center mt-4 sticky bottom-0 bg-white py-4 z-10 border-t border-border/20">
            <Button variant="outline" className="w-32 rounded-full" onClick={handleClose} disabled={creating}>Cancel</Button>
            <Button className="w-32 rounded-full" onClick={handleCreateOrUpdate} disabled={creating}>{creating ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save' : 'Create')}</Button>
            {editing && (
              <Button variant="destructive" className="w-32 rounded-full" onClick={handleDelete} disabled={creating}>Delete</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 