import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, User2 } from "lucide-react";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    if (username.trim() === "admin" && password.trim() === "123") {
      localStorage.setItem("sml_auth", "true");
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate("/dashboard");
    } else {
      setError("Login yoki parol noto'g'ri!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1329] p-4 text-slate-100">
      <div className="w-full max-w-100 bg-[#131d36] border border-slate-800 rounded-[24px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="pt-10 pb-6 text-center space-y-4 px-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600/20 border border-teal-500/30 text-teal-400 shadow-inner">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Panel
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              Tizimga kirish uchun ma'lumotlarni kiriting
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 pb-8 pt-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-[13px] font-semibold text-slate-300 ml-1 block"
              >
                Foydalanuvchi nomi
              </label>
              <div className="relative group">
                <User2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  id="username"
                  placeholder="admin"
                  className="w-full h-12 pl-11 pr-4 bg-slate-900/70 border border-slate-700/80 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-xl text-sm text-white placeholder-slate-500 transition-all"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-slate-300 ml-1 block"
              >
                Parol
              </label>
              <div className="relative group">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 bg-slate-900/70 border border-slate-700/80 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-xl text-sm text-white placeholder-slate-500 transition-all"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 mt-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-teal-950/40"
            >
              Tizimga kirish
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/60 py-4 border-t border-slate-800 text-center">
          <p className="w-full text-center text-[10px] uppercase tracking-[2px] font-bold text-slate-500">
            Xavfsiz tizim boshqaruvi &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;