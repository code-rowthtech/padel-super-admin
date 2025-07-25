import { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { getUserFromSession } from "../../../helpers/api/apiCore";

const AdminTopbar = () => {
  const user = getUserFromSession();
  const [searchValue, setSearchValue] = useState("");

  const handleClearSearch = () => setSearchValue("");

  return (
    <header className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom shadow-sm">
      {/* Search Section */}
      <div className="d-flex align-items-center bg-light px-2 py-1 rounded" style={{ width: "300px" }}>
        <FaSearch className="text-muted me-2" />
        <input
          type="text"
          value={searchValue}
          placeholder="Search..."
          className="form-control border-0 bg-transparent shadow-none"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <FaTimes
            className="text-muted ms-2 cursor-pointer"
            onClick={handleClearSearch}
            style={{ cursor: "pointer" }}
          />
        )}
      </div>

      {/* User Dropdown */}
      <Dropdown align="end">
        <Dropdown.Toggle variant="link" className="d-flex align-items-center gap-2 text-dark text-decoration-none p-0 border-0 shadow-none">
          <span className="fw-semibold">{user?.name}</span>
          <img
            src="https://i.pravatar.cc/40"
            alt="user"
            className="rounded-circle"
            width="40"
            height="40"
          />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="/admin/settings">Settings</Dropdown.Item>
          <Dropdown.Item onClick={() => console.log("Logout clicked")}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
};

export default AdminTopbar;
