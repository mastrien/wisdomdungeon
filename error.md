## Error Type
Console Error

## Error Message
React has detected a change in the order of Hooks called by DungeonPage. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://react.dev/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useContext                 useContext
2. useContext                 useContext
3. useMemo                    useMemo
4. useContext                 useContext
5. useContext                 useContext
6. useState                   useState
7. useState                   useState
8. useState                   useState
9. useState                   useState
10. useState                  useState
11. useState                  useState
12. useState                  useState
13. useState                  useState
14. useState                  useState
15. useRef                    useRef
16. useEffect                 useEffect
17. useEffect                 useEffect
18. undefined                 useRef
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^



    at DungeonPage (src/app/dungeon/[id]/page.tsx:179:30)

## Code Frame
  177 |
  178 |   // Track previous level for level up toast
> 179 |   const prevLevelRef = useRef<number | null>(null);
      |                              ^
  180 |   useEffect(() => {
  181 |     if (profile && prevLevelRef.current !== null && profile.level > prevLevelRef.current) {
  182 |       showToast(`PARABÉNS! Você subiu para o nível ${profile.level}!`, "success");

Next.js version: 16.2.4 (Turbopack)



## Error Type
Runtime Error

## Error Message
Rendered more hooks than during the previous render.


    at DungeonPage (src/app/dungeon/[id]/page.tsx:179:30)

## Code Frame
  177 |
  178 |   // Track previous level for level up toast
> 179 |   const prevLevelRef = useRef<number | null>(null);
      |                              ^
  180 |   useEffect(() => {
  181 |     if (profile && prevLevelRef.current !== null && profile.level > prevLevelRef.current) {
  182 |       showToast(`PARABÉNS! Você subiu para o nível ${profile.level}!`, "success");

Next.js version: 16.2.4 (Turbopack)
