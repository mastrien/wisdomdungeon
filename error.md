## Error Type
Console AxiosError

## Error Message
Request failed with status code 403


    at async ProfilePage.useEffect.fetchProfile (src/app/profile/[username]/page.tsx:69:42)

## Code Frame
  67 |       setLoading(true);
  68 |       try {
> 69 |         const [profileRes, masteryRes] = await Promise.all([
     |                                          ^
  70 |           api.get(`/profile/${username}/`),
  71 |           api.get(`/mastery/?username=${username}`)
  72 |         ]);

Next.js version: 16.2.4 (Turbopack)
