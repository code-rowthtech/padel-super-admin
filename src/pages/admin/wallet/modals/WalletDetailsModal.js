import React from "react";
import { Modal, Table, Badge } from "react-bootstrap";
import { FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";

export const WalletDetailsModal = ({ show, handleClose, userWallet }) => {
  if (!userWallet) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton style={{ borderBottom: "2px solid #f0f0f0" }}>
        <Modal.Title style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1F2937" }}>
          <FaWallet className="me-2 text-primary" />
          Wallet Details - {userWallet.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: "#e7f3ff" }}>
                <div className="card-body p-3">
                  <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Current Balance</p>
                  <h4 className="mb-0 text-primary" style={{ fontSize: "20px", fontWeight: "700" }}>
                    ₹{userWallet.walletBalance.toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffe7e7" }}>
                <div className="card-body p-3">
                  <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Total Spent</p>
                  <h4 className="mb-0 text-danger" style={{ fontSize: "20px", fontWeight: "700" }}>
                    ₹{userWallet.totalSpent.toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: "#e7ffe7" }}>
                <div className="card-body p-3">
                  <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Total Added</p>
                  <h4 className="mb-0 text-success" style={{ fontSize: "20px", fontWeight: "700" }}>
                    ₹{userWallet.totalAdded.toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h6 className="fw-bold mb-3" style={{ fontSize: "14px", color: "#374151" }}>Transaction History</h6>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                {userWallet.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td style={{ fontSize: "13px", padding: "12px" }}>{formatDate(transaction.date)}</td>
                    <td style={{ fontSize: "13px", padding: "12px" }}>
                      {transaction.type === "credit" ? (
                        <Badge bg="success" className="d-flex align-items-center gap-1" style={{ width: "fit-content" }}>
                          <FaArrowUp size={10} /> Credit
                        </Badge>
                      ) : (
                        <Badge bg="danger" className="d-flex align-items-center gap-1" style={{ width: "fit-content" }}>
                          <FaArrowDown size={10} /> Debit
                        </Badge>
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
        </div>

        <div className="mt-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1" style={{ fontSize: "12px", color: "#6c757d" }}>Email</p>
              <p className="mb-0 fw-semibold" style={{ fontSize: "13px" }}>{userWallet.email}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1" style={{ fontSize: "12px", color: "#6c757d" }}>Phone</p>
              <p className="mb-0 fw-semibold" style={{ fontSize: "13px" }}>{userWallet.phone}</p>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
