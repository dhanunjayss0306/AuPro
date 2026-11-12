import { NextResponse } from 'next/server';
import {
  getAllApplications,
  addStudentApplication,
  updateApplicationStatus,
  getApplicationByRefId,
} from '../auth/account-registry';
import {
  checkRateLimit,
  getClientIp,
  sanitizeText,
  sanitizeEmail,
  sanitizeImageUrl,
  isAllowedOrigin,
  isRequestAuthorizedAsAdmin,
  isRequestAuthorizedAsHod,
  normalizeDepartmentKey,
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
 * Optional ?department= filters to one department (e.g. the HOD's own).
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

    const department = new URL(req.url).searchParams.get('department');
    let list = getAllApplications();
    if (department) {
      const key = normalizeDepartmentKey(department);
      list = list.filter((a) => normalizeDepartmentKey(a.department) === key);
    }
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
 * Head Administrator path (unchanged): pending / approved / rejected plus
 * appointment fields. Approving notifies the HOD of the student's
 * department; the response carries hodPendingCount and hodBatchAlert.
 *
 * HOD path: an HOD of the application's department may ONLY
 * (a) post a signing date/time/venue, which sets status to 'time_posted'
 *     (only from 'approved'), and
 * (b) mark an application 'signed' (only from 'approved' or 'time_posted').
 * An HOD may NOT approve or reject. Anything else is a 403.
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
      hodEmail,
      appointmentDate,
      appointmentTime,
      appointmentVenue,
      requiredDocuments,
      verificationNote,
    } = body;

    if (!refId || !status) {
      return NextResponse.json(
        { error: 'Reference ID and target status are required.' },
        { status: 400 }
      );
    }

    // ---- Head Administrator path (unchanged semantics) ----
    if (isRequestAuthorizedAsAdmin(req, adminEmail)) {
      const validStatus = ['pending', 'approved', 'rejected'].includes(status) ? status : null;
      if (!validStatus) {
        return NextResponse.json(
          { error: 'Invalid application status. Allowed: pending, approved, rejected.' },
          { status: 400 }
        );
      }

      const result = updateApplicationStatus(refId, validStatus, {
        appointmentDate: sanitizeText(appointmentDate, 60),
        appointmentTime: sanitizeText(appointmentTime, 60),
        appointmentVenue: sanitizeText(appointmentVenue, 120),
        requiredDocuments: sanitizeText(requiredDocuments, 300),
        verificationNote: sanitizeText(verificationNote, 300),
      }, { email: adminEmail, role: 'head_admin' });

      if (!result.updated) {
        return NextResponse.json(
          { error: 'Application not found with the given Reference ID.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Application ${refId} updated to ${status}.`,
        hodPendingCount: result.hodPendingCount,
        hodBatchAlert: result.hodBatchAlert,
        applications: getAllApplications(),
      });
    }

    // ---- HOD path: only time_posted and signed, own department only ----
    const app = getApplicationByRefId(refId);
    if (!app) {
      return NextResponse.json(
        { error: 'Application not found with the given Reference ID.' },
        { status: 404 }
      );
    }

    if (!isRequestAuthorizedAsHod(req, hodEmail, app.department)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the HOD of this department may post a signing time or mark an application signed.' },
        { status: 403 }
      );
    }

    if (status === 'time_posted') {
      if (app.status !== 'approved') {
        return NextResponse.json(
          { error: 'Only a verified (approved) application can receive a signing time.' },
          { status: 409 }
        );
      }
      const cleanDate = sanitizeText(appointmentDate, 60);
      const cleanTime = sanitizeText(appointmentTime, 60);
      const cleanVenue = sanitizeText(appointmentVenue, 120);
      if (!cleanDate || !cleanTime) {
        return NextResponse.json(
          { error: 'Signing date and time are required.' },
          { status: 400 }
        );
      }
      const result = updateApplicationStatus(refId, 'time_posted', {
        appointmentDate: cleanDate,
        appointmentTime: cleanTime,
        appointmentVenue: cleanVenue,
        requiredDocuments: sanitizeText(requiredDocuments, 300),
        verificationNote: sanitizeText(verificationNote, 300),
      }, { email: hodEmail, role: 'hod' });
      if (!result.updated) {
        return NextResponse.json(
          { error: 'Application not found with the given Reference ID.' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Signing time posted for application ${refId}. Students can now come in person to get it signed.`,
        hodPendingCount: result.hodPendingCount,
        hodBatchAlert: result.hodBatchAlert,
        applications: getAllApplications(),
      });
    }

    if (status === 'signed') {
      if (app.status !== 'approved' && app.status !== 'time_posted') {
        return NextResponse.json(
          { error: 'Only an approved or time-posted application can be marked signed.' },
          { status: 409 }
        );
      }
      const result = updateApplicationStatus(refId, 'signed', {
        requiredDocuments: sanitizeText(requiredDocuments, 300),
        verificationNote: sanitizeText(verificationNote, 300),
      }, { email: hodEmail, role: 'hod' });
      if (!result.updated) {
        return NextResponse.json(
          { error: 'Application not found with the given Reference ID.' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Application ${refId} marked signed and collected.`,
        hodPendingCount: result.hodPendingCount,
        hodBatchAlert: result.hodBatchAlert,
        applications: getAllApplications(),
      });
    }

    return NextResponse.json(
      { error: 'Unauthorized: HODs may only post a signing time or mark an application signed. Approval and rejection are done by the Head Administrator.' },
      { status: 403 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error updating application status.' },
      { status: 500 }
    );
  }
}
