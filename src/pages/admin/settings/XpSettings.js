import React, { useEffect, useState } from 'react';
import { ownerApi } from '../../../helpers/api/apiCore';
import { toast } from 'react-toastify';

const DEFAULT_MULTIPLIERS = [
  { roundStart: 0, roundEnd: 3, multiplier: 10 },
  { roundStart: 4, roundEnd: 6, multiplier: 12 },
  { roundStart: 7, roundEnd: 10, multiplier: 15 },
  { roundStart: 11, roundEnd: 999, multiplier: 20 }
];

const XpSettings = () => {
  const [multipliers, setMultipliers] = useState(DEFAULT_MULTIPLIERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ownerApi.get('/api/system-config/xpMultiplierRounds')
      .then(res => {
        const value = res.data?.data?.value;
        if (value && Array.isArray(value) && value.length > 0) {
          setMultipliers(value);
        } else {
          setMultipliers(DEFAULT_MULTIPLIERS);
        }
      })
      .catch(() => setMultipliers(DEFAULT_MULTIPLIERS))
      .finally(() => setLoading(false));
  }, []);

  const handleMultiplierChange = (index, field, value) => {
    const updated = [...multipliers];
    updated[index][field] = field === 'multiplier' ? parseFloat(value) || 0 : parseInt(value) || 0;
    setMultipliers(updated);
  };

  const handleSave = async () => {
    // Validation
    for (let i = 0; i < multipliers.length; i++) {
      const m = multipliers[i];
      if (m.multiplier <= 0) {
        toast.error(`Round ${i + 1}: Multiplier must be positive`);
        return;
      }
      if (m.roundStart < 0 || m.roundEnd < 0) {
        toast.error(`Round ${i + 1}: Round numbers must be non-negative`);
        return;
      }
      if (m.roundStart > m.roundEnd) {
        toast.error(`Round ${i + 1}: Start round must be <= end round`);
        return;
      }
    }

    setSaving(true);
    try {
      await ownerApi.put('/api/system-config/xpMultiplierRounds', {
        value: multipliers,
        description: 'Round-based XP multipliers for league matches'
      });
      toast.success('XP Multipliers updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const addRound = () => {
    const lastRound = multipliers[multipliers.length - 1];
    setMultipliers([
      ...multipliers,
      { roundStart: lastRound.roundEnd + 1, roundEnd: lastRound.roundEnd + 5, multiplier: 10 }
    ]);
  };

  const removeRound = (index) => {
    if (multipliers.length <= 1) {
      toast.error('Must have at least one round');
      return;
    }
    setMultipliers(multipliers.filter((_, i) => i !== index));
  };

  const resetToDefaults = () => {
    setMultipliers(DEFAULT_MULTIPLIERS);
    toast.info('Reset to default values');
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ background: 'rgb(31, 65, 187)', color: '#fff' }}>
              <h5 className="mb-0 fw-bold">⚙️ XP Multiplier Settings</h5>
              <button 
                className="btn btn-sm btn-light"
                onClick={resetToDefaults}
                disabled={loading || saving}
              >
                Reset to Defaults
              </button>
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-4">
                Configure round-based XP multipliers. Each round range can have a different multiplier value.
                <br /><br />
                <strong>Formula:</strong><br />
                Winner gains: <code>baseXP × tierMultiplier × roundMultiplier</code><br />
                Loser loses: <code>(baseXP × roundMultiplier) / 2</code>
              </p>

              {loading ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-12 rounded mb-2" style={{ height: 60 }} />
                  <span className="placeholder col-12 rounded mb-2" style={{ height: 60 }} />
                  <span className="placeholder col-12 rounded" style={{ height: 60 }} />
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                          <th>Round Start</th>
                          <th>Round End</th>
                          <th>Multiplier</th>
                          <th style={{ width: '80px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {multipliers.map((m, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={m.roundStart}
                                min="0"
                                onChange={e => handleMultiplierChange(index, 'roundStart', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={m.roundEnd}
                                min="0"
                                onChange={e => handleMultiplierChange(index, 'roundEnd', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={m.multiplier}
                                min="0.1"
                                step="0.5"
                                onChange={e => handleMultiplierChange(index, 'multiplier', e.target.value)}
                              />
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => removeRound(index)}
                                disabled={multipliers.length <= 1}
                                title="Remove round"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-primary mb-3"
                    onClick={addRound}
                  >
                    + Add Round
                  </button>

                  <div className="alert alert-info small">
                    <strong>Examples:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Rounds 0-3: 10x multiplier</li>
                      <li>Rounds 4-6: 12x multiplier</li>
                      <li>Rounds 7-10: 15x multiplier</li>
                      <li>Rounds 11+: 20x multiplier</li>
                    </ul>
                  </div>
                </>
              )}

              <button
                className="btn w-100 text-white fw-bold"
                style={{ background: 'rgb(31, 65, 187)' }}
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XpSettings;
