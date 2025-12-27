import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LucideIcon } from 'lucide-react'

interface ShortcutTileProps {
    label: string
    icon?: LucideIcon
    href: string
    color: string // bg color class
    iconColor?: string // icon color class
    image?: string // image path
}

export default function ShortcutTile({ label, icon: Icon, href, color, iconColor, image }: ShortcutTileProps) {
    return (
        <Link href={href} className="h-full">
            <div className={`flex flex-col items-center justify-center rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 shadow-md border border-gray-100 ${color} min-h-40 group relative overflow-hidden`}>
                {/* Image background */}
                {image && (
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                        <Image
                            src={`/${image}`}
                            alt={label}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            className="object-cover"
                            quality={85}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                    {/* Icon with gradient background */}
                    {Icon && (
                        <div className="mb-4 p-4 rounded-lg bg-white bg-opacity-50 group-hover:bg-opacity-100 transition-all">
                            <Icon className={`h-12 w-12 ${iconColor}`} strokeWidth={1.5} />
                        </div>
                    )}
                    {/* Label */}
                    {label && (
                        <span className="text-base font-semibold text-center text-gray-800">{label}</span>
                    )}
                    {/* Decorative element */}
                    {label && (
                        <div className="mt-3 h-1 w-12 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                    )}
                </div>
            </div>
        </Link>
    )
}
