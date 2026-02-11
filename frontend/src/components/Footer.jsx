const Footer = () => {
  return (
    <footer className="bg-ground-3 text-ground0 mt-16">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Top content */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 mb-8">
          <div>
            <h3 className="font-cormorant text-2xl font-semibold mb-2">
              Quai Antique
            </h3>
            <p className="opacity-90">
              Restaurant gastronomique à Chambéry
            </p>
          </div>

          <div>
            <h4 className="font-cormorant text-lg font-semibold mb-3">
              Horaires
            </h4>
            <p className="opacity-90">Mardi - Dimanche</p>
            <p className="opacity-90">
              Consultez notre menu pour plus d'informations
            </p>
          </div>

          <div>
            <h4 className="font-cormorant text-lg font-semibold mb-3">
              Contact
            </h4>
            <p className="opacity-90">Chambéry, Savoie</p>
            <p className="opacity-90">contact@quai-antique.fr</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-sm opacity-70">
            &copy; 2026 Quai Antique. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
