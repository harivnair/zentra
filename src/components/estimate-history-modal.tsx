"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/endpoint"

interface EstimateVersion {
    id: string
    version: number
    createdDate?: string | null
}

interface EstimateHistoryModalProps {
    isOpen: boolean
    onClose: () => void
    eventTitle?: string
    eventID?: string
}

export function EstimateHistoryModal({ isOpen, onClose, eventTitle, eventID }: EstimateHistoryModalProps) {
    const [versions, setVersions] = useState<EstimateVersion[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && eventID) {
            fetchVersions()
        }
    }, [isOpen, eventID])

    const fetchVersions = async () => {
        if (!eventID) return

        setIsLoading(true)
        try {
            const response = await apiRequest(API_ENDPOINTS.events.versions(eventID))
            if (!response.ok) {
                throw new Error('Failed to fetch estimate versions')
            }
            const data = await response.json()
            setVersions(data)
        } catch (error) {
            console.error('Error fetching estimate versions:', error)
            toast.error('Failed to load estimate history')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Estimate History</h2>
                        {eventTitle && <p className="text-sm text-gray-600 mt-1">{eventTitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">Loading versions...</div>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">No estimate versions found</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="border rounded-lg p-5 transition-all border-gray-200 bg-white hover:border-gray-300"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Version {version.version}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                                        Version ID
                                                    </label>
                                                    <p className="text-sm font-medium text-gray-900 font-mono">
                                                        {version.id}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                                        Created Date
                                                    </label>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {version.createdDate
                                                            ? new Date(version.createdDate).toLocaleDateString('en-IN', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : 'Not available'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                // TODO: Implement view details functionality
                                                toast.info('View details coming soon')
                                            }}
                                            variant="outline"
                                            className="ml-4"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="px-6"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )
}
