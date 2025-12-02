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
      <div className="loader"></div>
      <style jsx>{`
        .loader {
          width: 48px;
          height: 48px;
          margin: auto;
          position: relative;
        }

        .loader:before {
          content: '';
          width: 48px;
          height: 5px;
          background: #253050;
          position: absolute;
          top: 60px;
          left: 0;
          border-radius: 50%;
          animation: shadow324 0.5s linear infinite;
        }

        .loader:after {
          content: '';
          width: 100%;
          height: 100%;
          background: linear-gradient(rgb(0, 52, 228) 0%, rgb(0, 27, 118) 100%);
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 40px;
          animation: jump7456 0.5s linear infinite;
        }

        @keyframes jump7456 {
          15% {
            border-bottom-right-radius: 15px;
          }

          25% {
            transform: translateY(15px) rotate(22.5deg);
          }

          50% {
            transform: translateY(17px) scale(1, .9) rotate(45deg);
            border-bottom-right-radius: 40px;
          }

          75% {
            transform: translateY(4px) rotate(50.5deg);
          }

          100% {
            transform: translateY(0) rotate(90deg);
          }
        }

        @keyframes shadow324 {
          0%,
          100% {
            transform: scale(1, 1);
          }

          50% {
            transform: scale(1.2, 1);
          }
        }
      `}</style>
    </div>
  );
};

export const SmallSpinner = () => (
  <svg
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
