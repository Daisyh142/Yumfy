import CuisineSection from "./CuisineSection";
import PantrySearch from "./PantrySearch";

const Home = ({ onToggleFavorite, user, favorites }) => { 

  return(
    <div>
      <PantrySearch
        user={user}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />

      <CuisineSection
        title="Italian"
        cuisine="Italian" 
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />

      <CuisineSection
        title="Mexican"
        cuisine="Mexican" 
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />

      <CuisineSection
        title="Indian"
        cuisine="Indian"
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />

      <CuisineSection
        title="Asian"
        cuisine="Asian"
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />

      <CuisineSection
        title="Mediterranean"
        cuisine="Mediterranean"
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />

      <CuisineSection
        title="Middle Eastern"
        cuisine="Middle Eastern"
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />

      <CuisineSection
        title="Latin American"
        cuisine="Latin American"
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />

      <CuisineSection
        title="European"
        cuisine="European"
        onToggleFavorite={onToggleFavorite}
        user={user}
        favorites={favorites}
      />
    </div>
    );
};

export default Home;