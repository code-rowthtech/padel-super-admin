import { useState, useRef } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import Pricing from "./tabs/Pricing";
import ClubUpdateForm from "./tabs/ClubUpdateForm";

const MyClub = () => {
  const [activeTab, setActiveTab] = useState(0);
  const clubRef = useRef(null);
  const pricingRef = useRef(null);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    const refs = [clubRef, pricingRef];
    refs[newValue]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Container fluid className="px-4">
      <Row className="mb-3">
        <Col xs={3}>
          <Box sx={{ bgcolor: "white" }}>
            <AppBar
              position="static"
              color="default"
              className="bg-white border-bottom border-light px-0"
              elevation={0}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{
                  minHeight: "48px",
                  "& .MuiTab-root": {
                    minHeight: "48px",
                    padding: "12px 16px",
                  },
                }}
              >
                <Tab
                  label="Club Details"
                  className="fw-medium"
                  style={{
                    textTransform: "none",
                    fontSize: "15px",
                    color: activeTab === 0 ? "#2563EB" : "#1F2937",
                    fontWeight: activeTab === 0 ? 600 : 500,
                  }}
                />
                <Tab
                  label="Pricing"
                  className="fw-medium"
                  style={{
                    textTransform: "none",
                    fontSize: "15px",
                    color: activeTab === 1 ? "#2563EB" : "#1F2937",
                    fontWeight: activeTab === 1 ? 600 : 500,
                  }}
                />
              </Tabs>
            </AppBar>
          </Box>
        </Col>
      </Row>

      <div className="mt-3">
        {activeTab === 0 ? (
          <div
            ref={clubRef}
            className={`border rounded p-4 bg-white ${
              activeTab === 0 ? "border-primary border-2" : "border-light"
            }`}
          >
            <ClubUpdateForm />
          </div>
        ) : (
          <div
            ref={pricingRef}
            className={`border rounded p-4 bg-white ${
              activeTab === 1 ? "border-primary border-2" : "border-light"
            }`}
          >
            <Pricing />
          </div>
        )}
      </div>
    </Container>
  );
};

export default MyClub;
