import Sidebar from './Sidebar';

const Layout = ({ links, children }) => (
  <div className="flex bg-gray-100 min-h-screen">
    <Sidebar links={links} />
    <main className="flex-1 p-6">{children}</main>
  </div>
);

export default Layout;
