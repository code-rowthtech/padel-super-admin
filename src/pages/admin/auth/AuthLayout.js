import { Container, Row, Col } from 'react-bootstrap';
import { authImg } from '../../../assets/files';

const Layout = ({ children }) => {

  return (
    <Container fluid style={{ height: '100vh', padding: 0 }} >
      <Row className="h-100 mx-auto">
        {/* Left Section */}
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

        {/* Right Section */}
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
};

export default Layout;
