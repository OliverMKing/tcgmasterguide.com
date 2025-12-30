import Link from 'next/link'
import { notFound } from 'next/navigation'

const articles: Record<string, {
  title: string
  category: string
  date: string
  content: { type: 'heading' | 'paragraph' | 'list', text: string, items?: string[] }[]
}> = {
  'beginner-guide': {
    title: 'Beginner\'s Guide to Pokemon TCG',
    category: 'Beginner',
    date: 'December 29, 2024',
    content: [
      { type: 'heading', text: 'Getting Started' },
      { type: 'paragraph', text: 'Welcome to the world of Pokemon Trading Card Game! This guide will help you understand the basics and get you started on your TCG journey.' },
      { type: 'heading', text: 'Basic Card Types' },
      {
        type: 'list',
        text: 'There are three main types of cards in Pokemon TCG:',
        items: [
          'Pokemon Cards - The creatures you use to battle',
          'Trainer Cards - Support cards that provide various effects',
          'Energy Cards - Required to power your Pokemon\'s attacks'
        ]
      },
      { type: 'heading', text: 'How to Play' },
      { type: 'paragraph', text: 'Each player starts with a deck of 60 cards. You draw 7 cards to start, and must have at least one Basic Pokemon to begin. The goal is to knock out your opponent\'s Pokemon and take all 6 of your Prize cards.' },
      { type: 'heading', text: 'Building Your First Deck' },
      { type: 'paragraph', text: 'Start with a theme deck or build around a Pokemon you like. A good beginner deck typically includes 15-20 Pokemon, 25-30 Trainer cards, and 12-15 Energy cards.' },
    ]
  },
  'deck-building': {
    title: 'Deck Building Strategies',
    category: 'Strategy',
    date: 'December 28, 2024',
    content: [
      { type: 'heading', text: 'Core Principles' },
      { type: 'paragraph', text: 'Building a competitive deck requires understanding the meta, card synergies, and proper resource management.' },
      { type: 'heading', text: 'Deck Ratios' },
      {
        type: 'list',
        text: 'Optimal deck composition:',
        items: [
          '12-16 Pokemon cards with clear evolution lines',
          '30-35 Trainer cards including draw support and search cards',
          '10-15 Energy cards based on your deck\'s energy requirements'
        ]
      },
      { type: 'heading', text: 'Consistency is Key' },
      { type: 'paragraph', text: 'Include 4 copies of your essential cards. Use search cards like Ultra Ball and evolution support like Rare Candy to ensure you can execute your strategy consistently.' },
    ]
  },
  'meta-analysis': {
    title: 'Current Meta Analysis',
    category: 'Meta',
    date: 'December 27, 2024',
    content: [
      { type: 'heading', text: 'Top Tier Decks' },
      { type: 'paragraph', text: 'The current competitive meta is diverse with several strong archetypes competing for the top spots.' },
      { type: 'heading', text: 'Dominant Strategies' },
      {
        type: 'list',
        text: 'Current meta leaders:',
        items: [
          'Charizard ex - High damage output with energy acceleration',
          'Gardevoir ex - Control deck with energy manipulation',
          'Lost Zone variants - Utilizing the Lost Zone mechanic for powerful effects'
        ]
      },
      { type: 'heading', text: 'Counter Strategies' },
      { type: 'paragraph', text: 'Understanding the meta allows you to tech your deck appropriately. Consider running cards like Path to the Peak to counter ability-dependent decks, or Boss\'s Orders to control the opponent\'s active Pokemon.' },
    ]
  },
  'card-values': {
    title: 'Understanding Card Values',
    category: 'Collection',
    date: 'December 26, 2024',
    content: [
      { type: 'heading', text: 'Factors Affecting Value' },
      { type: 'paragraph', text: 'Card values are determined by multiple factors including rarity, condition, competitive viability, and collector demand.' },
      { type: 'heading', text: 'Grading and Condition' },
      { type: 'paragraph', text: 'Cards in mint condition are worth significantly more than played copies. Professional grading services like PSA and CGC provide authentication and condition assessment.' },
      { type: 'heading', text: 'Market Trends' },
      {
        type: 'list',
        text: 'Key value indicators:',
        items: [
          'Tournament performance driving competitive card prices',
          'Nostalgic sets maintaining long-term collector value',
          'New set releases affecting singles market prices'
        ]
      },
    ]
  },
  'tournament-prep': {
    title: 'Tournament Preparation',
    category: 'Competitive',
    date: 'December 25, 2024',
    content: [
      { type: 'heading', text: 'Before the Tournament' },
      { type: 'paragraph', text: 'Proper preparation is essential for tournament success. Practice your deck extensively and understand all possible matchups.' },
      { type: 'heading', text: 'What to Bring' },
      {
        type: 'list',
        text: 'Tournament essentials:',
        items: [
          'Deck registered and sleeved with opaque sleeves',
          'Pen and paper for tracking life and damage',
          'Dice or damage counters',
          'Water and snacks for long tournament days'
        ]
      },
      { type: 'heading', text: 'Mental Preparation' },
      { type: 'paragraph', text: 'Stay focused and calm during matches. Take time between rounds to rest and review your plays. Learn from losses and stay positive.' },
    ]
  },
  'trading-tips': {
    title: 'Trading Tips and Tricks',
    category: 'Trading',
    date: 'December 24, 2024',
    content: [
      { type: 'heading', text: 'Fair Trading Practices' },
      { type: 'paragraph', text: 'Always research current card values before making trades. Use reliable price guides and recent sales data to ensure fair exchanges.' },
      { type: 'heading', text: 'Building Relationships' },
      { type: 'paragraph', text: 'Join local Pokemon TCG communities and attend regular events. Building a network of traders helps you find cards you need and moves cards you don\'t.' },
      { type: 'heading', text: 'Trading Strategies' },
      {
        type: 'list',
        text: 'Maximize your trades:',
        items: [
          'Trade into competitive staples that hold value',
          'Be patient - don\'t rush into unfavorable trades',
          'Keep extras of popular commons for trading opportunities',
          'Always protect your cards in trades with proper sleeves'
        ]
      },
    ]
  },
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug]

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-purple-700 hover:text-purple-600 mb-8"
        >
          <span className="mr-2">←</span>
          Back to Home
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-semibold text-purple-700 bg-surface-secondary px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-sm text-text-secondary">{article.date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            {article.title}
          </h1>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg border border-border p-8 space-y-6">
            {article.content.map((section, index) => {
              if (section.type === 'heading') {
                return (
                  <h2 key={index} className="text-2xl font-bold text-text-primary mt-8 first:mt-0">
                    {section.text}
                  </h2>
                )
              }
              if (section.type === 'paragraph') {
                return (
                  <p key={index} className="text-text-secondary leading-relaxed">
                    {section.text}
                  </p>
                )
              }
              if (section.type === 'list' && section.items) {
                return (
                  <div key={index}>
                    <p className="text-text-secondary mb-2">{section.text}</p>
                    <ul className="list-disc list-inside space-y-2 text-text-secondary ml-4">
                      {section.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        {/* Related Decks CTA */}
        <div className="mt-12 text-center bg-surface-secondary rounded-lg p-8">
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            Want to learn more?
          </h3>
          <Link
            href="/"
            className="inline-block bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Browse More Decks
          </Link>
        </div>
      </article>
    </main>
  )
}
