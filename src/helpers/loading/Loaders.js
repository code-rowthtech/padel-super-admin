import { Spinner } from "react-bootstrap";
import { RingLoader, PulseLoader, PuffLoader } from "react-spinners";

export const Loading = ({ color }) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <RingLoader color={color} size={80} />
    </div>
  );
};

export const ButtonLoading = ({ color, size = 10 }) => {
  return (
    <div className="d-flex justify-content-center align-items-center w-100 py-1">
      <PulseLoader color={color} size={size} />
    </div>
  );
};

export const DataLoading = ({ color, height }) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center w-100"
      style={{ height: height }}
    >
      <Spinner color={color} size={70} animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export const SmallSpinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"   // h-4 w-4 = 16px
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v2l3-3-3-3v2a10 10 0 100 20v-2l3 3-3 3v-2a8 8 0 01-8-8z"
    ></path>
  </svg>
);
