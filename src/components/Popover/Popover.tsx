import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type PopoverProps = {
    trigger: React.ReactNode
    children: React.ReactNode
}

export default function Popover({ trigger, children }: PopoverProps) {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)
    const [coords, setCoords] = useState<{ left: number; top: number } | null>(null)

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const target = e.target as Node
            if (open) {
                if (triggerRef.current && triggerRef.current.contains(target)) return
                if (menuRef.current && menuRef.current.contains(target)) return
                setOpen(false)
            }
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', onDocClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDocClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const el = triggerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        // estimate menu width (w-56 = 14rem ≈ 224px) and flip to left if it would overflow the viewport
        const menuWidthEstimate = 224
        const margin = 12
        const pageLeft = rect.left + window.scrollX
        const pageRight = rect.right + window.scrollX
        let left = pageLeft
        if (left + menuWidthEstimate > window.innerWidth - margin) {
            // position to the left of the trigger
            left = pageRight - menuWidthEstimate
            if (left < margin) left = margin
        }
        setCoords({ left, top: rect.bottom + window.scrollY + 8 })
        // reposition on resize/scroll
        const onChange = () => {
            const r = el.getBoundingClientRect()
            let l = r.left + window.scrollX
            if (l + menuWidthEstimate > window.innerWidth - margin) {
                l = r.right + window.scrollX - menuWidthEstimate
                if (l < margin) l = margin
            }
            setCoords({ left: l, top: r.bottom + window.scrollY + 8 })
        }
        window.addEventListener('resize', onChange)
        window.addEventListener('scroll', onChange, true)
        return () => {
            window.removeEventListener('resize', onChange)
            window.removeEventListener('scroll', onChange, true)
        }
    }, [open])

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className="btn btn-ghost btn-circle p-2"
                onClick={() => setOpen((s) => !s)}
                aria-expanded={open}
            >
                {trigger}
            </button>

            {open && coords
                ? createPortal(
                    <div
                        ref={menuRef}
                        style={{ left: coords.left, top: coords.top, position: 'absolute', zIndex: 1000 }}
                    >
                        <div className="menu p-0 shadow-lg bg-white text-gray-800 rounded-box w-56 max-h-56 overflow-auto divide-y">
                            {children}
                        </div>
                    </div>,
                    document.body,
                )
                : null}
        </>
    )
}
