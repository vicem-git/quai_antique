import { Link } from 'react-router-dom'

const Home = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const heroImageUrl = `${API_BASE}/uploads/gallery/1768647815618_pexels-anastasia-ilina-makarova-140436704-10858715.jpg`;

  return (
    <div className="font-montserrat">
      {/* Hero */}
      <section
        className="relative flex items-center justify-center text-center min-h-125 px-4 py-24 md:py-32"
        style={{
          backgroundImage: `linear-gradient(rgba(15,13,11,0.5), rgba(15,13,11,0.5)), url('${heroImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="z-10 max-w-3xl">
          <h1 className="font-cormorant text-2xl md:text-5xl font-semibold text-ground-2">
            Quai Antique
          </h1>
          <p className="text-lg md:text-xl font-medium text-ground-1 mt-4">
            Le Chef Arnaud Michant aime passionnément les produits - et producteurs - de la Savoie.
          </p>
          <p className="mt-4 text-base md:text-lg text-ground-1">
            Cette cuisine se caractérise à ce jour à la fois par sa simplicité et l'utilisation de produits locaux,
            à base en grande partie de charcuteries et fromages de montagne savoyarde.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link to="/user/reservations" className="inline-block bg-accent-2 text-ground-1 font-semibold px-6 py-2 rounded-lg transition hover:bg-accent-0">
                Réserver une table
            </Link>
            <Link to="/menu" className="inline-block bg-accent-2 text-ground-1 font-semibold px-6 py-2 rounded-lg transition hover:bg-accent-0">
                Découvrir la carte
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-ground0 px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-cormorant text-4xl text-primary3 mb-8">Une Expérience Gastronomique</h2>
          <p className="text-lg text-primary2 mb-4">
            Le Quai Antique est installé à Chambéry et propose au déjeuner comme au dîner
            une expérience gastronomique, à travers une cuisine sans artifice.
          </p>
          <p className="text-lg text-primary2">
            Plus encore que ses deux autres restaurants, Arnaud Michant le voit comme une
            promesse d'un voyage dans son univers culinaire.
          </p>
        </div>
      </section>

      {/* Hours / Reservation */}
      <section className="px-4 py-20 text-center bg-ground0">
        <div className="max-w-xl mx-auto p-12 rounded-xl bg-transparent text-primary3">
          <h2 className="font-cormorant text-4xl mb-6">Horaires d'ouverture</h2>
          <p className="text-xl font-medium mb-1">Ouvert du mardi au dimanche</p>
          <p className="text-lg opacity-90 mb-6">Service du midi et du soir</p>
          <Link
            to="/user/reservations"
            className="inline-block text-accent-1 font-playwrite text-5xl font-bold rounded transform -rotate-3 hover:scale-105 transition"
          >
            réservez !
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
