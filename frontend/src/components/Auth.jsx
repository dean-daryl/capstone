<section className="py-16">
<h2 className="text-4xl font-bold">Get Started</h2>
<p className="mt-4 text-gray-600">Create an account or log in to save your progress and access personalized features.</p>
<div className="mt-10 max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
    <form className="space-y-6">
        <div>
            <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
            >
                Email Address
            </label>
            <input
                type="email"
                id="email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                required
            />
        </div>
        <div>
            <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
            >
                Password
            </label>
            <input
                type="password"
                id="password"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
            />
        </div>
        <div className="flex items-center justify-between">
            <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
            >
                Log In
            </button>
            <a href="#" className="text-sm text-indigo-600 hover:underline">
                Forgot password?
            </a>
        </div>
    </form>
    <div className="mt-6 text-sm text-gray-600">
        Don't have an account?{" "}
        <a href="#" className="text-indigo-600 hover:underline">
            Sign up here
        </a>
    </div>
</div>
</section>