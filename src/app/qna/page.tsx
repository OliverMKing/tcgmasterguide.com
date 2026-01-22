import type { Metadata } from 'next'
import QAContent from './QAContent'

export const metadata: Metadata = {
  title: 'Q&A',
  description:
    'Ask questions and get answers from Grant. Discuss deck strategies, card choices, and competitive Pokemon TCG.',
  openGraph: {
    title: 'Q&A - TCG Master Guide',
    description:
      'Ask questions and get answers from Grant.',
  },
}

export default function QAPage() {
  return <QAContent />
}
