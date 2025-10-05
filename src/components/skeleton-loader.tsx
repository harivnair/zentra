"use client"

import React from 'react'

/**
 * Reusable Skeleton Loading Components
 *
 * Usage Examples:
 *
 * // Table skeleton for use inside table structure (recommended)
 * <TableRowSkeleton rows={8} />
 *
 * // Table skeleton for use outside table structure
 * <TableSkeleton rows={8} columns={6} />
 *
 * // Card skeleton for mobile views
 * <ListSkeleton type="cards" items={5} />
 *
 * // Stats skeleton for dashboard
 * <ListSkeleton type="stats" count={5} />
 *
 * // Individual skeleton elements
 * <Skeleton className="h-4 w-32" />
 */

interface SkeletonProps {
    className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

// Skeleton for table rows (for use inside table structure)
export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-100">
                <td className="py-4">
                    <Skeleton className="h-4 w-32" />
                </td>
                <td className="py-4">
                    <Skeleton className="h-4 w-24" />
                </td>
                <td className="py-4">
                    <Skeleton className="h-4 w-28" />
                </td>
                <td className="py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="py-4">
                    <Skeleton className="h-4 w-24" />
                </td>
                <td className="py-4 text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                </td>
            </tr>
        ))}
    </>
)

// Skeleton for table rows
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 6
}) => (
    <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4 py-4 border-t border-gray-100">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton
                        key={colIndex}
                        className={`${colIndex === 0 ? 'w-32' : // Client name
                                colIndex === 1 ? 'w-24' : // Date
                                    colIndex === 2 ? 'w-28' : // POC
                                        colIndex === 3 ? 'w-20' : // Status
                                            colIndex === 4 ? 'w-24' : // Assignee
                                                'w-8' // Actions
                            } ${colIndex === columns - 1 ? 'ml-auto' : ''}`}
                    />
                ))}
            </div>
        ))}
    </div>
)

// Skeleton for card/list items
export const CardSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: items }).map((_, index) => (
            <div key={index} className="border rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        ))}
    </div>
)

// Skeleton for dashboard stats cards
export const StatsSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="rounded-lg p-6 border border-gray-200 shadow-md">
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
            </div>
        ))}
    </div>
)

// Generic list skeleton loader
export const ListSkeleton: React.FC<{
    type: 'table' | 'cards' | 'stats'
    rows?: number
    columns?: number
    items?: number
    count?: number
}> = ({ type, rows = 5, columns = 6, items = 3, count = 5 }) => {
    if (type === 'table') {
        return <TableSkeleton rows={rows} columns={columns} />
    }
    if (type === 'stats') {
        return <StatsSkeleton count={count} />
    }
    return <CardSkeleton items={items} />
}