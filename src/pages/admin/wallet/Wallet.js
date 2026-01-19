import React, { useState, useEffect } from "react";
import { Row, Col, Container, Table, Card, Form, InputGroup, ListGroup, Badge } from "react-bootstrap";
import { FaSearch, FaFilter, FaWallet, FaHistory, FaUser } from "react-icons/fa";
import { DataLoading } from "../../../helpers/loading/Loaders";
import Pagination from "../../../helpers/Pagination";

const Wallet = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with actual API call
  const users = [
    {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543210",
      walletBalance: 5000,
      totalSpent: 15000,
      totalAdded: 20000,
      transactions: [
        { id: "t1", type: "debit", amount: 500, description: "Court Booking", date: "2024-01-15", balance: 5000 },
        { id: "t2", type: "credit", amount: 2000, description: "Wallet Recharge", date: "2024-01-14", balance: 5500 },
        { id: "t3", type: "debit", amount: 300, description: "Court Booking", date: "2024-01-13", balance: 3500 },
      ]
    },
    {
      _id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+91 9876543211",
      walletBalance: 3200,
      totalSpent: 8000,
      totalAdded: 11200,
      transactions: [
        { id: "t4", type: "debit", amount: 400, description: "Court Booking", date: "2024-01-15", balance: 3200 },
        { id: "t5", type: "credit", amount: 1000, description: "Wallet Recharge", date: "2024-01-12", balance: 3600 },
      ]
    },
    {
      _id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+91 9876543212",
      walletBalance: 7500,
      totalSpent: 12000,
      totalAdded: 19500,
      transactions: [
        { id: "t6", type: "credit", amount: 5000, description: "Wallet Recharge", date: "2024-01-16", balance: 7500 },
        { id: "t7", type: "debit", amount: 600, description: "Court Booking", date: "2024-01-15", balance: 2500 },
      ]
    },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalWalletBalance = users.reduce((sum, user) => sum + user.walletBalance, 0);
  const totalSpent = users.reduce((sum, user) => sum + user.totalSpent, 0);
  const totalAdded = users.reduce((sum, user) => sum + user.totalAdded, 0);

  const formatAmount = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 1000000) return `₹${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  const summaryCards = [
    { title: "Total Balance", value: formatAmount(totalWalletBalance), icon: <FaWallet size={24} />, color: "#4361ee" },
    { title: "Total Spent", value: formatAmount(totalSpent), icon: <FaHistory size={24} />, color: "#dc3545" },
    { title: "Total Added", value: formatAmount(totalAdded), icon: <FaWallet size={24} />, color: "#28a745" },
  ];

  return (
    <Container fluid className="px-0 px-md-0 mt-md-0 mt-2">
      <Row className="mb-2">
        {summaryCards.map((card, index) => (
          <Col key={index} md={4} className="mb-2">
            <Card className="shadow-sm border-0 rounded-3 h-100">
              <Card.Body className="p-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-0" style={{ fontSize: "10px", fontWeight: "500", textTransform: "uppercase" }}>{card.title}</p>
                    <h4 className="mb-0" style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>{card.value}</h4>
                  </div>
                  <div style={{ opacity: "0.15", color: card.color }}>{card.icon}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-1">
        <Col lg={2} md={3} className="pe-1">
          <div className="bg-white rounded-3 shadow-sm p-2" style={{ height: "calc(100vh - 180px)" }}>
            <div className="d-flex align-items-center mb-2 pb-2 border-bottom">
              <FaSearch className="text-primary me-1" size={12} />
              <h6 className="mb-0 fw-bold" style={{ fontSize: "13px" }}>Search Users</h6>
            </div>
            
            <Form.Group className="mb-2">
              <InputGroup size="sm">
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                  <FaSearch size={12} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: "11px", height: "32px" }}
                />
              </InputGroup>
            </Form.Group>

            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: "600" }}>USERS LIST</span>
                <Badge bg="primary" style={{ fontSize: "10px" }}>{filteredUsers.length}</Badge>
              </div>
              <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredUsers.map((user) => (
                    <ListGroup.Item
                      key={user._id}
                      action
                      active={selectedUser?._id === user._id}
                      onClick={() => handleUserClick(user)}
                      className="px-2 py-2"
                      style={{
                        cursor: "pointer",
                        borderLeft: selectedUser?._id === user._id ? "3px solid #4361ee" : "3px solid transparent",
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-2"
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: selectedUser?._id === user._id ? "#fff" : "#e7f3ff",
                            color: selectedUser?._id === user._id ? "#4361ee" : "#4361ee"
                          }}
                        >
                          <FaUser size={14} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold" style={{ fontSize: "12px" }}>{user.name}</div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>{user.phone}</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold" style={{ fontSize: "11px", color: selectedUser?._id === user._id ? "#fff" : "#28a745" }}>
                            ₹{user.walletBalance.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          </div>
        </Col>

        <Col lg={10} md={9} className="ps-0">
          <div className="bg-white rounded-3 shadow-sm p-3" style={{ height: "calc(100vh - 180px)", overflowY: "auto" }}>
            {selectedUser ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <h5 className="mb-1 fw-bold" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                      <FaWallet className="me-2 text-primary" />
                      {selectedUser.name}'s Wallet
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{selectedUser.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: "#e7f3ff" }}>
                        <div className="card-body p-3">
                          <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Current Balance</p>
                          <h4 className="mb-0 text-primary" style={{ fontSize: "20px", fontWeight: "700" }}>
                            ₹{selectedUser.walletBalance.toLocaleString()}
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffe7e7" }}>
                        <div className="card-body p-3">
                          <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Total Spent</p>
                          <h4 className="mb-0 text-danger" style={{ fontSize: "20px", fontWeight: "700" }}>
                            ₹{selectedUser.totalSpent.toLocaleString()}
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: "#e7ffe7" }}>
                        <div className="card-body p-3">
                          <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Total Added</p>
                          <h4 className="mb-0 text-success" style={{ fontSize: "20px", fontWeight: "700" }}>
                            ₹{selectedUser.totalAdded.toLocaleString()}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold mb-3" style={{ fontSize: "14px", color: "#374151" }}>
                    <FaHistory className="me-2" />
                    Transaction History
                  </h6>
                  <Table hover className="mb-0">
                    <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px" }}>Date</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px" }}>Type</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px" }}>Description</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px", textAlign: "right" }}>Amount</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px", textAlign: "right" }}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td style={{ fontSize: "13px", padding: "12px" }}>{formatDate(transaction.date)}</td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>
                            {transaction.type === "credit" ? (
                              <Badge bg="success" style={{ fontSize: "10px" }}>Credit</Badge>
                            ) : (
                              <Badge bg="danger" style={{ fontSize: "10px" }}>Debit</Badge>
                            )}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px" }}>{transaction.description}</td>
                          <td style={{ fontSize: "13px", padding: "12px", textAlign: "right", fontWeight: "600", color: transaction.type === "credit" ? "#28a745" : "#dc3545" }}>
                            {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                          </td>
                          <td style={{ fontSize: "13px", padding: "12px", textAlign: "right", fontWeight: "600" }}>
                            ₹{transaction.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100%" }}>
                <FaWallet size={64} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                <h5 className="text-muted">Select a user to view wallet details</h5>
                <p className="text-muted" style={{ fontSize: "14px" }}>Choose a user from the list on the left</p>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Wallet;
