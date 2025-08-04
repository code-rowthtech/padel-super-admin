import React, { useState } from 'react';
import {
  Row,
  Col,
  Container,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import CustomTable from '../../componets/CustomTable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MdDateRange } from "react-icons/md";
import { BookingCancellationModal, BookingRefundModal, RefundSuccessModal } from './ModalCancellation';



function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const cancellations = [
  { name: "Floyd Miles", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Arlene McCoy", date: "28th June", time: '8:00am', courtNo: 2 },
  { name: "Annette Black", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Leslie Alexander", date: "28th June", time: '8:00am', courtNo: 1 },
  { name: "Floyd Miles", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Arlene McCoy", date: "28th June", time: '8:00am', courtNo: 2 },
  { name: "Annette Black", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Leslie Alexander", date: "28th June", time: '8:00am', courtNo: 1 },
  { name: "Floyd Miles", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Arlene McCoy", date: "28th June", time: '8:00am', courtNo: 2 },
  { name: "Annette Black", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Leslie Alexander", date: "28th June", time: '8:00am', courtNo: 1 },
  { name: "Floyd Miles", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Arlene McCoy", date: "28th June", time: '8:00am', courtNo: 2 },
  { name: "Annette Black", date: "28th June", time: '8:00am', courtNo: 3 },
  { name: "Leslie Alexander", date: "28th June", time: '8:00am', courtNo: 1 },
];

const headers = [
  { name: "User Name" },
  { name: "Date" },
  { name: "Court No" },
  { name: "Action" },
];
const Cancellation = () => {
  const [startDate, setStartDate] = useState(new Date('2025-06-22'));
  const [endDate, setEndDate] = useState(new Date('2025-06-28'));
  const theme = useTheme();
  const [showCancellation, setShowCancellation] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [value, setValue] = useState(0);
  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Container fluid className="mt-4 px-4">
      <Row className="mb-3">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Box sx={{ bgcolor: 'white' }}>
              <AppBar position="static" color="default" className="bg-white border-bottom border-light" elevation={0}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="white"
                >
                  <Tab className="fw-medium " label="Request" {...a11yProps(0)} />
                  <Tab className="fw-medium " label="Accepted" {...a11yProps(1)} />
                  <Tab className="fw-medium " label="Rejected" {...a11yProps(0)} />
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
                        border: 'none',
                        backgroundColor: 'white',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: '#495057'
                      }}
                    >
                      {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <MdDateRange className='ms-2 mb-1' size={20} />
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
                        border: 'none',
                        backgroundColor: 'white',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: '#495057'
                      }}
                    >
                      {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <MdDateRange className='ms-2 mb-1' size={20} />
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
          <TabPanel value={value} index={0} dir={theme.direction}>
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="mb-3 tabel-title">All Request</h6>
              <CustomTable cancellations={cancellations} headers={headers} setShowCancellation={setShowCancellation} type="booking" />
              <BookingCancellationModal
                show={showCancellation}
                handleClose={() => setShowCancellation(false)}
                openDetails={() => {
                  setShowCancellation(false);
                  setTimeout(() => setShowRefund(true), 300);
                }}
              />

              <BookingRefundModal
                show={showRefund}
                handleClose={() => setShowRefund(false)}
                onRefundSuccess={() => {
                  setShowRefund(false);
                  setTimeout(() => setShowSuccess(true), 300);
                }}
              />

              <RefundSuccessModal
                show={showSuccess}
                handleClose={() => setShowSuccess(false)}
              />


            </div>
          </TabPanel>

          <TabPanel value={value} index={1} dir={theme.direction}>
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="mb-3 tabel-title">Accepted Cancellation</h6>
              <CustomTable cancellations={cancellations} headers={headers} type="booking" />
            </div>
          </TabPanel>

          <TabPanel value={value} index={2} dir={theme.direction}>
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="mb-3 tabel-title">Rejected Cancellation</h6>
              <CustomTable cancellations={cancellations} headers={headers} type="booking" />
            </div>
          </TabPanel>
        </Col>
      </Row>
    </Container>
  );
};

export default Cancellation;