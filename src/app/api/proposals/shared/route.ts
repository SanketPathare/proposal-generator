import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbInstance } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { shareId } = await request.json();

    if (!shareId) {
      return NextResponse.json({ error: 'shareId is required' }, { status: 400 });
    }

    const db = getAdminDbInstance();

    // Search for proposal with this shareId across all users
    const proposalsRef = db.collectionGroup('proposals');
    const snapshot = await proposalsRef.where('shareId', '==', shareId).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposalDoc = snapshot.docs[0];
    const proposalData = proposalDoc.data();

    // Update view count
    await proposalDoc.ref.update({
      viewCount: (proposalData.viewCount || 0) + 1,
      lastViewedAt: new Date(),
      status: proposalData.status === 'sent' ? 'viewed' : proposalData.status,
    });

    return NextResponse.json({
      proposal: {
        ...proposalData,
        id: proposalDoc.id,
        createdAt: proposalData.createdAt?.toDate?.() || proposalData.createdAt,
        updatedAt: proposalData.updatedAt?.toDate?.() || proposalData.updatedAt,
        lastViewedAt: proposalData.lastViewedAt?.toDate?.() || proposalData.lastViewedAt,
      },
    });
  } catch (error) {
    console.error('Failed to load shared proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}