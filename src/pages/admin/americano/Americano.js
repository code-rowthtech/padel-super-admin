const Americano = () => {
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
        <div
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#1e40af",
            marginBottom: "16px",
            letterSpacing: "1px",
          }}
        >
          Americano
        </div>

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

        <p
          style={{
            fontSize: "16px",
            color: "#475569",
            lineHeight: "1.6",
            marginBottom: "30px",
          }}
        >
          We're crafting something special. Stay tuned for a fresh new
          experience.
        </p>

        <div
          style={{
            width: "60px",
            height: "4px",
            backgroundColor: "#22c55e",
            margin: "0 auto 30px",
            borderRadius: "2px",
          }}
        ></div>

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

export default Americano;
