interface Props {
  href: string;
  children: React.ReactNode;
}

export function ButtonLink({ href, children }: Props) {
  return (
    <span className="not-prose inline-block my-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold no-underline hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
      >
        {children}
      </a>
    </span>
  );
}
