import Sidebar from "./Sidebar";

const Layout = ({ links, children }) => (
  <div className="min-h-screen overflow-x-hidden bg-orange-50 text-gray-900">
    <div className="flex flex-col xl:flex-row">
      <Sidebar links={links} />
      <main className="flex-1 px-6 py-6 xl:px-10 xl:py-8">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  </div>
);

export default Layout;
