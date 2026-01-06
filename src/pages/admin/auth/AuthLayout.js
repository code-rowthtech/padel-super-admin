import { Container, Row, Col } from 'react-bootstrap';
import { authImg } from '../../../assets/files';

const Layout = ({ children }) => {

  return (
    <Container fluid style={{ height: '100vh', padding: 0 }} >
      <Row className="h-100 mx-auto">
        <Col
          md={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'clamp(20px, 5vw, 0px)'
          }}
        >
          {children}
        </Col>

        <Col
          md={6}
          className="d-none d-md-block"
          style={{
            backgroundImage: `url(${authImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'revert-layer',
          }}
        />
      </Row>
    </Container>
  );

  const mobileStyles = `
    @media (max-width: 767px) {
      .container-fluid .row .col {
        padding: 20px !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <Container fluid style={{ height: '100vh', padding: 0 }} >
        <Row className="h-100 mx-auto">
          <Col
            md={6}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {children}
          </Col>

          <Col
            md={6}
            className="d-none d-md-block"
            style={{
              backgroundImage: `url(${authImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'revert-layer',
            }}
          />
        </Row>
      </Container>
    </>
  );
};

export default Layout;
