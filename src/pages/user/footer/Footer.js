import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  BsPhoneFill,
  BsEnvelopeFill,
  BsFacebook,
  BsInstagram,
  BsLinkedin,
  BsTwitter,
} from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { getUserClub } from "../../../redux/user/club/thunk";
import { Link } from "react-router-dom";

const Footer = () => {
  const store = useSelector((state) => state);
  const dispatch = useDispatch();
  const clubData = store?.userClub?.clubData?.data?.courts[0] || [];
  console.log("clubData", clubData);

  const ownerId = store?.userClub?.clubData?.data?.courts?.[0]?.ownerId;
  console.log("OWNER DATA", ownerId);

  useEffect(() => {
    dispatch(getUserClub({ limit: "" }));
    window.scrollTo(0, 0);
  }, []);
  return (
    <footer
      className="bg-light py-md-5 py-4"
      style={{ borderTop: "1px solid #dee2e6" }}
    >
      <Container>
        <Row className="justify-content-between align-items-center">
          {/* Left Section: Ready to Transform */}
          <Col md={6} className="mb-3 mb-md-0">
            {/* Phone */}
            <div className="d-flex align-items-center gap-2  mb-0 m-0">
              <h4
                className="mb-0 m-0 address_data col-2"
                style={{
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                }}
              >
                {" "}
                Contact :
              </h4>
              <p
                className="mt-1 mb-0 m-0 address_data"
                style={{ fontFamily: "Poppins", fontSize: "14px" }}
              >
                {ownerId?.countryCode}{" "}
                {ownerId?.phoneNumber || "+91 9999999999"}
              </p>
            </div>
            {/* Email */}
            <div className="d-flex align-items-center gap-2 m-0 mb-0">
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                }}
                className="address_data col-2"
              >
                {" "}
                Email :
              </h4>
              <p
                className="mt-2 address_data"
                style={{ fontFamily: "Poppins", fontSize: "14px" }}
              >
                {ownerId?.email || "hello@rowthtech.com"}
              </p>
            </div>

            <div className="d-flex align-items-start gap-2  mb-0 m-0">
              {/* <strong>India</strong><br /> */}
              <h4
                className="mb-0 m-0 address_data col-2"
                style={{
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                }}
              >
                {" "}
                Address :
              </h4>

              <p
                className="address_data"
                style={{ fontFamily: "Poppins", fontSize: "14px" }}
              >
                {[
                  clubData?.address,
                  clubData?.city,
                  clubData?.state,
                  clubData?.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </Col>

          {/* Right Section: Social + Links */}
          <Col md={4} className="text-lg-end text-start">
            <div className="d-flex justify-content-md-end justify-content-center gap-3 mb-3">
              {/* Social Icons */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <BsFacebook size={24} className="text-primary" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <BsInstagram size={24} className="text-primary" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <BsLinkedin size={24} className="text-primary" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <FaXTwitter size={24} className="text-primary" />
              </a>
            </div>
            <div className="d-flex  flex-sm-row justify-content-md-end justify-content-center gap-3 small text-muted">
              {/* Bottom Links */}
              <Link
                to="/privacy-policy"
                className="text-decoration-none address_data"
              >
                Privacy Policy
              </Link>
              <Link
                to="/manage-cookies"
                className="text-decoration-none address_data"
              >
                Manage Cookies
              </Link>
              <Link to="#" className="text-decoration-none address_data">
                Sitemap
              </Link>
              {/* <a href="/sitemap" className="text-decoration-none address_data">Blog</a> */}
            </div>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="mt-md-3 mt-0 pt-3 text-center text-muted small address_data">
          <Col>&copy; 2025 RowthTech | All Rights Reserved.</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
