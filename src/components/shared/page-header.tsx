"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export function PageHeader({ title, backHref, children }: { title: string; backHref?: string; children?: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
      {backHref && (
        <button onClick={() => router.push(backHref)} className="p-1 -ml-1 rounded-lg hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="text-lg font-semibold flex-1">{title}</h1>
      {children}
    </div>
  )
}
