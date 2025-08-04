// DashboardPage.js
import React from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaArrowUp, FaArrowDown, FaEye } from "react-icons/fa";
import CustomTable from "../componets/CustomTable";
import { Link } from "react-router-dom";
import { MdOutlineDateRange, MdOutlineInsertDriveFile, MdOutlineTrendingUp, MdOutlineGroup } from "react-icons/md";


const chartData = [
  { year: "2020", lose: 2000, profit: 4000 },
  { year: "2021", lose: 2500, profit: 4800 },
  { year: "2022", lose: 2800, profit: 5000 },
  { year: "2023", lose: 4000, profit: 6800 },
  { year: "2024", lose: 3200, profit: 5300 },
  { year: "2025", lose: 3000, profit: 4900 }
];

const summaryCards = [
  {
    title: "Total Booking",
    value: "25Hrs",
    percent: "+15%",
    icon: <FaArrowUp />,
    color: "success",
    bigicon: <MdOutlineDateRange size={35} />
  },
  {
    title: "Upcoming Booking",
    value: "30Hrs",
    percent: "-3.5%",
    icon: <FaArrowDown />,
    color: "danger",
    bigicon: <MdOutlineInsertDriveFile size={35} />
  },
  {
    title: "Total Revenue",
    value: "3.5M",
    percent: "+15%",
    icon: <FaArrowUp />,
    color: "success",
    bigicon: <MdOutlineTrendingUp size={35} />
  },
  {
    title: "Cancellation Request",
    value: "15",
    percent: "-3.5%",
    icon: <FaArrowDown />,
    color: "danger",
    bigicon: <MdOutlineGroup size={35} />
  }
];

const cancellations = [
  { name: "Floyd Miles", date: "28th June ",time:'8:00am', courtNo: 3 },
  { name: "Arlene McCoy", date: "28th June ",time:'8:00am', courtNo: 2 },
  { name: "Annette Black", date: "28th June ",time:'8:00am', courtNo: 3 },
  { name: "Leslie Alexander", date: "28th June ",time:'8:00am', courtNo: 2 },
  { name: "Leslie Alexander", date: "28th June ",time:'8:00am', courtNo: 1 },
  { name: "Floyd Miles", date: "28th June ",time:'8:00am', courtNo: 3 },
  { name: "Arlene McCoy", date: "28th June ",time:'8:00am', courtNo: 2 },
  { name: "Annette Black", date: "28th June ",time:'8:00am', courtNo: 3 },
  { name: "Leslie Alexander", date: "28th June ",time:'8:00am', courtNo: 2 },
  { name: "Leslie Alexander", date: "28th June ",time:'8:00am', courtNo: 1 }
];

const headers = [
  { name: "User Name" },
  { name: "Date" },
  { name: "Court No" },
  { name: "Action" }
]

const AdminDashboard = () => {
  return (
    <Container fluid className="p-4" style={{ background: "#f4f7fd", minHeight: "100vh" }}>
      <Row className="mb-4">
        {summaryCards.map((card, index) => (
          <Col key={index} md={3} className="mb-3">
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="d-flex justify-content-between">
               
                <div className="mt-2">
                  <div className="table-data">{card.title}</div>
                  <div className="card-value">{card.value}</div>
                  <div className={`d-flex align-items-center gap-1 text-${card.color} fw-semibold`}>
                    <span style={{
                      display: 'inline-block',
                      transform: card.color === 'danger' ? 'rotate(45deg)' : 'rotate(-45deg)',
                      transition: 'transform 0.3s'
                    }}>
                      {card.icon}
                    </span>
                    <span className="small">{card.percent}</span>
                  </div>
                </div>
                 <div className=" mb-2 text-end">
                  <div className="mb-4 text-end text-dark">{card.bigicon}</div>
                  <Link to="#" className="dashboard-viewmore">View More</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>


      <Row className="mb-4">
        <Col md={7}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="tabel-title">Total Revenue</h6>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fill: '#3f51b5', fontSize: 14, fontWeight: "500" }} />
                  <YAxis tick={{ fill: '#3f51b5', fontSize: 14, fontWeight: "500" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="profit" stroke="#3f51b5" strokeWidth={3} />
                  <Line type="monotone" dataKey="lose" stroke="#f44336" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <h6 className="tabel-title">Today Cancellation</h6>
                <Link to="#" className="dashboard-viewmore">View More</Link>
              </div>
              <CustomTable cancellations={cancellations} headers={headers} scroll={true} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <h6 className="tabel-title">Recent Bookings</h6>
                <Link to="#" className="dashboard-viewmore">View More</Link>
              </div>
              <CustomTable cancellations={cancellations} headers={headers} scroll={true} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;