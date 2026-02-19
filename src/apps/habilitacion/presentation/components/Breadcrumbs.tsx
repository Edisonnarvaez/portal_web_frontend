import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChevronRight, HiOutlineHomeModern } from 'react-icons/hi2';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Additional class */
  className?: string;
}

/**
 * Breadcrumbs component for habilitación module navigation.
 *
 * Usage:
 * ```tsx
 * <Breadcrumbs items={[
 *   { label: 'Habilitación', path: '/habilitacion/' },
 *   { label: 'Prestador ABC', path: '/habilitacion/prestador/1' },
 *   { label: 'Autoevaluación AE-001' },
 * ]} />
 * ```
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1 text-sm mb-6 ${className}`}
    >
      {/* Home icon always links to habilitacion root */}
      <Link
        to="/habilitacion/"
        className="flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Habilitación"
      >
        <HiOutlineHomeModern className="h-4 w-4" />
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <HiOutlineChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            {isLast || !item.path ? (
              <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
