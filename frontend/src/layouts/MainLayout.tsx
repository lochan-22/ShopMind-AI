import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 antialiased">
      <main className="flex flex-col w-full">{children}</main>
    </div>
  );
};

export default MainLayout;