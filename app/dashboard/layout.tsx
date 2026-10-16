import type { ReactNode } from "react"
import { DashboardBackButton } from "@/components/dashboard-back-button"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-5 pt-4 lg:justify-start lg:pl-[272px]">
        <div className="pointer-events-auto">
          <DashboardBackButton />
        </div>
      </div>
      {children}
    </div>
  )
}
