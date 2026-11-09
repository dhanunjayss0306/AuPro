import { NextResponse } from 'next/server';
import {
  getAllApplications,
  addStudentApplication,
  updateApplicationStatus,
} from '../auth/account-registry';
import {
  checkRateLimit,
  getClientIp,
  sanitizeText,
  sanitizeEmail,
  sanitizeImageUrl,
  isAllowedOrigin,
  isRequestAuthorizedAsAdmin,
} from '../auth/security';

const DEFAULT_SERVICES = [
  { id: 'bonafide', name: 'Bonafide certificate', status: 'available' },
  { id: 'e-sign', name: 'E-signature certificate', status: 'available' },
  { id: 'fee-view', name: 'Fee view certificate', status: 'available' },
  { id: 'hall-ticket-bus', name: 'Hall ticket and bus pass endorsement', status: 'available' },
  { id: 'hostel-outpass', name: 'Hostel outpass', status: 'available' },
  { id: 'custom-request', name: 'Custom request', status: 'available' },
];

/**
 * GET /api/applications
 * Returns all submitted student applications and the service catalog.
 */
export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`get_apps:${ip}`, 60, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded.' },
        { status: 429 }
      );
    }

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
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { error: 'Forbidden: Request domain not authorized.' },
        { status: 403 }
      );
    }

    const ip = getClientIp(req);
    const limit = checkRateLimit(`post_apps:${ip}`, 15, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many application submissions. Please wait a minute.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

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
      documentUrl,
      documentName,
      letterContent,
    } = body;

    const cleanService = sanitizeText(serviceTitle, 100);
    if (!cleanService) {
      return NextResponse.json(
        { error: 'Application service title is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(studentEmail);

    const application = addStudentApplication({
      refId: sanitizeText(refId, 50) || undefined,
      studentName: sanitizeText(studentName, 100) || 'AU Student',
      studentEmail: cleanEmail || '',
      rollNo: sanitizeText(rollNo, 50) || 'Pending',
      serviceTitle: cleanService,
      purpose: sanitizeText(purpose, 500) || 'Verification',
      department: sanitizeText(department, 100) || 'AU Engineering',
      year: sanitizeText(year, 50) || '4th Year',
      status: 'pending',
      documentUrl: sanitizeImageUrl(documentUrl) || (typeof documentUrl === 'string' && documentUrl.startsWith('data:') ? documentUrl : undefined),
      documentName: sanitizeText(documentName, 120) || 'Supporting Document',
      letterContent: sanitizeText(letterContent, 3000),
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
 * Strictly checks that the requester has Head Administrator privileges.
 */
export async function PATCH(req: Request) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { error: 'Forbidden: Request domain not authorized.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      refId,
      status,
      adminEmail,
      appointmentDate,
      appointmentTime,
      appointmentVenue,
      requiredDocuments,
      verificationNote,
    } = body;

    const isAuthorized = isRequestAuthorizedAsAdmin(req, adminEmail);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the Head Administrator may approve or reject student applications.' },
        { status: 403 }
      );
    }

    if (!refId || !status) {
      return NextResponse.json(
        { error: 'Reference ID and target status are required.' },
        { status: 400 }
      );
    }

    const validStatus = ['pending', 'approved', 'rejected'].includes(status) ? status : null;
    if (!validStatus) {
      return NextResponse.json(
        { error: 'Invalid application status. Allowed: pending, approved, rejected.' },
        { status: 400 }
      );
    }

    const updated = updateApplicationStatus(refId, validStatus, {
      appointmentDate: sanitizeText(appointmentDate, 60),
      appointmentTime: sanitizeText(appointmentTime, 60),
      appointmentVenue: sanitizeText(appointmentVenue, 120),
      requiredDocuments: sanitizeText(requiredDocuments, 300),
      verificationNote: sanitizeText(verificationNote, 300),
    });

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
