import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Calendar, 
  Lock, 
  PiggyBank, 
  Tag, 
  LogOut, 
  Moon, 
  Sun,
  ChevronRight 
} from 'lucide-react';
import { useEffect } from 'react';

export const Profile = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const isDarkMode = state.theme === 'dark';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/auth/welcome');
  };

  const menuItems = [
    {
      icon: Tag,
      label: 'Manage Categories',
      description: 'Add or remove transaction categories',
      href: '/app/categories'
    },
    {
      icon: Calendar,
      label: 'Calendar & Events',
      description: 'Track upcoming events and budgets',
      href: '/app/events'
    },
    {
      icon: Lock,
      label: 'Lockups',
      description: 'Manage your locked funds',
      href: '/app/lockups'
    },
    {
      icon: PiggyBank,
      label: 'Savings Goals',
      description: 'Track your saving progress',
      href: '/app/savings'
    }
  ];

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" />
          Profile
        </h1>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={state.user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {state.user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{state.user?.name || 'Student'}</h2>
              <p className="text-muted-foreground">{state.user?.email || 'student@example.com'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="theme-toggle" className="font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              id="theme-toggle"
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Card key={item.href} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Link to={item.href} className="flex items-center p-4 gap-3 w-full">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Features */}
      <Card>
        <CardHeader>
          <CardTitle>More Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/app/split">
              <Settings className="w-4 h-4 mr-2" />
              Split & Borrow
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/app/scanner">
              <Settings className="w-4 h-4 mr-2" />
              QR Scanner
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="p-4">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-muted-foreground pb-4">
        <p>Student Money Tracker v1.0</p>
        <p>Made for students, by students</p>
      </div>
    </div>
  );
};