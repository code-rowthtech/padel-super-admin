import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Accordion,
  Form,
  Button,
  InputGroup,
  ListGroup,
  Badge,
  Modal,
} from 'react-bootstrap';

/*
  Padel Help & Support Page (single-file React component)

  Usage:
  1. Ensure Bootstrap CSS is loaded in your app (e.g. in index.js):
     import 'bootstrap/dist/css/bootstrap.min.css';

  2. Place this component on any route or page.

  Features included:
  - Search bar for knowledgebase articles
  - Sidebar quick links (FAQs, Contact, Booking Issues, Payments)
  - Featured help articles list
  - FAQ accordion
  - Contact / Support request form with simple validation
  - Live chat modal placeholder
  - Responsive layout using react-bootstrap
*/

const sampleArticles = [
  {
    id: 1,
    title: 'How to book a court',
    excerpt: 'Quick step-by-step to book a padel court using our app or website.',
    tag: 'Booking',
  },
  {
    id: 2,
    title: 'Cancel or request a refund',
    excerpt: 'What happens when you cancel and how refunds are processed.',
    tag: 'Payments',
  },
  {
    id: 3,
    title: 'Using Google Pay & Apple Pay',
    excerpt: 'How to enable and use Google Pay and Apple Pay in payments.',
    tag: 'Payments',
  },
  {
    id: 4,
    title: 'Court rules & etiquette',
    excerpt: 'A short guide on court rules and safety for players.',
    tag: 'Rules',
  },
];

const faqs = [
  {
    q: 'How can I change my booking time?',
    a:
      'Open the booking in your profile -> Manage Booking -> Modify. If the slot is not available, contact support to request a manual change.',
  },
  {
    q: 'I paid but my booking is not confirmed',
    a:
      'Sometimes payment gateways take time to confirm. Check your payments page and email. If still unconfirmed, share the receipt with support.',
  },
  {
    q: 'How long does a refund take?',
    a:
      'Refunds usually process within 5-10 business days depending on your bank or payment method.',
  },
  {
    q: 'Can I transfer my booking to another user?',
    a:
      'Yes — you can transfer if the court owner allows transfers. Visit Manage Booking → Transfer.',
  },
];

