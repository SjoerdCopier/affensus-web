/**
 * Utility functions for merchant status handling
 */

export function getStatusBadgeStyles(status: string): string {
  const baseClasses = 'px-1 py-0.5 rounded-full text-xs'
  
  switch (status.toLowerCase()) {
    case 'approved':
      return `${baseClasses} bg-green-200 text-green-800`
    case 'pending':
      return `${baseClasses} bg-yellow-200 text-yellow-800`
    case 'rejected':
    case 'deleted':
    case 'suspended':
      return `${baseClasses} bg-red-200 text-red-800`
    case 'not joined':
    default:
      return `${baseClasses} bg-gray-200 text-gray-800`
  }
}

export function getStatusBadgeStylesWithFontSize(status: string): { className: string; style: React.CSSProperties } {
  return {
    className: getStatusBadgeStyles(status),
    style: { fontSize: '10px' }
  }
}


