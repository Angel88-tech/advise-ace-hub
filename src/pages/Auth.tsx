import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, UserCheck, User } from 'lucide-react';

export default function Auth() {
  const { login, register, loginWithMagicLink } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'advisor' | 'mentor'>('student');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password, name, role);
    }
  };

  const handleMagicLink = async () => {
    await loginWithMagicLink(email);
  };

  const roles = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'advisor', label: 'Advisor', icon: UserCheck },
    { value: 'mentor', label: 'Mentor', icon: User }
  ] as const;

  return (
    <div className="min-h-screen flex">

      <div className="hidden md:flex w-1/2 items-center justify-center p-10 text-white bg-gradient-to-br from-[#6688ecaa] via-[rgba(32,32,176,0.53)] to-orange-500">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-wide">
            Career Recommendation System
          </h1>
          <p className="text-lg text-white/80">
            A smarter way to connect students with mentors and advisors, guide your path, and grow your future.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-5 pt-6">

            <div className="flex gap-2">
              <Button
                className="w-1/2"
                variant={isLogin ? 'default' : 'outline'}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>

              <Button
                className="w-1/2"
                variant={!isLogin ? 'default' : 'outline'}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </div>

            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {!isLogin && (
              <>
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Select Role</p>

                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => {
                      const Icon = r.icon;

                      return (
                        <div
                          key={r.value}
                          onClick={() => setRole(r.value)}
                          className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition ${
                            role === r.value ? 'border-primary shadow-sm' : ''
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-sm">{r.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSubmit}>
              {isLogin ? 'Login' : 'Create Account'}
            </Button>

            <Button variant="secondary" className="w-full" onClick={handleMagicLink}>
              Continue with Magic Link
            </Button>

          </CardContent>
        </Card>
      </div>

    </div>
  );
}