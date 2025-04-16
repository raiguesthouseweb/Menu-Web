import Logo from "@/components/logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 py-6 border-t dark:border-gray-700">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo className="h-5 w-5 mr-2" />
            <span className="font-semibold">Rai Guest House</span>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Rai Guest House. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
