import Hero from "../components/Hero";
import SearchPanel from "../components/Searchpanel";
import PopularFlights from "../components/Popularflights";
import { useOutletContext } from "react-router-dom";

export default function HomePage() {
  const { notify } = useOutletContext();

  return (
    <>
      <Hero />
      <div className="home-content">
        <SearchPanel notify={notify} />
        <PopularFlights notify={notify} />
      </div>
    </>
  );
}