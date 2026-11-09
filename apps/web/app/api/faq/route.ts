const topics = [
  'College information',
  'Faculty and contacts',
  'Courses',
  'Applications',
  'Campus location',
];

export function GET() {
  return Response.json(
    { topics },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}
