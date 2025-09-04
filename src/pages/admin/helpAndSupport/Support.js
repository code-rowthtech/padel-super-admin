import { useNavigate } from "react-router-dom";

const Support = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "80vh",
        fontFamily: "Poppins, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        margin: 0,
        color: "#1e293b",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "500px",
          padding: "40px",
          borderRadius: "16px",
          backgroundColor: "white",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Logo or Icon Placeholder */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#1e40af",
            marginBottom: "16px",
            letterSpacing: "1px",
          }}
        >
          Help & Support
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "18px",
            color: "#64748b",
            marginBottom: "30px",
            fontWeight: "500",
          }}
        >
          Something amazing is brewing...
        </p>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "16px",
          }}
        >
          Coming Soon
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "16px",
            color: "#475569",
            lineHeight: "1.6",
            marginBottom: "10px",
          }}
        >
          We're crafting something special. Stay tuned for a fresh new
          experience.
        </p>

        <button
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "500",
            color: "white",
            backgroundColor: "#22c55e",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1f9e4d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#22c55e";
          }}
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
        {/* Footer Text */}
        <p
          style={{
            marginTop: "20px",
            fontSize: "14px",
            color: "#94a3b8",
          }}
        >
          We'll let you know when we launch.
        </p>
      </div>
    </div>
  );
};

export default Support;
