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
  const clubIds = store?.userClub?.clubData?.data;
  const ownerId = store?.userClub?.clubData?.data?.courts?.[0]?.ownerId;

  const club = Array.isArray(clubIds?.courts)
    ? clubIds.courts[0]
    : clubIds;

  const social = {
    facebook: club?.facebookLink || "https://facebook.com",
    instagram: club?.instagramLink || "https://instagram.com",
    linkedin: club?.linkedinLink || "https://linkedin.com",
    twitter: club?.xlink || "https://twitter.com",
  };

  console.log("Club data:", club);
  console.log("Social links:", social);


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
          <Col md={6} className="mb-3 mb-md-0">
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

          <Col md={4} className="text-lg-end text-start">
            <div className="d-flex justify-content-md-end justify-content-center gap-3 mb-3">

              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <BsFacebook size={24} className="text-primary" />
                </a>
              )}

              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <BsInstagram size={24} className="text-primary" />
                </a>
              )}

              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <BsLinkedin size={24} className="text-primary" />
                </a>
              )}

              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <FaXTwitter size={24} className="text-primary" />
                </a>
              )}

            </div>

            <div className="d-flex flex-sm-row justify-content-md-end justify-content-center gap-3 small text-muted">
              <Link to="/privacy-policy" className="text-decoration-none address_data">
                Privacy Policy
              </Link>

              <Link to="/manage-cookies" className="text-decoration-none address_data">
                Manage Cookies
              </Link>

            </div>
          </Col>

        </Row>

        <Row className="mt-md-3 mb-lg-0 mb-5 mt-0 pt-3 text-center text-muted small address_data">
          <Col>&copy; 2025 RowthTech | All Rights Reserved.</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
