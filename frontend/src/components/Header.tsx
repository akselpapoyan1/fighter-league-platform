import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, UserCog, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Fighters", href: "/fighters" },
  { name: "Divisions", href: "/divisions" },
  { name: "Events", href: "/events" },
];

export const Header = () => {
  const { token, logout, userType } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderProfileLink = (isMobile = false) => {
    const commonClass = isMobile
      ? "text-lg font-medium flex items-center justify-center"
      : "";
    const iconClass = isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 mr-2";

    switch (userType) {
      case "ADMIN":
        return (
          <Button variant="ghost" asChild>
            <Link to="/dashboard/admin" className={commonClass}>
              <UserCog className={iconClass} />
              Admin
            </Link>
          </Button>
        );
      case "FIGHTER":
        return (
          <Button variant="ghost" asChild>
            <Link to="/dashboard/fighter" className={commonClass}>
              <User className={iconClass} />
              My Profile
            </Link>
          </Button>
        );
      case "SPONSOR":
        return (
          <Button variant="ghost" asChild>
            <Link to="/dashboard/sponsor" className={commonClass}>
              <User className={iconClass} />
              Sponsor Hub
            </Link>
          </Button>
        );
      case "DONOR":
        return (
          <Button variant="ghost" asChild>
            <Link to="/dashboard/donor" className={commonClass}>
              <User className={iconClass} />
              My Page
            </Link>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Valor League Fighter League"
            className="h-10 w-10"
          />
          <span className="text-xl font-bold">
            <span className="text-foreground">Valor </span>
            <span className="text-primary"> League</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {token ? (
              <>
                {renderProfileLink()}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <hr className="my-6 border-border" />

            <div className="flex flex-col gap-4">
              {token ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link
                      to="/admin"
                      className="text-lg font-medium flex items-center justify-center"
                    >
                      <UserCog className="h-5 w-5 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-lg font-medium"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-lg font-medium"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="text-lg font-medium">
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
