import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getSubOwner } from "../../../redux/thunks";
import { FaEdit } from "react-icons/fa";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import Pagination from "../../../helpers/Pagination";
import SubOwnerModal from "./modal/SubOwnerModal";

const SubOwner = () => {
  const dispatch = useDispatch();
  const Owner = getOwnerFromSession();
  const ownerId = Owner?.generatedBy || Owner?._id;
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  // State
  const [selectedUser, setSelectedUser] = useState(null);

  const { getSubOwnerData, getSubOwnerLoading } = useSelector(
    (state) => state?.subOwner
  );
  const UserData = getSubOwnerData?.response;

  useEffect(() => {
    dispatch(getSubOwner({ ownerId, page: currentPage, limit: 10 }));
  }, [currentPage]);

  const totalRecords = UserData?.length || 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditUser = (item) => {
    setShowUserModal(true);
    setSelectedUser(item);
  };
  return (
    <Container fluid className="px-4">
      <Row className="mb-3">
        <Col
          md={12}
          className="d-flex justify-content-between align-items-center"
        >
          <h3>Users</h3>
          {!Owner?.generatedBy && (
            <button
              className="d-flex align-items-center position-relative p-0 border-0"
              style={{
                borderRadius: "20px 10px 10px 20px",
                background: "none",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() => setShowUserModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                className="p-1 rounded-circle bg-light"
                style={{ position: "relative", left: "10px" }}
              >
                <div
                  className="d-flex justify-content-center align-items-center text-white fw-bold"
                  style={{
                    backgroundColor: "#194DD5",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    fontSize: "20px",
                  }}
                >
                  +
                </div>
              </div>
              <div
                className="d-flex align-items-center text-white fw-medium"
                style={{
                  backgroundColor: "#194DD5",
                  padding: "0 16px",
                  height: "36px",
                  fontSize: "14px",
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                Add User
              </div>
            </button>
          )}
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-3">
            {getSubOwnerLoading ? (
              <DataLoading height="60vh" />
            ) : UserData?.length > 0 ? (
              <div className="custom-scroll-container">
                <Table responsive borderless size="sm" className="custom-table">
                  <thead>
                    <tr className="text-center">
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {UserData?.map((item) => (
                      <tr key={item._id} className="table-data border-bottom">
                        <td>{item?.name || "N/A"}</td>
                        <td>{item?.email || "N/A"}</td>
                        <td>
                          {" "}
                          {item?.countryCode || ""} {item?.phoneNumber || "-"}
                        </td>
                        <td style={{ cursor: "pointer" }}>
                          <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip>Edit User</Tooltip>}
                          >
                            <FaEdit
                              className="text-primary ms-1"
                              onClick={() => handleEditUser(item)}
                              size={18}
                            />
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div
                className="d-flex text-danger justify-content-center align-items-center"
                style={{ height: "60vh" }}
              >
                No User's were Found !
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col className="d-flex justify-content-center">
          <Pagination
            totalRecords={totalRecords}
            defaultLimit={10}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </Col>
      </Row>

      {/* Modals */}
      <SubOwnerModal
        show={showUserModal}
        onHide={() => {
          setShowUserModal(false);
          setTimeout(() => {
            setSelectedUser(null);
          }, 200);
        }}
        userData={selectedUser}
      />
    </Container>
  );
};

export default SubOwner;
