import { useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HandPlatter, 
  MapPin, 
  Clock
} from "lucide-react";

export default function Home() {
  const { language } = useLanguage();
  
  // Update page title
  useEffect(() => {
    document.title = "Rai Guest House";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="p-8 rounded-full bg-primary/10 mb-6">
            <HandPlatter className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Rai Guest House
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience comfort and convenience during your stay in Ujjain.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="overflow-hidden transition-transform hover:scale-105">
            <CardContent className="p-8 flex flex-col items-center">
              <HandPlatter className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Order Food</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                Enjoy delicious meals delivered directly to your room.
              </p>
              <Link href="/restaurant">
                <Button className="w-full">View Menu</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden transition-transform hover:scale-105">
            <CardContent className="p-8 flex flex-col items-center">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Explore Ujjain</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                Discover tourist attractions and sacred places in Ujjain.
              </p>
              <Link href="/ujjain">
                <Button className="w-full">View Places</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-12 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Track Your Order</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Already placed an order? Check its status here.
            </p>
            <Link href="/order-status">
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Check Order Status
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
