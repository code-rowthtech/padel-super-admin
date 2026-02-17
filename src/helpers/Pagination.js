const Pagination = ({
  totalRecords,
  defaultLimit,
  handlePageChange,
  currentPage,
}) => {
  if (!totalRecords && totalRecords !== 0) return null; 

  const totalPages = Math.ceil(totalRecords / defaultLimit);
  if (totalPages <= 1) return null; 

  const isZeroBased = currentPage === 0 || currentPage < 1; 
  const adjustedCurrentPage = isZeroBased ? currentPage + 1 : currentPage; 
  const visiblePages = 5; 
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

    if (startPage > 1) pageNumbers.push(1); 
    if (startPage > 2) pageNumbers.push("..."); 

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) pageNumbers.push("..."); 
    if (endPage < totalPages) pageNumbers.push(totalPages); 
  }

  return (
    <div className="row w-100 d-flex align-items-center">
      <div className="col-md-2 col-12 d-flex align-items-center justify-content-center justify-content-md-start mt-2 text-nowrap">
        <span className="ms-2 border p-1 ms-3 border-0 fw-bold" style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
          Total Records: {totalRecords}
        </span>
      </div>
      <div className="col-md-10 col-12">
        <div className="d-flex align-items-center justify-content-end gap-2" style={{ minWidth: '300px' }}>
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

          <div className="d-flex align-items-center gap-1">
            {pageNumbers.map((number, index) =>
              number === "..." ? (
                <span key={`ellipsis-${index}`} style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                  ...
                </span>
              ) : (
                <button
                  key={`page-${number}`}
                  className="btn shadow-none rounded-circle"
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
  );
};

export default Pagination;
