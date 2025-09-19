import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-4 md:mb-8" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-2">
        <li>
          <Link
            href="/"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
        
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 md:mx-2" />
            {item.current ? (
              <span className="text-sm font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
