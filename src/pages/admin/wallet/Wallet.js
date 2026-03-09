import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Container, Table, Card, Form, InputGroup, ListGroup, Badge, Button } from "react-bootstrap";
import { FaSearch, FaFilter, FaWallet, FaHistory, FaUser, FaDownload } from "react-icons/fa";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { ownerApi } from "../../../helpers/api/apiCore";
import { SUPER_ADMIN_GET_WALLET_USERS, SUPER_ADMIN_GET_WALLET_TRANSACTIONS } from "../../../helpers/api/apiEndpoint";
import Pagination from "../../../helpers/Pagination";
import config from "../../../config";

// Add export endpoint
const SUPER_ADMIN_EXPORT_WALLET_BALANCES = `${config.API_URL}api/super-admin/export-wallet-balances`;

const Wallet = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [walletTotals, setWalletTotals] = useState({
    totalBalance: 0,
    totalSpent: 0,
    totalAdded: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotalRecords, setTransactionTotalRecords] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const transactionLimit = 20;

  const filteredWallets = wallets.filter(wallet =>
    wallet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${wallet.countryCode || ""} ${wallet.phoneNumber || ""}`.includes(searchQuery)
  );

  const handleWalletClick = (wallet) => {
    setSelectedWallet(wallet);
    setTransactionPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalWalletBalance = walletTotals.totalBalance || 0;
  const totalSpent = walletTotals.totalSpent || 0;
  const totalAdded = walletTotals.totalAdded || 0;

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 50,
          ...(searchQuery ? { search: searchQuery } : {})
        }).toString();
        const res = await ownerApi.get(`${SUPER_ADMIN_GET_WALLET_USERS}?${params}`);
        const data = res?.data?.data;
        const users = data?.users || [];
        setWallets(users);
        setWalletTotals(data?.totals || { totalBalance: 0, totalSpent: 0, totalAdded: 0 });
        
        // Auto-select first user if no user is selected and users exist
        if (!selectedWallet && users.length > 0) {
          setSelectedWallet(users[0]);
        }
      } catch (error) {
        console.error("Error fetching wallet users:", error);
        setWallets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedWallet?.walletId) {
        setTransactions([]);
        return;
      }
      try {
        setTransactionsLoading(true);
        const params = new URLSearchParams({
          walletId: selectedWallet.walletId,
          page: transactionPage,
          limit: transactionLimit
        }).toString();
        const res = await ownerApi.get(`${SUPER_ADMIN_GET_WALLET_TRANSACTIONS}?${params}`);
        const data = res?.data?.data;
        setTransactions(data?.transactions || []);
        setTransactionTotalRecords(data?.pagination?.totalItems || 0);
      } catch (error) {
        console.error("Error fetching wallet transactions:", error);
        setTransactions([]);
        setTransactionTotalRecords(0);
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchTransactions();
  }, [selectedWallet?.walletId, transactionPage]);

  const handleTransactionPageChange = (page) => {
    setTransactionPage(page);
  };

  const handleWalletExport = async () => {
    try {
      setExportLoading(true);
      const res = await ownerApi.get(SUPER_ADMIN_EXPORT_WALLET_BALANCES);
      if (res?.data?.success && res?.data?.data?.downloadUrl) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Wallet export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

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
                <Badge bg="primary" style={{ fontSize: "10px" }}>{filteredWallets.length}</Badge>
              </div>
              <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredWallets.map((wallet) => (
                    <ListGroup.Item
                      key={wallet.walletId}
                      action
                      active={selectedWallet?.walletId === wallet.walletId}
                      onClick={() => handleWalletClick(wallet)}
                      className="px-2 py-2"
                      style={{
                        cursor: "pointer",
                        borderLeft: selectedWallet?.walletId === wallet.walletId ? "3px solid #4361ee" : "3px solid transparent",
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
                            backgroundColor: selectedWallet?.walletId === wallet.walletId ? "#fff" : "#e7f3ff",
                            color: selectedWallet?.walletId === wallet.walletId ? "#4361ee" : "#4361ee"
                          }}
                        >
                          <FaUser size={14} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold" style={{ fontSize: "12px" }}>{wallet.name}</div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>
                            {wallet.countryCode || ""} {wallet.phoneNumber || ""}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold" style={{ fontSize: "11px", color: selectedWallet?.walletId === wallet.walletId ? "#fff" : "#28a745" }}>
                            ₹{(wallet.walletBalance || 0).toLocaleString()}
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
            {selectedWallet ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <h5 className="mb-1 fw-bold" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                      <FaWallet className="me-2 text-primary" />
                      {selectedWallet.name}'s Wallet
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{selectedWallet.email}</p>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleWalletExport}
                    disabled={exportLoading}
                    className="d-flex align-items-center gap-2"
                    style={{ borderRadius: "6px", fontSize: "13px", padding: "8px 16px" }}
                  >
                    <FaDownload size={12} />
                    <span>{exportLoading ? "Exporting..." : "Export Wallets"}</span>
                  </Button>
                </div>

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: "#e7f3ff" }}>
                        <div className="card-body p-3">
                          <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Current Balance</p>
                          <h4 className="mb-0 text-primary" style={{ fontSize: "20px", fontWeight: "700" }}>
                            ₹{(selectedWallet.walletBalance || 0).toLocaleString()}
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffe7e7" }}>
                        <div className="card-body p-3">
                          <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Total Spent</p>
                          <h4 className="mb-0 text-danger" style={{ fontSize: "20px", fontWeight: "700" }}>
                            ₹{(selectedWallet.totalSpent || 0).toLocaleString()}
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm" style={{ backgroundColor: "#e7ffe7" }}>
                        <div className="card-body p-3">
                          <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500" }}>Total Added</p>
                          <h4 className="mb-0 text-success" style={{ fontSize: "20px", fontWeight: "700" }}>
                            ₹{(selectedWallet.totalAdded || 0).toLocaleString()}
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
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px" }}>User</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px" }}>Date & Time</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px" }}>Type</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px" }}>Description</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px", textAlign: "right" }}>Amount</th>
                        <th style={{ fontSize: "12px", fontWeight: "600", padding: "12px", textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-3">
                            <DataLoading height="60px" />
                          </td>
                        </tr>
                      ) : transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <tr key={transaction._id}>
                            <td style={{ fontSize: "13px", padding: "12px" }}>
                              <div>
                                <div className="fw-medium" style={{ fontSize: "13px" }}>
                                  {transaction?.userId?.name || "N/A"}
                                </div>
                                <div className="text-muted" style={{ fontSize: "11px" }}>
                                  {transaction?.userId?.countryCode} {transaction?.userId?.phoneNumber}
                                </div>
                                <div className="text-muted" style={{ fontSize: "10px" }}>
                                  {transaction?.userId?.email}
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: "13px", padding: "12px" }}>
                              <div>
                                <div className="fw-medium" style={{ fontSize: "12px" }}>
                                  {formatDate(transaction.createdAt)}
                                </div>
                                <div className="text-muted" style={{ fontSize: "10px" }}>
                                  {new Date(transaction.createdAt).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: "13px", padding: "12px" }}>
                              <Badge 
                                bg={transaction.type === "credit" ? "success" : "danger"} 
                                style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "4px" }}
                              >
                                {transaction.type?.toUpperCase()}
                              </Badge>
                            </td>
                            <td style={{ fontSize: "13px", padding: "12px" }}>
                              <div className="text-wrap" style={{ maxWidth: "200px" }}>
                                {transaction.description || "-"}
                              </div>
                            </td>
                            <td style={{ fontSize: "14px", padding: "12px", textAlign: "right", fontWeight: "600", color: transaction.type === "credit" ? "#28a745" : "#dc3545" }}>
                              {transaction.type === "credit" ? "+" : "-"}₹{(transaction.amount || 0).toLocaleString()}
                            </td>
                            <td style={{ fontSize: "13px", padding: "12px", textAlign: "center" }}>
                              <Badge 
                                bg={transaction.status === "success" ? "success" : transaction.status === "pending" ? "warning" : "secondary"}
                                style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "4px" }}
                              >
                                {transaction.status?.toUpperCase() || "N/A"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-3 text-muted">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  {transactionTotalRecords > transactionLimit && (
                    <div
                      className="pt-3 d-flex justify-content-center align-items-center border-top"
                      style={{ backgroundColor: "white" }}
                    >
                      <Pagination
                        totalRecords={transactionTotalRecords}
                        defaultLimit={transactionLimit}
                        handlePageChange={handleTransactionPageChange}
                        currentPage={transactionPage}
                      />
                    </div>
                  )}
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
