interface Props {
  placeholder?: string
  defaultValue?: string
}

export function SearchBar({ placeholder = 'Buscar...', defaultValue = '' }: Props) {
  return (
    <form method="GET" className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-300">
        <IconSearch />
      </span>
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="h-9 pl-9 pr-3 text-sm bg-surface border border-border rounded-lg text-ink-700 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 w-56 transition-colors"
      />
    </form>
  )
}

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
