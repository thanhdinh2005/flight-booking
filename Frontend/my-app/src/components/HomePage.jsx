import Hero from "../components/Hero";
import SearchPanel from "../components/Searchpanel";
import PopularFlights from "../components/Popularflights";
import { useOutletContext } from "react-router-dom";
import { useState } from "react";

export default function HomePage() {
  const { notify } = useOutletContext();
  const [activeTab, setActiveTab] = useState('muave');
  const [initialDestination, setInitialDestination] = useState(null);

  const handleSelectDestination = (destination) => {
    setActiveTab('muave');
    setInitialDestination(destination);
    // Scroll to SearchPanel
    document.querySelector('.search-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Hero />
      <div className="home-content">
        <SearchPanel 
          notify={notify} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          initialDestination={initialDestination}
        />
        <PopularFlights 
          notify={notify} 
          onSelectDestination={handleSelectDestination}
        />
      </div>
    </>
  );
}