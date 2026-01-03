import { useState } from "react";
import AuthLayout from "./AuthLayout";
import AuthModal from "./AuthModal";
import RoleSwitch from "./RoleSwitch";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { API_URL } from "./config";

function Login({ onLogin }) {
  const [role, setRole] = useState("patient");
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function loginSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const r = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "Login failed");
        return;
      }

      // 🔥 ROLE CHECK (IMPORTANT)
      if (d.role !== role) {
        alert(`This account is registered as ${d.role}. Please switch role.`);
        return;
      }

      onLogin(d);
    } catch (err) {
      console.error("Login error:", err);
      alert(`Connection failed. Please check:\n1. Backend is running\n2. No ad blocker is active\n3. API URL: ${API_URL}`);
    } finally {
      setLoading(false);
    }
  }

  async function signupSubmit(e) {
    e.preventDefault();

    // ✅ Email validation on frontend
    if (!email.endsWith("@gmail.com")) {
      alert("Only @gmail.com emails are allowed!");
      return;
    }

    setLoading(true);

    try {
      const r = await fetch(`${API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });

      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "Signup failed");
        return;
      }

      onLogin(d);
    } catch (err) {
      console.error("Signup error:", err);
      alert(`Connection failed. Please check:\n1. Backend is running at ${API_URL}\n2. No ad blocker is blocking the request\n3. CORS is properly configured\n\nError: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ✅ GOOGLE SIGN-IN HANDLER
  async function handleGoogleSignIn() {
    // Load Google Sign-In API
    if (!window.google) {
      alert("Google Sign-In is loading... Please try again in a moment.");
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // ⚠️ REPLACE THIS
        scope: "email profile",
        callback: async (response) => {
          if (response.access_token) {
            setLoading(true);
            try {
              // Get user info from Google
              const userInfo = await fetch(
                `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`
              );
              const userData = await userInfo.json();

              console.log("Google user data:", userData);

              // Only allow Gmail
              if (!userData.email.endsWith("@gmail.com")) {
                alert("Only @gmail.com emails are allowed!");
                return;
              }

              // Send to backend
              const r = await fetch(`${API_URL}/api/users/google-signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: userData.email,
                  name: userData.name,
                  role: role
                })
              });

              const user = await r.json();
              if (!r.ok) {
                alert(user.error || "Google sign-in failed");
                return;
              }

              onLogin(user);
            } catch (err) {
              console.error("Google Sign-In backend error:", err);
              alert(`Failed to complete Google sign-in: ${err.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      });

      client.requestAccessToken();
    } catch (err) {
      console.error("Google Sign-In error:", err);
      alert("Failed to sign in with Google. Please try again.");
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-white max-w-lg">
        <RoleSwitch role={role} setRole={setRole} />

        <div className="space-y-4 mt-6">
          <button 
            onClick={() => setMode("login")} 
            className="w-full py-4 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign in"}
          </button>
          <button 
            onClick={() => setMode("signup")} 
            className="w-full py-4 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "Create account"}
          </button>
        </div>

        {/* Debug info (remove in production) */}
        <p className="text-xs text-slate-500 mt-4 text-center">
          API: {API_URL}
        </p>
      </div>

      {mode === "login" && (
        <AuthModal onClose={() => setMode(null)}>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={loginSubmit}
            onGoogleSignIn={handleGoogleSignIn}
            loading={loading}
          />
        </AuthModal>
      )}

      {mode === "signup" && (
        <AuthModal onClose={() => setMode(null)}>
          <SignupForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={signupSubmit}
            onGoogleSignIn={handleGoogleSignIn}
            loading={loading}
          />
        </AuthModal>
      )}
    </AuthLayout>
  );
}

export default Login;