import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAppUsers } from "../../../redux/admin/appUsers/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import Pagination from "../../../helpers/Pagination";

const AppUsers = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const defaultLimit = 20;

  const { users, loading } = useSelector((state) => state.appUsers);

  const usersData = users?.data || [];
  const totalItems = users?.total || 0;

  useEffect(() => {
    dispatch(getAppUsers({ page: currentPage, limit: defaultLimit }));
  }, [dispatch, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="p-0">
      <Row className="mb-5">
        <Col xs={12}>
          <div
            className="bg-white rounded shadow-sm p-2 p-md-3 d-flex flex-column"
            style={{ minHeight: "75vh" }}
          >
            <h6 className="mb-md-3 mb-2 tabel-title fs-6">
              Users with FCM Tokens
            </h6>

            {loading ? (
              <DataLoading height="60vh" />
            ) : usersData?.length > 0 ? (
              <>
                <div
                  className="flex-grow-1"
                  style={{
                    overflowY: "auto",
                    overflowX: "auto",
                    flex: "1 1 auto",
                    maxHeight: "calc(100vh - 300px)",
                  }}
                >
                  <Table
                    responsive
                    borderless
                    size="sm"
                    className="custom-table"
                  >
                    <thead>
                      <tr className="text-center">
                        <th className="d-lg-table-cell">Sr No.</th>
                        <th className="d-none d-lg-table-cell">User Name</th>
                        <th className="d-lg-none">User</th>
                        <th>Phone Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.map((user, idx) => (
                        <tr
                          key={user?._id}
                          className="table-data border-bottom align-middle text-center"
                        >
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "120px" }}
                          >
                            {idx + 1 + (currentPage - 1) * defaultLimit}
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "150px" }}
                          >
                            {user?.name
                              ? user.name.charAt(0).toUpperCase() +
                              user.name.slice(1)
                              : "N/A"}
                          </td>
                          <td className="small">
                            {user?.countryCode || ""} {user?.phoneNumber || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="mobile-card-table d-block d-md-none">
                  {usersData?.map((user) => (
                    <div key={user?._id} className="card mb-2">
                      <div className="card-body">
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Name:</span>
                          <span className="mobile-card-value">
                            {user?.name
                              ? user.name.charAt(0).toUpperCase() +
                              user.name.slice(1)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Email:</span>
                          <span className="mobile-card-value">
                            {user?.email || "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Phone:</span>
                          <span className="mobile-card-value">
                            {user?.countryCode || ""} {user?.phoneNumber || "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Status:</span>
                          <span className="mobile-card-value">
                            <span
                              className={`badge ${user?.isActive
                                  ? "bg-success"
                                  : "bg-secondary"
                                }`}
                            >
                              {user?.isActive ? "Active" : "Inactive"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                className="d-flex text-danger justify-content-center align-items-center"
                style={{ height: "60vh" }}
              >
                No users found!
              </div>
            )}

            {totalItems > defaultLimit && (
              <div
                className="pt-3 d-flex justify-content-center align-items-center border-top"
                style={{
                  marginTop: "auto",
                  backgroundColor: "white",
                }}
              >
                <Pagination
                  totalRecords={totalItems}
                  defaultLimit={defaultLimit}
                  handlePageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AppUsers;
