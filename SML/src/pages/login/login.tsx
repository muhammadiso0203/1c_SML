import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogin } from "./service/useLogin";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, LockKeyhole, User2, Loader2 } from "lucide-react";

import { checkAuth, setAuthSession } from "@/lib/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { mutate: loginMutate, isPending } = useLogin();

  const dashboardPath = import.meta.env.VITE_DASHBOARD_PATH || "/dashboard";

  useEffect(() => {
    if (checkAuth()) {
      navigate(dashboardPath, { replace: true });
    }
  }, [navigate, dashboardPath]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warning("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    loginMutate(
      { username, password },
      {
        onSuccess: (res) => {
          if (res && res.success !== false) {
            const token = btoa(`${username}:${password}`);
            setAuthSession(username, token);

            toast.success("Muvaffaqiyatli tizimga kirdingiz", {
              position: "top-right",
            });
            navigate(dashboardPath, { replace: true });
          } else {
            toast.error("Kirishda xatolik!", {
              description: res?.message || "Login yoki parol noto'g'ri!",
              duration: 4000,
            });
          }
        },
        onError: (error: unknown) => {
          const apiError = error as {
            response?: {
              data?: { message?: string };
            };
            message?: string;
          };
          const errorMsg =
            apiError.response?.data?.message ||
            apiError.message ||
            "Login yoki parol noto'g'ri!";
          toast.error("Kirishda xatolik!", {
            description: errorMsg,
            duration: 4000,
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <Card className="w-full max-w-100 border-slate-800 bg-[#111827] rounded-3xl overflow-hidden shadow-2xl">
        <CardHeader className="pt-10 pb-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Admin Panel
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Tizimga kirish uchun ma'lumotlarni kiriting
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2.5">
              <Label
                htmlFor="username"
                className="text-[13px] font-semibold text-slate-300 ml-1"
              >
                Foydalanuvchi nomi
              </Label>
              <div className="relative group">
                <User2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="username"
                  placeholder="Admin"
                  className="h-12 pl-11 bg-slate-900 border-slate-700 text-slate-100 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="password"
                className="text-[13px] font-semibold text-slate-300 ml-1"
              >
                Parol
              </Label>
              <div className="relative group">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pl-11 pr-11 bg-slate-900 border-slate-700 text-slate-100 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Tizimga kirish"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-slate-900/50 py-4 border-t border-slate-800">
          <p className="w-full text-center text-[10px] uppercase tracking-[2px] font-bold text-slate-500">
            Xavfsiz tizim boshqaruvi &copy; 2026
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;