import Header from './header';
import Footer from './footer';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
      </div>
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
