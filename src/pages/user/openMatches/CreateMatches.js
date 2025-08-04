import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Form, ProgressBar } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const CreateMatches = () => {
  const [selectedSlot, setSelectedSlot] = useState('9:00am');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDate, setSelectedDate] = useState('22 June');

  const timeSlots = ['8:00am', '9:00am', '10:00am', '11:00am', '12:00pm', '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm', '6:00pm', '7:00pm', '8:00pm', '9:00pm', '10:00pm', '11:00pm'];
  const dates = ['22 June', '23 June', '24 June', '25 June', '26 June', '27 June', '28 June'];
  const levels = ['Benninger', 'Intermediate', 'Advanced', 'Professional'];

  return (
    <Container fluid className="p-4" style={{ background: '#f9faff', minHeight: '100vh' }}>
      <Row>
        {/* Left Panel */}
        <Col md={7}>
          <h5 className="mb-3">Select Date</h5>
          <div className="d-flex align-items-center mb-3">
            <Button variant="light" className="me-2"><FaChevronLeft /></Button>
            {dates.map((date, i) => (
              <Card
                key={i}
                className={`me-2 px-3 py-2 ${selectedDate === date ? 'bg-dark text-white' : 'bg-light'}`}
                style={{ minWidth: '80px', cursor: 'pointer' }}
                onClick={() => setSelectedDate(date)}
              >
                <div className="text-center">{date}</div>
              </Card>
            ))}
            <Button variant="light"><FaChevronRight /></Button>
          </div>

          <h6 className="mb-2">Available Slots (60m)</h6>
          <div className="d-flex flex-wrap mb-4">
            {timeSlots.map((slot, i) => (
              <Button
                key={i}
                variant={selectedSlot === slot ? 'dark' : 'outline-secondary'}
                className="me-2 mb-2"
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>

          <h6 className="mb-3">Available Court</h6>
          {[1, 2, 3, 4].map((court) => (
            <Card key={court} className="mb-2 p-3 d-flex flex-row justify-content-between align-items-center">
              <div>
                <h6 className="mb-0">Court {court}</h6>
                <small>Outdoor | well | Double</small>
              </div>
              <div>₹1000</div>
            </Card>
          ))}
        </Col>

        {/* Right Panel */}
        <Col md={5}>
          <ProgressBar now={25} className="mb-4" style={{ height: '6px' }} />
          <Card className="p-4">
            <h5 className="mb-3">On the following scale, where would you place yourself?</h5>
            <Form>
              {levels.map((level, i) => (
                <Form.Check
                  key={i}
                  type="radio"
                  label={level}
                  name="level"
                  id={`level-${i}`}
                  value={level}
                  checked={selectedLevel === level}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="mb-3 border rounded px-3 py-2"
                />
              ))}
              <Button variant="success" className="mt-3">Next</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMatches;
