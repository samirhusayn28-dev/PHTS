import { Activity, Bell, BarChart3, Trophy } from "lucide-react";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8">
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-center text-white">

        {/* LEFT - Features Section */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 order-2 lg:order-1">
          {/* Title */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-blue-400">PHTS</h1>
            <p className="text-lg sm:text-xl lg:text-2xl mt-2 text-slate-300">
              Patient Health Tracking System
            </p>
          </div>

          {/* Feature Grid - Responsive */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Feature
              icon={<Activity />}
              title="Real-time Monitoring"
              desc="Track your vitals 24/7"
            />
            <Feature
              icon={<Bell />}
              title="Smart Alerts"
              desc="Get notified of anomalies"
            />
            <Feature
              icon={<BarChart3 />}
              title="Advanced Analytics"
              desc="Visualize your health trends"
            />
            <Feature
              icon={<Trophy />}
              title="Gamification"
              desc="Earn badges & achievements"
            />
          </div>

          {/* Feature List - Hidden on small screens, shown on md+ */}
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-10">
            <h3 className="text-2xl lg:text-3xl font-semibold mb-4 lg:mb-6">
              Your Health, Simplified
            </h3>
            <ul className="space-y-3 lg:space-y-4 text-base lg:text-xl text-slate-300">
              <li>• Real-time vitals monitoring with instant updates</li>
              <li>• Intelligent alerts when readings are abnormal</li>
              <li>• Advanced analytics with visual trend graphs</li>
              <li>• Achievement badges to keep you motivated</li>
            </ul>
          </div>
        </div>

        {/* RIGHT - Auth Form */}
        <div className="order-1 lg:order-2 flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all">
      <div className="mb-2 sm:mb-4 text-blue-400">{icon}</div>
      <h4 className="text-sm sm:text-base lg:text-xl font-semibold">{title}</h4>
      <p className="text-slate-300 mt-1 text-xs sm:text-sm lg:text-lg">{desc}</p>
    </div>
  );
}

export default AuthLayout;