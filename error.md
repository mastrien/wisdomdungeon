## Error Type
Console Error

## Error Message
In HTML, <div> cannot be a descendant of <p>.
This will cause a hydration error.

  ...
    <RedirectErrorBoundary router={{...}}>
      <InnerLayoutRouter url="/dungeon/a..." tree={[...]} params={{id:"algebr..."}} cacheNode={{rsc:<Fragment>, ...}} ...>
        <SegmentViewNode type="page" pagePath="dungeon/[i...">
          <SegmentTrieNode>
          <ClientPageRoot Component={function DungeonPage} serverProvidedParams={{...}}>
            <DungeonPage params={Promise} searchParams={Promise}>
              <div className="min-h-scre...">
                <Header>
                <div className="p-4 md:p-8">
                  <div className="max-w-3xl ...">
                    <div>
                    <div className="bg-slate-9...">
                      <div>
                      <div className="p-8 md:p-12">
                        <div>
                        <div>
                        <div>
                        <div className="space-y-6 ...">
                          <div className="p-6 rounde...">
                            <CircleX>
                            <div>
                              <h3>
>                             <p className="text-sm opacity-80">
                                <MathRenderer tex="$10$" displayMode={false} className="font-bold">
>                                 <div className="inline-block max-w-full font-bold">
                          ...
                    ...
        ...
      ...



    at div (<anonymous>:null:null)
    at MathRenderer (src/components/MathRenderer.tsx:34:5)
    at DungeonPage (src/app/dungeon/[id]/page.tsx:291:46)

## Code Frame
  32 |
  33 |   return (
> 34 |     <div className={`inline-block max-w-full ${className}`}>
     |     ^
  35 |       {segments.map((seg, i) => (
  36 |         <Segment key={i} segment={seg} />
  37 |       ))}

Next.js version: 16.2.4 (Turbopack)
