import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Table, Spinner } from 'react-bootstrap';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { ownerAxios } from '../../../helpers/api/apiCore';
import { showSuccess, showError } from '../../../helpers/Toast';

const EMPTY_FORM = {
  court: '',
  streamKey: '',
  youtubeUrl: '',
  date: '',
  isActive: true,
};

const COURTS = ['Court 1', 'Court 2', 'Court 3', 'Court 4'];

const ObsSettingsModal = ({ show, onHide, leagueId, tournamentId, isLeague, title }) => {
  const [streams, setStreams]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    try {
      const params = isLeague ? { leagueId, isLeague: true } : { tournamentId, isLeague: false };
      const res = await ownerAxios.get('/api/obs-settings', { params });
      setStreams(res.data?.data || []);
    } catch {
      showError('Failed to load OBS settings');
    } finally {
      setLoading(false);
    }
  }, [leagueId, tournamentId, isLeague]);

  useEffect(() => {
    if (show) fetchStreams();
  }, [show, fetchStreams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (stream) => {
    setEditId(stream._id);
    setForm({
      court:      stream.court,
      streamKey:  stream.streamKey,
      youtubeUrl: stream.youtubeUrl,
      date:       stream.date?.split('T')[0] || '',
      isActive:   stream.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.court || !form.streamKey || !form.youtubeUrl || !form.date) {
      showError('All fields are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        isLeague:     !!isLeague,
        leagueId:     isLeague  ? leagueId     : null,
        tournamentId: !isLeague ? tournamentId : null,
      };
      if (editId) {
        await ownerAxios.put(`/api/obs-settings/${editId}`, payload);
        showSuccess('Stream updated');
      } else {
        await ownerAxios.post('/api/obs-settings', payload);
        showSuccess('Stream created');
      }
      handleCancel();
      fetchStreams();
    } catch (err) {
      // ownerAxios interceptor rejects with the message string directly
      const msg = typeof err === 'string' ? err : (err?.response?.data?.message || err?.message || 'Failed to save');
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await ownerAxios.delete(`/api/obs-settings/${id}`);
      showSuccess('Stream deleted');
      fetchStreams();
    } catch {
      showError('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      await ownerAxios.patch(`/api/obs-settings/${id}/toggle`);
      fetchStreams();
    } catch {
      showError('Failed to toggle');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #e5e7eb' }}>
        <Modal.Title style={{ fontSize: '16px', fontWeight: 700 }}>
          OBS Settings — {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '20px' }}>
        {/* Add / Edit Form */}
        {showForm ? (
          <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-3" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
            <h6 className="fw-bold mb-3" style={{ fontSize: '14px' }}>
              {editId ? 'Edit Stream' : 'Add New Stream'}
            </h6>
            <div className="row g-3">
              {/* Court Dropdown */}
              <div className="col-md-3">
                <Form.Label style={{ fontSize: '12px', fontWeight: 600 }}>Court *</Form.Label>
                <Form.Select
                  size="sm"
                  name="court"
                  value={form.court}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Court</option>
                  {COURTS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-md-3">
                <Form.Label style={{ fontSize: '12px', fontWeight: 600 }}>Stream Key *</Form.Label>
                <Form.Control
                  size="sm"
                  name="streamKey"
                  value={form.streamKey}
                  onChange={handleChange}
                  placeholder="YouTube stream key"
                  required
                />
              </div>

              <div className="col-md-3">
                <Form.Label style={{ fontSize: '12px', fontWeight: 600 }}>YouTube URL *</Form.Label>
                <Form.Control
                  size="sm"
                  name="youtubeUrl"
                  value={form.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  required
                />
              </div>

              <div className="col-md-2">
                <Form.Label style={{ fontSize: '12px', fontWeight: 600 }}>Date *</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-1 d-flex align-items-end pb-1">
                <Form.Check
                  type="switch"
                  name="isActive"
                  label="Active"
                  checked={form.isActive}
                  onChange={handleChange}
                  style={{ fontSize: '12px' }}
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                style={{ backgroundColor: '#1F41BB', border: 'none', fontSize: '12px', fontWeight: 600 }}
              >
                {saving ? <Spinner size="sm" /> : editId ? 'Update' : 'Save'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCancel} style={{ fontSize: '12px' }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="d-flex justify-content-end mb-3">
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: '#1F41BB', border: 'none', fontSize: '12px', fontWeight: 600 }}
            >
              <FaPlus size={11} className="me-1" /> Add Stream
            </Button>
          </div>
        )}

        {/* Streams Table */}
        {loading ? (
          <div className="text-center py-5"><Spinner /></div>
        ) : streams.length === 0 ? (
          <div className="text-center text-muted py-5" style={{ fontSize: '14px' }}>
            No OBS streams configured yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table borderless size="sm" className="custom-table">
              <thead>
                <tr className="text-center" style={{ fontSize: '12px', fontWeight: 600, background: '#f8f9fa' }}>
                  <th>#</th>
                  <th>Court</th>
                  <th>Stream Key</th>
                  <th>YouTube URL</th>
                  <th>Date</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {streams.map((s, idx) => (
                  <tr key={s._id} className="align-middle text-center border-bottom" style={{ fontSize: '12px' }}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{s.court}</td>
                    <td>
                      <code style={{ fontSize: '11px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                        {s.streamKey}
                      </code>
                    </td>
                    <td>
                      <a href={s.youtubeUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: '11px', color: '#1F41BB', maxWidth: '180px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.youtubeUrl}
                      </a>
                    </td>
                    <td>{new Date(s.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={s.isActive}
                        onChange={() => handleToggle(s._id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <FaEdit size={13} style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => handleEdit(s)} />
                        {deleting === s._id
                          ? <Spinner size="sm" style={{ width: '13px', height: '13px' }} />
                          : <FaTrash size={13} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDelete(s._id)} />
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ObsSettingsModal;
