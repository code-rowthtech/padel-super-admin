import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Container,
  Table,
  OverlayTrigger,
  Tooltip,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { FaEye, FaChartLine } from "react-icons/fa";
import {
  BsArrowUpRightCircleFill,
  BsFillArrowDownLeftCircleFill,
} from "react-icons/bs";
import { formatDate } from "../../../helpers/Formatting";
import {
  getBookingByStatus,
  getBookingDetailsById,
} from "../../../redux/thunks";
import { Link } from "react-router-dom";

const Payments = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const dispatch = useDispatch();
  const { getBookingData, getBookingLoading } = useSelector(
    (state) => state.booking
  );
  const [tab, setTab] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const bookings = getBookingData?.bookings || [];
  const status = tab === 0 ? "" : "refund";

  useEffect(() => {
    dispatch(
      getBookingByStatus({
        status,
        ownerId,
        //  startDate: formatDate(startDate), endDate: formatDate(endDate)
      })
    );
  }, [tab]);
  const ownerId = getUserFromSession()?._id;
  const [loadingBookingId, setLoadingBookingId] = useState(null);

  const handleBookingDetails = async (id) => {
    setLoadingBookingId(id); // Start loading for this ID
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setLoadingBookingId(null); // Stop loading
    }
  };

  const summaryCards = [
    {
      title: "Today Collection",
      value: "25Hrs",
      percent: "+15%",
      icon: <BsArrowUpRightCircleFill />,
      color: "success",
      bigicon: <FaChartLine size={35} />,
    },
    {
      title: "Monthly Collection",
      value: "30Hrs",
      percent: "-3.5%",
      icon: <BsFillArrowDownLeftCircleFill />,
      color: "danger",
      bigicon: <FaChartLine size={35} />,
    },
    {
      title: "Refund Amount",
      value: "3.5M",
      percent: "+15%",
      icon: <BsArrowUpRightCircleFill />,
      color: "success",
      bigicon: <FaChartLine size={35} />,
    },
  ];
  return (
    <Container fluid className=" px-4">
      <h3 className="fw-bold">Payment</h3>
      <Row className="mb-4">
        {summaryCards.map((card, index) => (
          <Col key={index} md={4} className="mb-3">
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="d-flex justify-content-between">
                <div className="mt-2">
                  <div className="table-data">{card.title}</div>
                  <div className="card-value">{card.value}</div>
                  <div
                    className={`d-flex align-items-center gap-1 text-${card.color} fw-semibold`}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        // transform:
                        //   card.color === "danger"
                        //     ? "rotate(45deg)"
                        //     : "rotate(-45deg)",
                        // transition: "transform 0.3s",
                      }}
                    >
                      {card.icon}
                    </span>
                    <span className="small">{card.percent}</span>
                  </div>
                </div>
                <div className=" mb-2 text-end">
                  <div className="mb-4 text-end text-dark">{card.bigicon}</div>
                  <Link to="#" className="dashboard-viewmore">
                    View Report
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="mb-3">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Box sx={{ bgcolor: "white" }}>
              <AppBar
                position="static"
                color="default"
                className="bg-white border-bottom border-light"
                elevation={0}
              >
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab className="fw-medium table-data" label="Recent" />
                  <Tab className="fw-medium table-data" label="Refund" />
                </Tabs>
              </AppBar>
            </Box>

            <div className="d-flex align-items-center gap-2">
              <span style={{ fontWeight: 600 }}>From</span>
              <div className="position-relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  customInput={
                    <button
                      style={{
                        border: "none",
                        backgroundColor: "white",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#495057",
                      }}
                    >
                      {startDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <MdDateRange className="ms-2 mb-1" size={20} />
                    </button>
                  }
                />
              </div>

              <span style={{ fontWeight: 600 }}>To</span>

              <div className="position-relative ">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  customInput={
                    <button
                      style={{
                        border: "none",
                        backgroundColor: "white",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#495057",
                      }}
                    >
                      {endDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <MdDateRange className="ms-2 mb-1" size={20} />
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-3">
            <h6 className="mb-3 tabel-title">
              {tab === 0 ? "Recent" : "Refund"} Transactions
            </h6>

            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : (
              <div
                className="custom-scroll-container"
                style={{ maxHeight: "290px", overflowY: "auto" }}
              >
                {bookings?.length > 0 ? (
                  <Table
                    responsive
                    borderless
                    size="sm"
                    className="custom-table"
                  >
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Contact</th>
                        <th>Booking Type</th>
                        <th>Court Name</th>
                        <th>Booking Amount</th>
                        <th>Booking Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.map((item, index) => (
                        <tr key={index}>
                          <td className="table-data border-bottom">
                            {item?.userId?.name || "N/A"}
                          </td>
                          <td className="table-data border-bottom">
                            {item?.userId?.countryCode || ""}
                            {item?.userId?.phoneNumber || "N/A"}
                          </td>
                          <td className="table-data border-bottom">
                            {item?.bookingType || "-"}
                          </td>
                          <td className="table-data border-bottom">
                            {item?.slot[0]?.courtName || "-"}
                          </td>
                          <td className="table-data border-bottom">
                            ₹{item?.totalAmount}
                          </td>
                          <td className="table-data border-bottom">
                            {formatDate(item?.bookingDate)}
                          </td>
                          <td
                            className="table-data border-bottom"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleBookingDetails(item?._id)}
                          >
                            {loadingBookingId === item?._id ? (
                              <ButtonLoading color="blue" />
                            ) : (
                              <FaEye className="text-primary" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div
                    className="d-flex text-danger justify-content-center align-items-center"
                    style={{ height: "30vh" }}
                  >
                    No
                    <span className="px-1">
                      {tab === 0
                        ? "Recent Tansactions were Found !"
                        : "Tansactions were Found for Refund !"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Payments;
