'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiRequest } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/endpoint'

interface ExpenseItem {
    itemName: string
    amount: number
    comments: string
    poc: string
    expenseDescription: 'ESTIMATED_EXPENSE' | 'ACTUAL_EXPENSE'
    createdDate?: string
    lastUpdateddDate?: string
    expenseStatus: 'ESTIMATE_SUBMITTED' | 'APPROVED' | 'REJECTED'
}

interface ExpensesModalProps {
    isOpen: boolean
    onClose: () => void
    eventData: {
        id?: string
        expensesList?: ExpenseItem[]
        [key: string]: unknown
    }
    onSave: () => void
}

export function ExpensesModal({ isOpen, onClose, eventData, onSave }: ExpensesModalProps) {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([])

    useEffect(() => {
        if (!isOpen) return

        // Load existing expenses if available, otherwise start with one empty field
        if (Array.isArray(eventData?.expensesList) && eventData.expensesList.length > 0) {
            setExpenses(eventData.expensesList)
        } else {
            setExpenses([{
                itemName: '',
                amount: 0,
                comments: '',
                poc: '',
                expenseDescription: 'ESTIMATED_EXPENSE',
                expenseStatus: 'ESTIMATE_SUBMITTED',
            }])
        }
    }, [isOpen, eventData])

    const handleAddExpense = () => {
        setExpenses([
            ...expenses,
            {
                itemName: '',
                amount: 0,
                comments: '',
                poc: '',
                expenseDescription: 'ESTIMATED_EXPENSE',
                expenseStatus: 'ESTIMATE_SUBMITTED',
            },
        ])
    }

    const handleRemoveExpense = (index: number) => {
        setExpenses(expenses.filter((_, i) => i !== index))
    }

    const handleExpenseChange = (index: number, field: keyof ExpenseItem, value: string | number) => {
        const newExpenses = [...expenses]
        newExpenses[index] = { ...newExpenses[index], [field]: value }
        setExpenses(newExpenses)
    }

    const handleSave = async () => {
        try {
            // Filter out incomplete expenses
            const completeExpenses = expenses.filter(exp => exp.itemName && exp.amount > 0)

            const updatedEvent = {
                ...eventData,
                expensesList: completeExpenses.map(exp => ({
                    ...exp,
                    createdDate: exp.createdDate || new Date().toISOString(),
                    lastUpdateddDate: new Date().toISOString(),
                })),
            }

            const res = await apiRequest(API_ENDPOINTS.events.list, {
                method: 'POST',
                body: JSON.stringify(updatedEvent),
            })

            if (res.ok) {
                onSave()
                onClose()
            } else {
                alert('Failed to save expenses')
            }
        } catch (err) {
            console.error('Error saving expenses:', err)
            alert('Error saving expenses')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:!bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-4">Expenses</h2>

                <div className="mb-6">
                    <div className="space-y-4">
                        {expenses.map((expense, index) => (
                            <div key={index} className="border rounded p-4 bg-gray-50 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <Label className="text-sm font-medium">Item Name *</Label>
                                        <Input
                                            type="text"
                                            value={expense.itemName}
                                            onChange={e => handleExpenseChange(index, 'itemName', e.target.value)}
                                            placeholder="e.g., Transportation, Food"
                                            className="text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Amount *</Label>
                                        <Input
                                            type="number"
                                            value={expense.amount}
                                            onChange={e => handleExpenseChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter amount"
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <Label className="text-sm font-medium">POC</Label>
                                        <Input
                                            type="text"
                                            value={expense.poc}
                                            onChange={e => handleExpenseChange(index, 'poc', e.target.value)}
                                            placeholder="Point of Contact"
                                            className="text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Expense Type</Label>
                                        <select
                                            value={expense.expenseDescription}
                                            onChange={e => handleExpenseChange(index, 'expenseDescription', e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-sm"
                                        >
                                            <option value="ESTIMATED_EXPENSE">Estimated Expense</option>
                                            <option value="ACTUAL_EXPENSE">Actual Expense</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <select
                                            value={expense.expenseStatus}
                                            onChange={e => handleExpenseChange(index, 'expenseStatus', e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-sm"
                                        >
                                            <option value="ESTIMATE_SUBMITTED">Estimate Submitted</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Comments</Label>
                                        <Input
                                            type="text"
                                            value={expense.comments}
                                            onChange={e => handleExpenseChange(index, 'comments', e.target.value)}
                                            placeholder="Add any notes"
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveExpense(index)}
                                        className="text-red-600"
                                    >
                                        Remove Expense
                                    </Button>
                                    {index === expenses.length - 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddExpense}
                                        >
                                            + Add Another
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save Expenses
                    </Button>
                </div>
            </div>
        </div>
    )
}
