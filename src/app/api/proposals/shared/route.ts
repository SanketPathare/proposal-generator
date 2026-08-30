import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbInstance } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { shareId } = await request.json();

    if (!shareId) {
      return NextResponse.json({ error: 'shareId is required' }, { status: 400 });
    }

    let db;
    try {
      db = getAdminDbInstance();
    } catch (adminInitErr) {
      console.error('Firebase Admin SDK not configured:', adminInitErr);
      return NextResponse.json(
        { error: 'server_misconfigured', message: 'Server is not configured. Please contact the owner.' },
        { status: 503 }
      );
    }

    const proposalsRef = db.collectionGroup('proposals');
    const snapshot = await proposalsRef.where('shareId', '==', shareId).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'not_found', message: 'Proposal not found or link has expired.' },
        { status: 404 }
      );
    }

    const proposalDoc = snapshot.docs[0];
    const proposalData = proposalDoc.data();

    // Update view count and status (non-critical)
    try {
      await proposalDoc.ref.update({
        viewCount: (proposalData.viewCount || 0) + 1,
        lastViewedAt: new Date(),
        status: proposalData.status === 'sent' ? 'viewed' : proposalData.status,
      });
    } catch {
      // Ignore — view count update is not critical
    }

    return NextResponse.json({
      proposal: {
        ...proposalData,
        id: proposalDoc.id,
        createdAt: proposalData.createdAt?.toDate?.() || proposalData.createdAt || new Date(),
        updatedAt: proposalData.updatedAt?.toDate?.() || proposalData.updatedAt || new Date(),
        acceptedAt: proposalData.acceptedAt?.toDate?.() || proposalData.acceptedAt || null,
        rejectedAt: proposalData.rejectedAt?.toDate?.() || proposalData.rejectedAt || null,
        lastViewedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to load shared proposal:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}