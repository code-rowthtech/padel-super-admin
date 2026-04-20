import React, { useEffect, useState } from 'react';
import { ownerApi } from '../../../helpers/api/apiCore';
import { toast } from 'react-toastify';

const XpSettings = () => {
  const [multiplier, setMultiplier] = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    ownerApi.get('/api/system-config/xpMultiplier')
      .then(res => setMultiplier(String(res.data?.data?.value ?? 10)))
      .catch(() => setMultiplier('10'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const val = parseFloat(multiplier);
    if (isNaN(val) || val <= 0) {
      toast.error('XP Multiplier must be a positive number');
      return;
    }
    setSaving(true);
    try {
      await ownerApi.put('/api/system-config/xpMultiplier', {
        value: val,
        description: 'Scales XP gains/losses for all league matches'
      });
      toast.success(`XP Multiplier updated to ${val}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header" style={{ background: 'rgb(31, 65, 187)', color: '#fff' }}>
              <h5 className="mb-0 fw-bold">⚙️ XP Settings</h5>
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-4">
                The XP Multiplier scales how much XP players earn or lose after each match.
                <br /><br />
                <strong>Formula:</strong><br />
                Winner gains: <code>baseXP × tierMultiplier × multiplier</code><br />
                Loser loses: <code>(baseXP × multiplier) / 2</code>
              </p>

              <div className="mb-4">
                <label className="form-label fw-semibold">XP Multiplier</label>
                {loading ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-12 rounded" style={{ height: 38 }} />
                  </div>
                ) : (
                  <input
                    type="number"
                    className="form-control"
                    value={multiplier}
                    min="0.1"
                    step="0.5"
                    onChange={e => setMultiplier(e.target.value)}
                    placeholder="e.g. 10"
                  />
                )}
                <div className="form-text">Default: 10. Higher = more XP per match.</div>
              </div>

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
