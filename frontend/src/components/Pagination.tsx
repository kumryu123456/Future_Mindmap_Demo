import React from 'react';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemsPerPage?: boolean;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showStats?: boolean;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemsPerPage = true,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  showStats = true,
  maxVisiblePages = 7,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    // 첫 페이지
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // 마지막 페이지
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
      // 현재 페이지 조정 (동일한 아이템을 표시하도록)
      const currentFirstItem = (currentPage - 1) * itemsPerPage + 1;
      const newPage = Math.ceil(currentFirstItem / newItemsPerPage);
      onPageChange(newPage);
    }
  };

  if (totalPages <= 1) {
    return showStats ? (
      <div className="pagination-container">
        <div className="pagination-stats">
          총 {totalItems}개 결과
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="pagination-container">
      {showStats && (
        <div className="pagination-stats">
          {startItem}-{endItem} / 총 {totalItems}개
        </div>
      )}

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          title="첫 페이지"
          aria-label="첫 페이지로 이동"
        >
          ⏮
        </button>
        
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="이전 페이지"
          aria-label="이전 페이지로 이동"
        >
          ◀
        </button>

        <div className="pagination-pages">
          {getVisiblePages().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={page}
                className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={page === currentPage ? `현재 페이지, ${page}페이지` : `${page}페이지로 이동`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                {page}
              </span>
            )
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="다음 페이지"
          aria-label="다음 페이지로 이동"
        >
          ▶
        </button>
        
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="마지막 페이지"
          aria-label="마지막 페이지로 이동"
        >
          ⏭
        </button>
      </div>

      {showItemsPerPage && onItemsPerPageChange && (
        <div className="pagination-per-page">
          <label>
            페이지당
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="per-page-select"
              aria-label="페이지당 항목 수 선택"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}개
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export default Pagination;