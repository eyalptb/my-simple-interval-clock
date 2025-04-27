
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
          <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Oops!
          </p>
        </div>
        
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist
        </p>
        
        <div className="mt-8">
          <Link to="/">
            <Button 
              variant="default" 
              className="transition-all duration-200 hover:scale-105"
            >
              <Home className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
