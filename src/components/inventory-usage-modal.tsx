import React from "react"
// Simple custom modal (no Shadcn/ui Dialog)
import { InventoryUsage } from "@/types/inventory"
import moment from "moment"

interface InventoryUsageModalProps {
  open: boolean
  onClose: () => void
  usage: InventoryUsage[] | null
  loading: boolean
}


const InventoryUsageModal: React.FC<InventoryUsageModalProps> = ({ open, onClose, usage, loading }) => {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:!bg-gray-900 dark:border dark:border-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-light leading-none transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Inventory Usage History</h2>
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading usage data...</p>
          </div>
        ) : usage && usage.length > 0 ? (
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                  <th className="py-4 px-6">Project ID</th>
                  <th className="py-4 px-6">From Date</th>
                  <th className="py-4 px-6">To Date</th>
                  <th className="py-4 px-6 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usage.map((u, index) => (
                  <tr key={u.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{u.projectID || u.projectId || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{u.fromDate ? moment(u.fromDate).format('MMM DD, YYYY') : '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{u.toDate ? moment(u.toDate).format('MMM DD, YYYY') : '-'}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">{u.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="text-gray-400 text-5xl mb-4">📦</div>
            <p className="text-lg text-gray-600 font-medium">No usage found</p>
            <p className="text-sm text-gray-500 mt-2">This inventory item has not been used in any projects yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryUsageModal
