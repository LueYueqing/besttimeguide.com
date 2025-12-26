'use client'

import Link from 'next/link'

interface TagLinkProps {
  tag: string
}

export default function TagLink({ tag }: TagLinkProps) {
  return (
    <Link
      href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={(e) => e.stopPropagation()}
      className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded hover:bg-primary-100 hover:text-primary-700 transition-colors"
    >
      {tag}
    </Link>
  )
}

