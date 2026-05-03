## Error Type
Console AxiosError

## Error Message
Request failed with status code 403


    at async fetchProfile (src/context/AuthContext.tsx:39:24)
    at async AuthProvider.useEffect.unsubscribe [as next] (src/context/AuthContext.tsx:56:9)

## Code Frame
  37 |   const fetchProfile = async () => {
  38 |     try {
> 39 |       const response = await api.get("/profile/");
     |                        ^
  40 |       setProfile(response.data);
  41 |     } catch (error) {
  42 |       console.error("Erro ao carregar perfil:", error);

Next.js version: 16.2.4 (Turbopack)
