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

export const ButtonLoading = ({ color = "white", size = 10 }) => {
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
      <PuffLoader color={color} size={70} />
    </div>
  );
};
