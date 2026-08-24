import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div key={location.pathname} className="view-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
