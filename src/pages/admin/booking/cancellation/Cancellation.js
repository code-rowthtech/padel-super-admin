// Cancellation.js
import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Table,
  Form,
  Row,
  Col,
  Button,
  InputGroup,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Cancellation = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Sample data
  const sampleData = [
    { userName: 'Floyd Miles', date: '29th June 8:00 am', courtNo: 3 },
    { userName: 'Arlene McCoy', date: '29th June 8:00 am', courtNo: 2 },
    { userName: 'Annetta Black', date: '29th June 8:00 am', courtNo: 3 },
    { userName: 'Leslie Alexander', date: '29th June 8:00 am', courtNo: 1 },
    { userName: 'Leslie Alexander', date: '29th June 8:00 am', courtNo: 3 },
    { userName: 'Floyd Miles', date: '29th June 8:00 am', courtNo: 3 },
    { userName: 'Arlene McCoy', date: '29th June 8:00 am', courtNo: 2 },
    { userName: 'Annetta Black', date: '29th June 8:00 am', courtNo: 3 },
    { userName: 'Leslie Alexander', date: '29th June 8:00 am', courtNo: 1 },
    { userName: 'Leslie Alexander', date: '29th June 8:00 am', courtNo: 3 },
  ];

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-4">Cancellation Requests</h3>

      {/* Tabs */}
      <Tabs defaultActiveKey="request" id="cancellation-tabs" className="mb-3">
        {/* Request Tab */}
        <Tab eventKey="request" title="Request">
          <h5>All Requests</h5>

          {/* Date Filters */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>From</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="shadow-sm"
              />
            </Col>
            <Col md={6}>
              <Form.Label>To</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="shadow-sm"
              />
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table striped bordered hover size="sm" className="align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>User Name</th>
                  <th>Date</th>
                  <th>Court No</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((item, index) => (
                  <tr key={index}>
                    <td className="text-start">{item.userName}</td>
                    <td>{item.date}</td>
                    <td>{item.courtNo}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="rounded-circle d-flex justify-content-center align-items-center" style={{ width: '36px', height: '36px' }}>
                        ⭕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        {/* Accepted Tab */}
        <Tab eventKey="accepted" title="Accepted">
          <h5>Accepted Cancellations</h5>
          <p>No accepted requests yet.</p>
        </Tab>

        {/* Rejected Tab */}
        <Tab eventKey="rejected" title="Rejected">
          <h5>Rejected Cancellations</h5>
          <p>No rejected requests yet.</p>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Cancellation;