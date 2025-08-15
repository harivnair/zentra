import React from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    children?: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null

    return createPortal(
        <div className="modal modal-open">
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-box">
                {title && <h3 className="font-bold text-lg">{title}</h3>}
                <div className="py-4">{children}</div>
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>,
        document.body,
    )
}
