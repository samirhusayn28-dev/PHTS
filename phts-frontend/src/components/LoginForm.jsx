import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  onGoogleSignIn
}) {
  const [show, setShow] = useState(false);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(e);
      }}
      className="space-y-6"
    >
      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-5 top-5 text-slate-400" />
        <input
          type="email"
          className="w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-lg text-white"
          placeholder="Email Address (@gmail.com)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-5 top-5 text-slate-400" />
        <input
          type={show ? "text" : "password"}
          className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-2xl text-lg text-white"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-5 top-5 text-slate-400 hover:text-white"
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-5 bg-blue-600 rounded-2xl text-lg font-semibold lift hover:bg-blue-700"
      >
        Sign In
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-slate-900 text-slate-400">OR</span>
        </div>
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={onGoogleSignIn}
        className="w-full py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-3 lift hover:bg-gray-100 font-semibold"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>
    </form>
  );
}

export default LoginForm;