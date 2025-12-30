export default function AboutPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-8">
          About TCG Master Guide
        </h1>

        <div className="bg-white rounded-lg border border-border p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Our Mission
            </h2>
            <p className="text-text-secondary leading-relaxed">
              TCG Master Guide is dedicated to helping Pokemon Trading Card Game players
              of all skill levels improve their game, build better decks, and stay
              informed about the competitive meta. Whether you're just starting out or
              competing at the highest levels, we provide the resources you need to
              succeed.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              What We Offer
            </h2>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start">
                <span className="text-purple-700 mr-2">•</span>
                <span>Comprehensive guides for beginners and advanced players</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-700 mr-2">•</span>
                <span>Up-to-date meta analysis and deck building strategies</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-700 mr-2">•</span>
                <span>Tournament preparation tips and competitive insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-700 mr-2">•</span>
                <span>Card value information and collection management advice</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-700 mr-2">•</span>
                <span>Trading tips to help you build your dream collection</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Join Our Community
            </h2>
            <p className="text-text-secondary leading-relaxed">
              TCG Master Guide is built by passionate Pokemon TCG players for the
              community. We're constantly updating our content with the latest
              strategies, meta shifts, and helpful guides. Check back regularly for new
              articles and resources to help you become a TCG master!
            </p>
          </div>
        </div>

        <div
          className="mt-8 rounded-lg p-8 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)' }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Ready to level up your game?
          </h2>
          <p className="mb-6 opacity-90">
            Start exploring our guides and become the trainer you've always wanted to be
          </p>
        </div>
      </div>
    </main>
  )
}