export default function PadelSupportPage() {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showChat, setShowChat] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [activeSection, setActiveSection] = useState('submit'); // 'articles', 'faq', 'submit'

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedTag]);

  function validateForm() {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Please describe your issue';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSent(false);
    setTimeout(() => {
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 700);
  }

  return (
    <>
      <style>
        {`
          .accordion-button:focus {
            box-shadow: none !important;
          }
          .accordion-button:not(.collapsed) {
            box-shadow: none !important;
          }
          .accordion-item {
            box-shadow: none !important;
          }
        `}
      </style>
      <Container fluid className="py-4" style={{ background: '#F6F8FB', minHeight: '100vh' }}>
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={10} lg={9}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8} xs={12}>
                  <h2 className="mb-1">Padel Help & Support</h2>
                  <p className="text-muted mb-2">Find answers, contact support, or start a live conversation.</p>

                  <Form onSubmit={(e) => e.preventDefault()}>
                    <InputGroup>
                      <Form.Control
                        placeholder="Search help articles, FAQs, or keywords..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search help"
                        style={{ boxShadow: 'none' }}
                      />
                      <Button variant="primary" onClick={() => { }}>
                        Search
                      </Button>
                      <Button variant="outline-secondary" onClick={() => setShowChat(true)} className="ms-2">
                        Live chat
                      </Button>
                    </InputGroup>
                  </Form>
                </Col>

                <Col md={4} xs={12} className="text-md-end mt-3 mt-md-0">
                  <Button variant="success" className="me-2" onClick={() => setActiveSection('submit')}>
                    Submit a request
                  </Button>
                  <Button variant="outline-primary" onClick={() => alert('Call us at +91 98765 43210')}>
                    Call support
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={9}>
          <Row className="d-flex align-items-stretch">
            <Col lg={4} className="mb-4 d-flex">
              <Card className="mb-3 shadow-sm w-100">
                <Card.Body className="h-100">
                  <h5>Quick links</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item 
                      action 
                      onClick={() => setActiveSection('submit')}
                      style={{ backgroundColor: activeSection === 'submit' ? '#f8f9fa' : 'transparent' }}
                    >
                      Submit a request
                    </ListGroup.Item>
                    <ListGroup.Item 
                      action 
                      onClick={() => setActiveSection('faq')}
                      style={{ backgroundColor: activeSection === 'faq' ? '#f8f9fa' : 'transparent' }}
                    >
                      FAQs
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8} className="mb-4 d-flex">
              {activeSection === 'faq' && (
                <Card className="shadow-sm w-100">
                  <Card.Body className="h-100">
                    <h5>Frequently asked questions</h5>
                    <Accordion>
                      {faqs.map((f, i) => (
                        <Accordion.Item eventKey={String(i)} key={i}>
                          <Accordion.Header>{f.q}</Accordion.Header>
                          <Accordion.Body>{f.a}</Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Card.Body>
                </Card>
              )}

              {activeSection === 'submit' && (
                <Card className="shadow-sm w-100">
                  <Card.Body className="h-100">
                    <h5 id="contact-form">Submit a request</h5>
                    <p className="text-muted">Fill this form and our support team will contact you within 24 hours.</p>

                    {sent && <div className="alert alert-success">Your request has been submitted. We'll reply to your email soon.</div>}

                    <Form onSubmit={handleSubmit} noValidate>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              value={form.name}
                              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                              isInvalid={!!errors.name}
                              style={{ boxShadow: 'none' }}
                            />
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              value={form.email}
                              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                              isInvalid={!!errors.email}
                              style={{ boxShadow: 'none' }}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Subject</Form.Label>
                        <Form.Control
                          value={form.subject}
                          onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
                          isInvalid={!!errors.subject}
                          style={{ boxShadow: 'none' }}
                        />
                        <Form.Control.Feedback type="invalid">{errors.subject}</Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                          isInvalid={!!errors.message}
                          style={{ boxShadow: 'none' }}
                        />
                        <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button type="submit">Send request</Button>
                        <Button variant="outline-secondary" onClick={() => setForm({ name: '', email: '', subject: '', message: '' })}>
                          Reset
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <h5>Contact options</h5>
                  <p className="mb-1"><strong>Email:</strong> support@padelapp.example</p>
                  <p className="mb-1"><strong>Phone:</strong> +91 98765 43210</p>
                  <p className="mb-3 text-muted">Available Mon–Sat, 9:00–18:00</p>

                  <Row>
                    <Col md={6}>
                      <h6 className="mt-3">Other resources</h6>
                      <ListGroup>
                        <ListGroup.Item action onClick={() => alert('Open community forum')}>Community forum</ListGroup.Item>
                        <ListGroup.Item action onClick={() => alert('Open status page')}>System status</ListGroup.Item>
                        <ListGroup.Item action onClick={() => alert('Open pricing & plans')}>Pricing & plans</ListGroup.Item>
                      </ListGroup>
                    </Col>
                    <Col md={6}>
                      <h6 className="mt-3">Recent announcements</h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>New: </strong>Flexible booking window launched — book up to 6 months ahead.
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Reminder:</strong> Tournament registrations close 2 days before the event.
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <footer className="mt-4 text-center text-muted">
            © {new Date().getFullYear()} Padel — Help Center
          </footer>
        </Col>
      </Row>

      <Modal show={showChat} onHide={() => setShowChat(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Live chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This is a placeholder for a live chat widget. Integrate your chat provider (Intercom, Crisp, Zendesk, etc.) here.</p>
          <div className="small text-muted">Tip: load chat scripts lazily to improve page load performance.</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChat(false)}>Close</Button>
          <Button variant="primary" onClick={() => alert('Connect to agent')}>Connect to agent</Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
}
