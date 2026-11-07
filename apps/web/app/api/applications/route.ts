import { NextResponse } from 'next/server';
import {
  getAllApplications,
  addStudentApplication,
  updateApplicationStatus,
} from '../auth/account-registry';

const DEFAULT_SERVICES = [
  { id: 'bonafide', name: 'Bonafide certificate', status: 'available' },
  { id: 'fees', name: 'Fee-related request', status: 'available' },
  { id: 'hall-ticket', name: 'Hall ticket duplicate', status: 'available' },
  { id: 'migration', name: 'Migration certificate', status: 'available' },
  { id: 'custodian', name: 'Original certificate custodian', status: 'available' },
  { id: 'other', name: 'Other academic application', status: 'admin-managed' },
];

/**
 * GET /api/applications
 * Returns all submitted student applications and the service catalog.
 */
export async function GET() {
  try {
    const list = getAllApplications();
    return NextResponse.json({
      success: true,
      count: list.length,
      applications: list,
      catalog: DEFAULT_SERVICES,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to retrieve applications.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Submits a new student certificate or service application.
 * Triggers a real-time notification and activity audit log for the Head Administrator.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentName,
      studentEmail,
      rollNo,
      serviceTitle,
      purpose,
      department,
      year,
      refId,
    } = body;

    if (!serviceTitle) {
      return NextResponse.json(
        { error: 'Application service title is required.' },
        { status: 400 }
      );
    }

    const application = addStudentApplication({
      refId,
      studentName: studentName || 'AU Student',
      studentEmail: studentEmail || '',
      rollNo: rollNo || 'Pending',
      serviceTitle,
      purpose: purpose || 'Verification',
      department: department || 'AU Engineering',
      year: year || '4th Year',
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. Notified Head Administrator.',
      application,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error submitting application.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications
 * Updates an application's status (e.g. approved, rejected) by the Head Administrator.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { refId, status } = body;

    if (!refId || !status) {
      return NextResponse.json(
        { error: 'Reference ID and target status are required.' },
        { status: 400 }
      );
    }

    const updated = updateApplicationStatus(refId, status);
    if (!updated) {
      return NextResponse.json(
        { error: 'Application not found with the given Reference ID.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Application ${refId} updated to ${status}.`,
      applications: getAllApplications(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error updating application status.' },
      { status: 500 }
    );
  }
}
