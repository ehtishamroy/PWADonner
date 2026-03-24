import { DonorSidebar } from '@/components/ui/DonorSidebar';
import { BottomNav } from '@/components/ui/BottomNav';

/**
 * Shared layout for all authenticated donor pages.
 * - Desktop: Fixed left sidebar (256px) + content offset to the right
 * - Mobile: Full width content + fixed bottom navigation bar
 */
export default function DonorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex bg-[#F5F0EA]">
            {/* Desktop sidebar — only visible on md+ */}
            <DonorSidebar />

            {/* Main content area — offset by sidebar width on desktop */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {children}
            </main>

            {/* Mobile bottom nav — only visible on mobile */}
            <BottomNav />
        </div>
    );
}
