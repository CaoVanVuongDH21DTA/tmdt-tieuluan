export const SidebarSkeleton = () => {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-500 to-blue-700 lg:static lg:inset-0">
      <div className="flex items-center justify-center h-16 border-b border-blue-400">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-400 rounded animate-pulse"></div>
          <div className="h-6 bg-blue-400 rounded animate-pulse w-32"></div>
        </div>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {[...Array(5)].map((_, index) => (
            <li key={index}>
              <div className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg animate-pulse">
                <div className="w-6 h-6 bg-blue-400 rounded"></div>
                <div className="h-4 bg-blue-400 rounded flex-1"></div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};