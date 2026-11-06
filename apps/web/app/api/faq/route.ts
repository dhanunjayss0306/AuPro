const topics = [
  'College information',
  'Faculty and contacts',
  'Courses',
  'Applications',
  'Campus location',
];

export function GET() {
  return Response.json({ topics });
}
