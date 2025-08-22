const Pagination = ({
  totalRecords,
  defaultLimit,
  handlePageChange,
  currentPage,
}) => {
  if (!totalRecords && totalRecords !== 0) return null; // Hide pagination if totalRecords is undefined or null

  const totalPages = Math.ceil(totalRecords / defaultLimit);
  if (totalPages <= 1) return null; // Hide pagination if only one page

  const isZeroBased = currentPage === 0 || currentPage < 1; // Detect if pagination starts from 0
  const adjustedCurrentPage = isZeroBased ? currentPage + 1 : currentPage; // Convert to 1-based for logic
  const visiblePages = 5; // Number of visible page buttons
  const pageNumbers = [];

  if (totalPages <= visiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    let startPage = Math.max(
      1,
      adjustedCurrentPage - Math.floor(visiblePages / 2)
    );
    let endPage = Math.min(startPage + visiblePages - 1, totalPages);

    if (endPage - startPage < visiblePages - 1) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    if (startPage > 1) pageNumbers.push(1); // Always include first page
    if (startPage > 2) pageNumbers.push("..."); // Ellipsis for gap

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) pageNumbers.push("..."); // Ellipsis for gap
    if (endPage < totalPages) pageNumbers.push(totalPages); // Always include last page
  }

  return (
    <div className="row  w-100 d-flex algn-items-center">
      <div className="col-md-2 col-12 d-flex align-items-center justify-content-center justify-content-md-start mt-2 text-nowrap">
        <span className="ms-2 border p-1 ms-3 border-0 fw-bold">
          Total Records: {totalRecords}
        </span>
      </div>
      <div className="col-md-10 col-12 d-flex align-items-center justify-content-center justify-content-md-end">
        <div className="d-flex justify-content-end align-items-center">
          <div className="d-flex align-items-center me-3">
            <button
              className="btn mx-1 border-0 fw-bold bg-transparent"
              style={{ color: "#8d9dd3" }}
              onClick={() =>
                handlePageChange(
                  isZeroBased
                    ? adjustedCurrentPage - 2
                    : adjustedCurrentPage - 1
                )
              }
              disabled={adjustedCurrentPage === 1}
            >
              Previous
            </button>

            {pageNumbers.map((number, index) =>
              number === "..." ? (
                <span key={index} className="mx-2">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  className="btn mx-1 py-md-0 py-0 px-md-auto px-2 shadow-none"
                  style={{
                    color: number === adjustedCurrentPage ? "white" : "black",
                    background: number === adjustedCurrentPage ? "#8d9dd3" : "",
                    border:
                      number === adjustedCurrentPage
                        ? "1px solid #6c7eb6ff"
                        : "1px solid #6c7eb6ff",
                  }}
                  onClick={() =>
                    handlePageChange(isZeroBased ? number - 1 : number)
                  }
                >
                  {number}
                </button>
              )
            )}

            <button
              className="btn mx-1 border-0 fw-bold bg-transparent"
              onClick={() =>
                handlePageChange(
                  isZeroBased ? adjustedCurrentPage : adjustedCurrentPage + 1
                )
              }
              style={{ color: "#8d9dd3" }}
              disabled={adjustedCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
