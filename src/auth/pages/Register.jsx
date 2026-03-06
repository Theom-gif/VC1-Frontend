import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getHomePathByRole } from "../roleUtils";

const ROLE_OPTIONS = [
  { label: "Admin", roleId: "1" },
  { label: "Author", roleId: "2" },
  { label: "User", roleId: "3" },
];

export default function Register() {
  const { isAuthenticated, user, register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "3",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (isAuthenticated) {
    return <Navigate to={getHomePathByRole(user?.role)} replace />;
  }

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const trimmedFirstName = form.firstname.trim();
    const trimmedLastName = form.lastname.trim();
    if (trimmedFirstName.length < 2 || trimmedLastName.length < 2) {
      setError("First name and last name must be at least 2 characters.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError("Password confirmation does not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const result = await register({
      ...form,
      firstname: trimmedFirstName,
      lastname: trimmedLastName,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess("Account created successfully. Please sign in.");
    setTimeout(() => navigate("/login", { replace: true }), 700);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#132b59_0%,#081b42_40%,#03122f_100%)] px-4 py-12 text-white">
      <div className="mx-auto w-full max-w-[450px]">
        {/* <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] via-[#ec4899] to-[#3b82f6]">
            <BookOpen size={27} />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight">BookHub</h1>
          <p className="mt-2 text-2xl text-slate-400">Create your account</p>
        </div> */}

        <div className="rounded-[30px] border border-[#294267] bg-[linear-gradient(180deg,#18294a_0%,#162344_100%)] p-8 shadow-[0_22px_70px_rgba(8,10,35,0.5)]">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-md font-semibold text-slate-400">First Name</label>
              <input
                type="text"
                value={form.firstname}
                onChange={(event) => onChange("firstname", event.target.value)}
                placeholder="Your first name"
                required
                className="w-full rounded-2xl border border-slate-300/30 bg-slate-200 px-4 py-3 text-l text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-50/80"
              />
            </div>

            <div>
              <label className="mb-2 block text-md font-semibold text-slate-400">Last Name</label>
              <input
                type="text"
                value={form.lastname}
                onChange={(event) => onChange("lastname", event.target.value)}
                placeholder="Your last name"
                required
                className="w-full rounded-2xl border border-slate-300/30 bg-slate-200 px-4 py-3 text-l text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-50/80"
              />
            </div>

            <div>
              <label className="mb-2 block text-lg font-semibold text-slate-400">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-slate-300/30 bg-slate-200 px-4 py-3 text-l text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-50/80"
              />
            </div>

            <div>
              <label className="mb-2 block text-md font-semibold text-slate-400">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.roleId}
                    type="button"
                    onClick={() => onChange("role_id", role.roleId)}
                    className={`rounded-xl px-4 py-2.5 text-md font-semibold transition-all ${
                      form.role_id === role.roleId
                        ? "bg-gradient-to-r from-[#9f53f4] to-[#ec4899] text-white shadow-[0_8px_24px_rgba(180,69,228,0.4)]"
                        : "bg-[#263758] text-slate-400 hover:text-white"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-md font-semibold text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => onChange("password", event.target.value)}
                  placeholder="Create password"
                  required
                  className="w-full rounded-2xl border border-slate-300/30 bg-slate-200 px-4 py-3 pr-12 text-l text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-50/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-md font-semibold text-slate-400">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={(event) => onChange("password_confirmation", event.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full rounded-2xl border border-slate-300/30 bg-slate-200 px-4 py-3 pr-12 text-l text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-slate-50/80"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            {success && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-300">{success}</p>}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9f53f4] via-[#df4ca5] to-[#3b82f6] px-5 py-3 text-2l font-bold transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Register
            </button>
          </form>

          <p className="mt-7 text-center text-2l text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-violet-300 hover:text-violet-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
