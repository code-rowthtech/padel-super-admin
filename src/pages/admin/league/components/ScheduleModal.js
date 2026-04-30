import React, { useRef, useEffect } from 'react';
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';
import { IoCalendarClearOutline } from "react-icons/io5";

const ScheduleModal = ({
  show,
  onHide,
  formDate,
  setFormDate,
  formVenue,
  setFormVenue,
  formCategory,
  setFormCategory,
  availableCategories = [],
  isHomeVenue,
  setIsHomeVenue,
  selectedRound,
  clubs,
  onCreateDate,
  onDateChange,
  showConfirmationModal,
  isCreatingSchedule = false
}) => {
  const dateInputRef = useRef(null);

  // Convert MM/DD/YY to YYYY-MM-DD for date input
  const getDateInputValue = () => {
    if (!formDate) return '';
    const [month, day, year] = formDate.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  useEffect(() => {
    if (show && dateInputRef.current && formDate) {
      dateInputRef.current.value = getDateInputValue();
    }
  }, [show, formDate]);

  return (
    <Modal show={show} onHide={onHide} centered className={`${showConfirmationModal ? 'd-none' : ''}`}>
      <Modal.Header className="border-bottom d-flex justify-content-between align-items-center" style={{ padding: '20px' }}>
        <Modal.Title style={{ fontWeight: '600', fontSize: '20px', color: 'rgba(37, 37, 37, 1)' }}>
          <IoCalendarClearOutline size={18} /> Day one schedule
        </Modal.Title>
        <MdClose size={24} onClick={onHide} style={{ cursor: 'pointer' }} />
      </Modal.Header>
      <Modal.Body style={{ padding: '20px' }}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Date</Form.Label>
            <InputGroup>
              <Form.Control
                ref={dateInputRef}
                type="date"
                className='py-3'
                defaultValue={getDateInputValue()}
                onChange={onDateChange}
                style={{
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: "rgba(204, 210, 221, 0.43)",
                  boxShadow: "none"
                }}
              />
            </InputGroup>
          </Form.Group>

          {/* Show category dropdown only for finals */}
          {selectedRound === 'final' && (
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Category</Form.Label>
              <Form.Select
                value={formCategory}
                className='py-3'
                onChange={(e) => setFormCategory(e.target.value)}
                style={{
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: "rgba(204, 210, 221, 0.43)",
                  boxShadow: "none"
                }}
              >
                <option value="">Select Category</option>
                {availableCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryType}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Venue</Form.Label>
            <Form.Select
              value={formVenue}
              className='py-3'
              onChange={(e) => setFormVenue(e.target.value)}
              style={{
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: "rgba(204, 210, 221, 0.43)",
                boxShadow: "none"
              }}
            >
              <option value="">Select Venue</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.name}>
                  {club.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {/* {selectedRound === 'final' && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(204, 210, 221, 0.2)', border: '1px dashed #ced4da' }}>
                <div className="text-center flex-fill">
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Column 1</div>
                  <div style={{ fontWeight: '700', color: '#1F41BB', fontSize: '15px' }}>Winner 1</div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#ced4da' }}>VS</div>
                <div className="text-center flex-fill">
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Column 2</div>
                  <div style={{ fontWeight: '700', color: '#1F41BB', fontSize: '15px' }}>Winner 2</div>
                </div>
              </div>
            </div>
          )} */}
          {/* Show Home/Away venue type for regular, quarter-final, and semi-final */}
          {selectedRound !== 'final' && (
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Venue Type</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  id="home-venue"
                  name="venueType"
                  label="Home"
                  checked={isHomeVenue}
                  onChange={() => setIsHomeVenue(true)}
                  style={{ fontSize: '14px' }}
                />
                <Form.Check
                  type="radio"
                  id="away-venue"
                  name="venueType"
                  label="Away"
                  checked={!isHomeVenue}
                  onChange={() => setIsHomeVenue(false)}
                  style={{ fontSize: '14px' }}
                />
              </div>
            </Form.Group>
          )}
          <Button
            variant="primary"
            className="w-100"
            style={{
              padding: '12px',
              backgroundColor: 'rgba(31, 65, 187, 1)',
              border: 'none',
              fontWeight: '600'
            }}
            onClick={onCreateDate}
            disabled={!formDate || !formVenue || (selectedRound === 'final' && !formCategory) || isCreatingSchedule}
          >
            {isCreatingSchedule ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Creating...
              </>
            ) : (
              'Create Match'
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ScheduleModal;