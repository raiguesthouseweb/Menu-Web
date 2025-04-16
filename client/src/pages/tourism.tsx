import { useEffect, useState } from "react";
import { useTourismPlaces } from "@/hooks/use-api";
import { TOURISM_TAGS } from "@/config/constants";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/lib/translations";

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Badge 
} from "@/components/ui/badge";
import {
  Button
} from "@/components/ui/button";
import { 
  MapPin, 
  Loader2,
  ExternalLink 
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Tourism() {
  const { tourismPlaces, loading, error } = useTourismPlaces();
  const [selectedTag, setSelectedTag] = useState("All");
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  // Update page title
  useEffect(() => {
    document.title = "Explore Ujjain | Rai Guest House";
  }, []);

  // Filter places based on selected tag
  const filteredPlaces = selectedTag === "All" 
    ? tourismPlaces 
    : tourismPlaces.filter(place => place.tags.includes(selectedTag));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('tourism.title')}</h2>
      
      {/* Filter Tags */}
      <Tabs 
        defaultValue="All" 
        value={selectedTag} 
        onValueChange={setSelectedTag}
        className="mb-8"
      >
        <TabsList className="w-full sm:w-auto flex flex-wrap">
          {TOURISM_TAGS.map(tag => (
            <TabsTrigger key={tag} value={tag}>
              {tag === "All" ? t('tourism.filter.all') : 
               tag === "Religious" ? t('tourism.filter.religious') :
               tag === "Heritage" ? t('tourism.filter.heritage') :
               tag === "Romantic" ? t('tourism.filter.romantic') :
               tag === "Educational" ? t('tourism.filter.educational') : tag}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Loading Tourism Information
            </h3>
            <p className="text-red-700 dark:text-red-400">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Tourism Places Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {t('tourism.noResults')}
              </p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <Card key={place.id} className="overflow-hidden flex flex-col h-full">
                <CardContent className="p-6 flex-grow flex flex-col">
                  <h3 className="font-bold text-xl mb-2">
                    {place.title === "Mahakaleshwar Temple" 
                      ? t('tourism.places.mahakaleshwar.title')
                      : place.title === "Kal Bhairav Temple" 
                        ? t('tourism.places.kalbhairav.title')
                        : place.title === "Ram Ghat" 
                          ? t('tourism.places.ramghat.title')
                          : place.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {place.title === "Mahakaleshwar Temple" 
                      ? t('tourism.places.mahakaleshwar.description')
                      : place.title === "Kal Bhairav Temple" 
                        ? t('tourism.places.kalbhairav.description')
                        : place.title === "Ram Ghat" 
                          ? t('tourism.places.ramghat.description')
                          : place.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{t('tourism.distance')}: {place.distance}</span>
                    
                    <div className="ml-auto flex flex-wrap gap-1">
                      {place.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => window.open(place.mapsLink, "_blank")}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('tourism.viewMap')}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
