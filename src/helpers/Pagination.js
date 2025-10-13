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
    <div className="row w-100 d-flex align-items-center">
      <div className="col-md-2 col-12 d-flex align-items-center justify-content-center justify-content-md-start mt-2 text-nowrap">
        <span className="ms-2 border p-1 ms-3 border-0 fw-bold" style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
          Total Records: {totalRecords}
        </span>
      </div>
      <div className="col-md-10 col-12">
        <div className="d-flex align-items-center w-100" style={{ minWidth: '300px' }}>
          <div style={{ width: '80px', textAlign: 'left' }}>
            <button
              className="btn border-0 fw-bold bg-transparent"
              style={{ 
                color: "#8d9dd3",
                fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                padding: window.innerWidth <= 768 ? '4px 8px' : '6px 12px'
              }}
              onClick={() =>
                handlePageChange(
                  isZeroBased
                    ? adjustedCurrentPage - 2
                    : adjustedCurrentPage - 1
                )
              }
              disabled={adjustedCurrentPage === 1}
            >
              {window.innerWidth <= 768 ? 'Prev' : 'Previous'}
            </button>
          </div>

          <div className="d-flex align-items-center justify-content-center" style={{ flex: '1' }}>
            {pageNumbers.map((number, index) =>
              number === "..." ? (
                <span key={index} className="mx-1" style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  className="btn mx-1 shadow-none rounded-circle"
                  style={{
                    color: number === adjustedCurrentPage ? "white" : "black",
                    background: number === adjustedCurrentPage ? "#8d9dd3" : "",
                    border:
                      number === adjustedCurrentPage
                        ? "1px solid #6c7eb6ff"
                        : "1px solid #6c7eb6ff",
                    fontSize: window.innerWidth <= 768 ? '8px' : '10px',
                    width: window.innerWidth <= 768 ? '24px' : '28px',
                    height: window.innerWidth <= 768 ? '24px' : '28px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() =>
                    handlePageChange(isZeroBased ? number - 1 : number)
                  }
                >
                  {number}
                </button>
              )
            )}
          </div>

          <div style={{ width: '80px', textAlign: 'right' }}>
            <button
              className="btn border-0 fw-bold bg-transparent"
              onClick={() =>
                handlePageChange(
                  isZeroBased ? adjustedCurrentPage : adjustedCurrentPage + 1
                )
              }
              style={{ 
                color: "#8d9dd3",
                fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                padding: window.innerWidth <= 768 ? '4px 8px' : '6px 12px'
              }}
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
