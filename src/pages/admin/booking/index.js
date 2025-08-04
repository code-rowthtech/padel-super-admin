import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import CustomTable from "../componets/CustomTable";

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";

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
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const navigate = useNavigate()
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
                  <Tab className="fw-medium table-data" label="Upcoming" {...a11yProps(0)} />
                  <Tab label="Completed" {...a11yProps(1)} />
                </Tabs>
              </AppBar>
            </Box>

            <button
              className="d-flex align-items-center position-relative p-0 border-0"
              style={{
                borderRadius: '20px 10px 10px 20px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'none'
              }}
              onClick={() => navigate('/admin/manualbooking')}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Circle Icon */}
              <div
                className="p-1 rounded-circle bg-light"
                style={{ position: 'relative', left: '10px' }}
              >
                <div
                  className="d-flex justify-content-center align-items-center text-white fw-bold"
                  style={{
                    backgroundColor: '#194DD5',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    fontSize: '20px',
                  }}
                >
                  +
                </div>
              </div>

              {/* Text Section */}
              <div
                className="d-flex align-items-center text-white fw-medium"
                style={{
                  backgroundColor: '#194DD5',
                  padding: '0 16px',
                  height: '36px',
                  fontSize: '14px',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
               Manual Booking
              </div>
            </button>

          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <TabPanel value={value} index={0} dir={theme.direction}>
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="mb-3 tabel-title">Upcoming Bookings</h6>
              <CustomTable cancellations={cancellations} headers={headers} type="booking" />
            </div>
          </TabPanel>

          <TabPanel value={value} index={1} dir={theme.direction}>
            <div className="bg-white rounded shadow-sm p-3">
              <h6 className="mb-3 tabel-title">Complete Bookings</h6>
              <CustomTable cancellations={cancellations} headers={headers} type="booking" />
            </div>
          </TabPanel>
        </Col>
      </Row>
    </Container>
  );
};

export default Cancellation;
