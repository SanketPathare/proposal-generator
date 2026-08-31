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

    // Step 1: Look up userId + proposalId from the sharedProposals lookup table
    const sharedRef = db.collection('sharedProposals').doc(shareId);
    const sharedSnap = await sharedRef.get();

    if (!sharedSnap.exists) {
      return NextResponse.json(
        { error: 'not_found', message: 'Proposal not found or link has expired.' },
        { status: 404 }
      );
    }

    const { userId, proposalId } = sharedSnap.data()!;

    if (!userId || !proposalId) {
      return NextResponse.json(
        { error: 'not_found', message: 'Proposal link is invalid.' },
        { status: 404 }
      );
    }

    // Step 2: Read the proposal directly from the user's subcollection
    const proposalRef = db.collection('users').doc(userId).collection('proposals').doc(proposalId);
    const proposalSnap = await proposalRef.get();

    if (!proposalSnap.exists) {
      return NextResponse.json(
        { error: 'not_found', message: 'Proposal not found or has been removed.' },
        { status: 404 }
      );
    }

    const proposalData = proposalSnap.data()!;

    // Reject draft proposals — drafts are not publicly viewable
    if (proposalData.status === 'draft') {
      return NextResponse.json(
        { error: 'not_found', message: 'This proposal is not yet published.' },
        { status: 404 }
      );
    }

    // Update view count and status (non-critical)
    try {
      await proposalRef.update({
        viewCount: (proposalData.viewCount || 0) + 1,
        lastViewedAt: new Date(),
        status: (proposalData.status === 'sent' || proposalData.status === 'viewed') ? 'live' : proposalData.status,
      });
    } catch {
      // Ignore — view count update is not critical
    }

    // Serialize acceptors array — convert any nested Firestore Timestamps
    const rawAcceptors: any[] = proposalData.acceptors || [];
    const acceptors = rawAcceptors.map((a: any) => ({
      ...a,
      acceptedAt: a.acceptedAt?.toDate?.() || a.acceptedAt || null,
    }));

    return NextResponse.json({
      proposal: {
        ...proposalData,
        id: proposalSnap.id,
        acceptors,
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
