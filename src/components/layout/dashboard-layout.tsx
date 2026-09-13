import { Outlet } from 'react-router';
import { Suspense } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { PageTransition } from './page-transition';
import { PageLoader } from '@/components/ui/page-loader';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-bg">
      <Navbar />
      <main className="min-w-0 flex-1 px-4 py-6 pb-16 sm:px-6 md:py-8 lg:px-8 lg:pb-8">
        <div className="mx-auto w-full max-w-7xl">
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </div>
      </main>
      <Footer />
    </div>
  );
};
