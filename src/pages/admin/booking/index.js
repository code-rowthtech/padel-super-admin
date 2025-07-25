import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Tabs,
  Tab,
  Table,
  Button,
  Form,
} from "react-bootstrap";
import { FaEye } from "react-icons/fa";

const dummyData = [
  { user: "Floyd Miles", date: "28th June 8:00am", court: 3 },
  { user: "Arlene McCoy", date: "28th June 8:00am", court: 2 },
  { user: "Annette Black", date: "28th June 8:00am", court: 3 },
  { user: "Leslie Alexander", date: "28th June 8:00am", court: 1 },
  { user: "Floyd Miles", date: "28th June 8:00am", court: 3 },
  { user: "Leslie Alexander", date: "28th June 8:00am", court: 1 },
];

const Cancellation = () => {
  const [key, setKey] = useState("request");
  const [fromDate, setFromDate] = useState("2025-06-22");
  const [toDate, setToDate] = useState("2025-06-28");

  return (
    <Container fluid className="mt-4 px-4">
      <Row className="mb-3">
        <Col md={6}>
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            <Tab eventKey="request" title="Request" />
            <Tab eventKey="accepted" title="Accepted" />
            <Tab eventKey="rejected" title="Rejected" />
          </Tabs>
        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center gap-2">
          <Form.Label className="mb-0">From</Form.Label>
          <Form.Control
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ maxWidth: "180px" }}
          />
          <Form.Label className="mb-0">To</Form.Label>
          <Form.Control
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ maxWidth: "180px" }}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <h5 className="bg-light px-3 py-2 border-bottom">All Request</h5>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead style={{ backgroundColor: "#e8ecfc" }}>
              <tr>
                <th>User Name</th>
                <th>Date</th>
                <th>Court No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item, index) => (
                <tr key={index}>
                  <td>{item.user}</td>
                  <td>{item.date}</td>
                  <td>{item.court}</td>
                  <td className="text-center">
                    <Button variant="link">
                      <FaEye />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Cancellation;
