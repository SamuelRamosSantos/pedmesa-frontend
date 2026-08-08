import axios from "axios";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoWordmarkDark from "../assets/logo-wordmark-dark.svg";
import logoWordmark from "../assets/logo-wordmark.svg";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getHomeRouteForRoles } from "../lib/role-routes";
import { login } from "../services/auth.service";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login: authenticate } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { token, usuario } = await login({ email, senha });
      authenticate(token, usuario);
      navigate(getHomeRouteForRoles(usuario.roles), { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        showToast("E-mail ou senha inválidos.", "error");
      } else {
        showToast("Não foi possível entrar. Tente novamente em instantes.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logoWordmark} alt="PedMesa" className="h-10 w-auto dark:hidden" />
          <img src={logoWordmarkDark} alt="PedMesa" className="hidden h-10 w-auto dark:block" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Entre com sua conta para continuar</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="E-mail"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              name="senha"
              autoComplete="current-password"
              placeholder="••••••••"
              icon={<LockKeyhole className="h-4 w-4" />}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
