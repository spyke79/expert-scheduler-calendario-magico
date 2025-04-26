import { NavLink } from "react-router-dom";
import { Calendar, User, School, Book } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Calendar className="h-5 w-5" /> },
    { name: "Scuole", path: "/schools", icon: <School className="h-5 w-5" /> },
    { name: "Esperti", path: "/experts", icon: <User className="h-5 w-5" /> },
    { name: "Corsi", path: "/courses", icon: <Book className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Calendario Magico</h1>
      </div>
      <nav className="px-4 pb-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
