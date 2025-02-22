import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-5 py-2 text-gray-700 font-medium rounded-md transition duration-200 hover:bg-gray-200">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md transition duration-200 hover:bg-blue-700">
                Sign Up
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Organize Your Tasks Effortlessly
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            A simple and secure way to manage your daily tasks and boost productivity.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-md shadow-lg hover:bg-blue-700 transition">
                Get Started
              </button>
            </Link>
            <Link href="/login">
              <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold text-lg rounded-md shadow-lg hover:bg-gray-100 transition">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Task Manager. All rights reserved.</p>
      </footer>
    </div>
  );
}
