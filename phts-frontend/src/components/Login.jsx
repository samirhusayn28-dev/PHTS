import { useState } from "react";
import AuthLayout from "./AuthLayout";
import AuthModal from "./AuthModal";
import RoleSwitch from "./RoleSwitch";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

function Login({ onLogin }) {
  const [role, setRole] = useState("patient");
  const [mode, setMode] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function loginSubmit(e) {
    e.preventDefault();

    const r = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const d = await r.json();
    if (!r.ok) return alert(d.error);

    // 🔥 ROLE CHECK (IMPORTANT)
    if (d.role !== role) {
      return alert(
        `This account is registered as ${d.role}. Please switch role.`
      );
    }

    onLogin(d);
  }

  async function signupSubmit(e) {
    e.preventDefault();

    // ✅ Email validation on frontend
    if (!email.endsWith("@gmail.com")) {
      return alert("Only @gmail.com emails are allowed!");
    }

    const r = await fetch("http://localhost:5000/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const d = await r.json();
    if (!r.ok) return alert(d.error);

    onLogin(d);
  }

  // ✅ GOOGLE SIGN-IN HANDLER
  async function handleGoogleSignIn() {
    // Load Google Sign-In API
    if (!window.google) {
      return alert("Google Sign-In is loading... Please try again in a moment.");
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // ⚠️ REPLACE THIS
        scope: "email profile",
        callback: async (response) => {
          if (response.access_token) {
            // Get user info from Google
            const userInfo = await fetch(
              `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`
            );
            const userData = await userInfo.json();

            console.log("Google user data:", userData);

            // Only allow Gmail
            if (!userData.email.endsWith("@gmail.com")) {
              return alert("Only @gmail.com emails are allowed!");
            }

            // Send to backend
            const r = await fetch("http://localhost:5000/api/users/google-signin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userData.email,
                name: userData.name,
                role: role
              })
            });

            const user = await r.json();
            if (!r.ok) return alert(user.error);

            onLogin(user);
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
          <button onClick={() => setMode("login")} className="w-full py-4 bg-blue-600 rounded-xl">
            Sign in
          </button>
          <button onClick={() => setMode("signup")} className="w-full py-4 bg-white/10 rounded-xl">
            Create account
          </button>
        </div>
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
          />
        </AuthModal>
      )}
    </AuthLayout>
  );
}

export default Login;