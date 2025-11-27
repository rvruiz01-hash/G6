import { useTheme } from "../../context/ThemeContext";
import sunIcon from "../../assets/images/theme/sun.svg";
import moonIcon from "../../assets/images/theme/moon.svg";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {/* Sol (modo claro) */}
      <div className="hidden dark:block">
        <img src={sunIcon} alt="Tema Claro" />
      </div>

      {/* Luna animada (modo oscuro) */}
      <div className="dark:hidden">
        <img src={moonIcon} alt="Tema Claro" />
      </div>
    </button>
  );
};
