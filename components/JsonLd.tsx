// Renders a schema.org JSON-LD block as a script tag in server HTML, so
// crawlers that don't execute JavaScript (most AI crawlers) still see it.
// `data` can be a single schema object or an array to emit several blocks
// from one call site.
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
