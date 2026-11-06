const applications = [
  { id: 'bonafide', name: 'Bonafide certificate', status: 'available' },
  { id: 'fees', name: 'Fee-related request', status: 'available' },
  { id: 'hall-ticket', name: 'Hall ticket', status: 'available' },
  { id: 'other', name: 'Other application', status: 'admin-managed' },
];

export function GET() {
  return Response.json({ applications });
}
