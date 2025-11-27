import React, { useEffect } from "react";

const PrivacyPolicy = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', marginTop: '40px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="bg-white rounded-4 shadow-sm p-5">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-success mb-3">Privacy Policy</h1>
              <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="mb-4">
                  <h3 className="text-success mb-3">1. Introduction</h3>
                  <p className="lead">
                    At Courtline, we are committed to protecting your privacy and ensuring the security of your personal information.
                    This Privacy Policy explains how we collect, use, and safeguard your data when you use our court booking platform.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">2. Information We Collect</h3>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="bg-light p-4 rounded-3 h-100">
                        <h5 className="fw-bold mb-3 text-success">Personal Information</h5>
                        <ul className="list-unstyled">
                          <li className="mb-2"><i className="fas fa-user text-success me-2"></i>Full name and contact details</li>
                          <li className="mb-2"><i className="fas fa-envelope text-success me-2"></i>Email address</li>
                          <li className="mb-2"><i className="fas fa-phone text-success me-2"></i>Phone number</li>
                          <li className="mb-2"><i className="fas fa-calendar text-success me-2"></i>Date of birth (for age verification)</li>
                          <li className="mb-2"><i className="fas fa-credit-card text-success me-2"></i>Payment information (securely processed)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="bg-light p-4 rounded-3 h-100">
                        <h5 className="fw-bold mb-3 text-success">Usage Data</h5>
                        <ul className="list-unstyled">
                          <li className="mb-2"><i className="fas fa-globe text-success me-2"></i>IP address and location data</li>
                          <li className="mb-2"><i className="fas fa-desktop text-success me-2"></i>Device and browser information</li>
                          <li className="mb-2"><i className="fas fa-clock text-success me-2"></i>Booking history and preferences</li>
                          <li className="mb-2"><i className="fas fa-chart-line text-success me-2"></i>Platform usage analytics</li>
                          <li className="mb-2"><i className="fas fa-cookie-bite text-success me-2"></i>Cookies and tracking data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">3. How We Use Your Information</h3>
                  <div className="alert alert-info">
                    <h5 className="fw-bold mb-3">We use your data to:</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <ul>
                          <li>Process and manage your court bookings</li>
                          <li>Handle secure payment transactions</li>
                          <li>Send booking confirmations and reminders</li>
                          <li>Provide customer support and assistance</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul>
                          <li>Improve our platform and user experience</li>
                          <li>Send promotional offers (with your consent)</li>
                          <li>Comply with legal and regulatory requirements</li>
                          <li>Prevent fraud and ensure platform security</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">4. Cookies & Tracking</h3>
                  <div className="bg-warning bg-opacity-10 p-4 rounded-3 border-start border-warning border-4">
                    <p className="mb-3">
                      We use cookies and similar technologies to enhance your experience on our platform.
                      These help us remember your preferences, analyze site traffic, and provide personalized content.
                    </p>
                    <p className="mb-2"><strong>Cookie Types:</strong></p>
                    <ul className="mb-3">
                      <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                      <li><strong>Analytics Cookies:</strong> Help us understand user behavior and improve services</li>
                      <li><strong>Marketing Cookies:</strong> Used for targeted advertising (optional)</li>
                    </ul>
                    <p className="mb-0">
                      <em>You can manage cookie preferences in your browser settings, though some features may be limited if disabled.</em>
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">5. Data Sharing & Third Parties</h3>
                  <div className="alert alert-success">
                    <p className="fw-bold mb-2">We DO NOT sell your personal information to third parties.</p>
                    <p className="mb-3">We only share data with trusted partners when necessary:</p>
                    <ul className="mb-0">
                      <li><strong>Payment Processors:</strong> Secure handling of transactions (Stripe, PayPal)</li>
                      <li><strong>Cloud Services:</strong> Reliable data storage and platform hosting (AWS, Google Cloud)</li>
                      <li><strong>Analytics Providers:</strong> Platform improvement insights (Google Analytics)</li>
                      <li><strong>Legal Authorities:</strong> When required by law or to protect user safety</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">6. Data Security</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="fw-bold mb-3">Technical Safeguards:</h5>
                      <ul>
                        <li>SSL/TLS encryption for data transmission</li>
                        <li>Secure database storage with encryption</li>
                        <li>Regular security audits and updates</li>
                        <li>Multi-factor authentication for staff access</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h5 className="fw-bold mb-3">Organizational Measures:</h5>
                      <ul>
                        <li>Limited access to personal data on need-to-know basis</li>
                        <li>Staff training on data protection practices</li>
                        <li>Incident response procedures for data breaches</li>
                        <li>Regular backup and disaster recovery protocols</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">7. Your Privacy Rights</h3>
                  <div className="bg-light p-4 rounded-3">
                    <p className="fw-bold mb-3">You have the right to:</p>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="list-unstyled">
                          <li className="mb-2"><i className="fas fa-eye text-success me-2"></i><strong>Access:</strong> Request copies of your personal data</li>
                          <li className="mb-2"><i className="fas fa-edit text-success me-2"></i><strong>Rectification:</strong> Correct inaccurate information</li>
                          <li className="mb-2"><i className="fas fa-trash text-success me-2"></i><strong>Erasure:</strong> Request deletion of your data</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled">
                          <li className="mb-2"><i className="fas fa-ban text-success me-2"></i><strong>Restriction:</strong> Limit how we process your data</li>
                          <li className="mb-2"><i className="fas fa-download text-success me-2"></i><strong>Portability:</strong> Receive your data in a portable format</li>
                          <li className="mb-2"><i className="fas fa-times-circle text-success me-2"></i><strong>Objection:</strong> Opt-out of marketing communications</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-muted mb-0 mt-3">
                      <em>To exercise these rights, contact us at hello@swootapp.com with your request and identity verification.</em>
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">8. Data Retention</h3>
                  <p>
                    We retain your personal data only as long as necessary to provide our services and comply with legal obligations.
                    Typically, this includes:
                  </p>
                  <ul>
                    <li><strong>Account Data:</strong> Until account deletion or 3 years of inactivity</li>
                    <li><strong>Booking History:</strong> 7 years for financial and legal compliance</li>
                    <li><strong>Marketing Data:</strong> Until you unsubscribe or withdraw consent</li>
                    <li><strong>Analytics Data:</strong> Anonymized after 26 months</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">9. Children's Privacy</h3>
                  <div className="alert alert-warning">
                    <p className="mb-2">
                      <strong>Age Requirement:</strong> Our services are intended for users aged 16 and above.
                    </p>
                    <p className="mb-0">
                      We do not knowingly collect personal information from children under 16.
                      If you believe we have inadvertently collected such information, please contact us immediately for removal.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-success mb-3">10. Policy Updates</h3>
                  <p>
                    This Privacy Policy may be updated periodically to reflect changes in our practices or legal requirements.
                    We will notify users of significant changes via email or prominent platform notices.
                    The "Last Updated" date at the top indicates the most recent revision.
                  </p>
                </div>

                <div className="bg-success bg-opacity-10 p-4 rounded-3">
                  <h3 className="text-success mb-3">11. Contact Us</h3>
                  <p className="mb-3">Questions about this Privacy Policy or your data? We're here to help!</p>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <i className="fas fa-envelope text-success me-2"></i>
                        <strong>Email:</strong>{" "}
                        <a href="mailto:hello@swootapp.com">hello@swootapp.com</a>
                      </p>
                      <p className="mb-1">
                        <i className="fas fa-building text-success me-2"></i>
                        <strong>Company:</strong>{" "}
                        <a href="https://rowthtech.com/" target="_blank" rel="noopener noreferrer">
                          Rowthtech Enterprises LLP.
                        </a>
                      </p>
                    </div>
                    {/* <div className="col-md-6">
                                            <p className="mb-1"><i className="fas fa-phone text-success me-2"></i><strong>Phone:</strong> +1 (555) 123-PADEL</p>
                                            <p className="mb-1"><i className="fas fa-map-marker-alt text-success me-2"></i><strong>Address:</strong> 123 Padel Street, Sports City, SC 12345</p>
                                        </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
