import { useEffect, useState } from "react";
import { getUserFromSession } from "./helpers/api/apiCore";
import { Alert, Toast, ToastContainer, Button, Collapse } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const AppWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const user = getUserFromSession();
  const store = useSelector((state) => state?.userAuth);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (
      store?.user?.status === "200" &&
      (!user?.name || !user?.email) &&
      location.pathname !== "/login" &&
      location.pathname !== "/verify-otp"
    ) {
      setOpen(true);
    } else {
      setOpen(false); 
    }
  }, [store?.user?.status, user, location.pathname]);

  const handleGoToProfile = () => {
    setOpen(false); 
    navigate("/user-profile");
  };

  const handleClose = () => {
    setOpen(false); 
  };

  return (
    <>
      {children}
      {/* <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 999 }}>
        <Toast show={open} onClose={handleClose} className="d-inline-block w-100">
          <Collapse in={open}>
            <div>
              <Alert variant="danger" dismissible={false}>
                <Alert.Heading style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>
                  Please update profile (name, email is missing)
                </Alert.Heading>
                <Button
                  variant="success"
                  onClick={handleGoToProfile}
                >
                  Go to Profile
                </Button>
                <Button
                  variant="danger"
                  className="ms-2"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Alert>
            </div>
          </Collapse>
        </Toast>
      </ToastContainer> */}
    </>
  );
};

export default AppWrapper;