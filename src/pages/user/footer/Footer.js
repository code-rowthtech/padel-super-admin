import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  BsPhoneFill,
  BsEnvelopeFill,
  BsFacebook,
  BsInstagram,
  BsLinkedin,
  BsTwitter
} from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-light py-5" style={{ borderTop: '1px solid #dee2e6' }}>
      <Container>
        <Row className="justify-content-between align-items-center">
          {/* Left Section: Ready to Transform */}
          <Col md={6} className="mb-3 mb-md-0">
            {/* Phone */}
            <div className="d-flex align-items-center gap-2  mb-0 m-0">
              <h4 className='mb-0 m-0' style={{ fontSize: "15px", fontWeight: "500", fontFamily: "Poppins" }}> Contact :</h4>
              <p className='mt-1 mb-0 m-0' style={{ fontFamily: "Poppins", fontSize: "14px" }}>+91 9999999999</p>
            </div>
            {/* Email */}
            <div className="d-flex align-items-center gap-2 m-0 mb-0">
              <h4 style={{ fontSize: "15px", fontWeight: "500", fontFamily: "Poppins" }}>  Email :</h4>
              <p className='mt-2' style={{ fontFamily: "Poppins", fontSize: "14px" }}>hello@rowthtech.com</p>
            </div>

            <div className="text-muted small">
              <strong>India</strong><br />
              Plot No.24, Industrial Area Phase 1<br />
              Chandigarh, 160002
            </div>
          </Col>

          {/* Right Section: Social + Links */}
          <Col md={4} className="text-lg-end text-start">
            <div className="d-flex justify-content-end gap-3 mb-3">
              {/* Social Icons */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <BsFacebook size={24} className="text-primary" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <BsInstagram size={24} className="text-primary" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <BsLinkedin size={24} className="text-primary" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <BsTwitter size={24} className="text-primary" />
              </a>
            </div>
            <div className="d-flex  flex-sm-row justify-content-end gap-3 small text-muted">
              {/* Bottom Links */}
              <a href="/privacy-policy" className="text-decoration-none">Privacy Policy</a>
              <a href="/manage-cookies" className="text-decoration-none">Manage Cookies</a>
              <a href="/sitemap" className="text-decoration-none">Sitemap</a>
              <a href="/blog" className="text-decoration-none">Blog</a>
            </div>
          </Col>
        </Row>



        {/* Copyright */}
        <Row className="mt-3 pt-3 text-center text-muted small">
          <Col>
            &copy; 2025 RowthTech | All Rights Reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;