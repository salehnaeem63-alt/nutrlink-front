import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Adjust path if your context is elsewhere

const Hero = () => {
    // 1. Extract the user from the global state
    const { user } = useContext(AuthContext);

    return (
        <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-[#eef7f0]">
            {/* Left Content Area */}
            <div className="md:w-1/2 space-y-6">

                {/* 2. Conditionally render the greeting using Optional Chaining */}
                {user?.username && (
                    <p className="text-xl font-semibold text-gray-700 mb-2 animate-fade-in">
                        Welcome back, <span className="text-green-600 capitalize">{user.username}</span>! 👋
                    </p>
                )}

                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                    Your Journey to <span className="text-green-500">Better Health</span> Starts Here
                </h1>

                <p className="text-lg text-gray-600">
                    Connect with expert nutritionists, track your diet, and achieve your
                    wellness goals with our AI-powered platform.
                </p>

                <div className="flex space-x-4 pt-4">
                    <Link
                        to={user?.role === 'nutritionist' ? '/Ndashboard' : '/dashboard'}
                        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/nutritionists"
                        className="px-6 py-3 bg-white text-green-500 border-2 border-green-500 font-semibold rounded-lg hover:bg-green-50 transition"
                    >
                        Find Nutritionists
                    </Link>
                </div>

                {/* Statistics Row */}
                <div className="flex space-x-8 pt-8">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">10K+</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Happy Clients</p>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">500+</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Nutritionists</p>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">95%</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</p>
                    </div>
                </div>
            </div>

            {/* Right Image Area */}
            <div className="md:w-1/2 mt-10 md:mt-0 flex justify-end">
                <img
                    src="/hero-food-image.jpg" // Ensure you place your actual food image in the public folder and link it here
                    alt="Healthy food bowl"
                    className="rounded-3xl shadow-2xl object-cover max-h-[500px]"
                />
            </div>
        </section>
    );
};

export default Hero;