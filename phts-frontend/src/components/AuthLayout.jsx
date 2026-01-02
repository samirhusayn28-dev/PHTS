import { Activity, Bell, BarChart3, Trophy } from "lucide-react";

function AuthLayout({ children }) {
  return (
    <div className="health-bg flex items-center justify-center px-12">
      <div className="relative z-10 w-full max-w-[90rem] grid grid-cols-1 lg:grid-cols-2 gap-24 items-center text-white">

        {/* LEFT */}
        <div className="space-y-10">
          <div>
            <h1 className="text-6xl font-semibold text-blue-400">PHTS</h1>
            <p className="text-2xl mt-2 text-slate-300">
              Patient Health Tracking System
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
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

          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 lift">
            <h3 className="text-3xl font-semibold mb-6">
              Your Health, Simplified
            </h3>
            <ul className="space-y-4 text-xl text-slate-300">
              <li>• Real-time vitals monitoring with instant updates</li>
              <li>• Intelligent alerts when readings are abnormal</li>
              <li>• Advanced analytics with visual trend graphs</li>
              <li>• Achievement badges to keep you motivated</li>
            </ul>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lift">
      <div className="mb-4 text-blue-400">{icon}</div>
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="text-slate-300 mt-1 text-lg">{desc}</p>
    </div>
  );
}

export default AuthLayout;
