// Nested layout: inherits <html><body> from app/layout.tsx.
// Sets the locale in context for server components in this segment.
export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
