import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Compass, Menu, X, User, LogOut, Settings } from 'lucide-react';

export function Navbar() {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (profile?.role) {
      case 'student':
        return '/student/dashboard';
      case 'advisor':
        return '/advisor/dashboard';
      case 'mentor':
        return '/mentor/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">CareerPath</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                {profile?.role === 'student' && (
                  <>
                    <Link to="/student/recommendations" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Recommendations
                    </Link>
                    <Link to="/student/mentors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Find Mentors
                    </Link>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{profile?.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Button variant="gradient" asChild>
                  <Link to="/auth?mode=register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {profile?.role === 'student' && (
                    <>
                      <Link 
                        to="/student/recommendations" 
                        className="text-sm font-medium py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Recommendations
                      </Link>
                      <Link 
                        to="/student/mentors" 
                        className="text-sm font-medium py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Find Mentors
                      </Link>
                    </>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="gradient" asChild>
                    <Link to="/auth?mode=register" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
