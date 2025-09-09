import AdminHeader from "@/components/Admin/AdminHeader";
import AdminSidebar from "@/components/Admin/AdminSidebar/AdminSidebar";


export default function RootLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - Fixed height with scroll */}
            <div className="hidden md:flex md:w-64 md:flex-col h-screen">
                <AdminSidebar />
            </div>

            {/* Main Content Area - Fixed height */}
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                {/* Header - Fixed height */}
                <AdminHeader />

                {/* Main Content - Scrollable within remaining height */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="2xl:max-w-7xl xl:max-w-6xl lg:xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl xl:2xl:max-w-7xl xl:max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}