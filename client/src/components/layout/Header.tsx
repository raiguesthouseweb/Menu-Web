import { Link, useLocation } from "wouter";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSelect from "@/components/ui/language-select";
import { useCart } from "@/hooks/use-cart";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu as MenuIcon, 
  ShoppingCart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const links = [
  { href: "/", label: "Home" },
  { href: "/restaurant", label: "Order Food" },
  { href: "/order-status", label: "Order Status" },
  { href: "/ujjain", label: "Explore Ujjain" },
  { href: "/superman", label: "Admin Panel" },
];

export default function Header() {
  const [location] = useLocation();
  const { getTotalQuantity } = useCart();
  const cartQuantity = getTotalQuantity();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container-custom py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2 cursor-pointer">
              <Logo />
              <h1 className="font-semibold text-xl tracking-tight">Rai Guest House</h1>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className={`text-sm font-medium hover:text-primary ${
                  location === link.href ? "text-primary" : "text-foreground/80"
                }`}>
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            <LanguageSelect />
            <ThemeToggle />
            
            {/* Cart Indicator (Only on menu page) */}
            {location === "/restaurant" && (
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartQuantity > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartQuantity}
                  </Badge>
                )}
              </Button>
            )}
            
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 mt-6">
                    {links.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <a className={`text-base font-medium ${
                          location === link.href ? "text-primary" : "text-foreground/80"
                        }`}>
                          {link.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
