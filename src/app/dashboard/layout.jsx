import CustomerSidebar from "@/components/Customer/CustomerSidebar/CustomerSidebar";
import Header from "@/components/Header/Header";

export default function CustomerDashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Fixed height */}
            <Header isTrackingShow={false} />
            
            {/* Main Content with Sidebar */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Sidebar - Fixed width, scrollable if needed */}
                <div className="hidden md:block md:w-64 bg-white border-r border-gray-200 shadow-sm">
                    <CustomerSidebar />
                </div>

                {/* Main Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <main className="p-6">
                        <div className="xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
