const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-10">
    <div className="w-full max-w-lg rounded-[2rem] border border-orange-100 bg-white/95 p-10 text-center shadow-soft">
      <div className="mb-6 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
        Access denied
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Unauthorized</h2>
      <p className="text-gray-600">
        You do not have permission to access this page. Please contact your
        administrator if you believe this is an error.
      </p>
    </div>
  </div>
);

export default UnauthorizedPage;
