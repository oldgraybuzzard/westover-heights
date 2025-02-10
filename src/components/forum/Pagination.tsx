import React from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, baseUrl }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 my-8">
      <Link
        href={`${baseUrl}?page=${currentPage - 1}`}
        className={`btn-secondary p-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-disabled={currentPage === 1}
      >
        <FaChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map(page => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={`px-4 py-2 rounded ${currentPage === page
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={`${baseUrl}?page=${currentPage + 1}`}
        className={`btn-secondary p-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-disabled={currentPage === totalPages}
      >
        <FaChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default Pagination; 