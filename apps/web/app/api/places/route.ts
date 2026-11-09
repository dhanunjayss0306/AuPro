const places = [
  { id: 'sample-cse', name: 'Computer Science Department', category: 'department', status: 'sample' },
];

export function GET() {
  return Response.json(
    { places, notice: 'Sample data only until verified campus data is imported.' },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}
