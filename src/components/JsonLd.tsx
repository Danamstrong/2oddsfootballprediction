type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

/**
 * Renders a Schema.org JSON-LD <script>. Safe: the payload is our own data,
 * serialized with JSON.stringify and `<` escaped so it can't break out of the
 * script tag.
 */
export function JsonLd({ data, id }: { data: JsonLdData; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default JsonLd;
