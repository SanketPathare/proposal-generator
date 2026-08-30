import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbInstance } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { shareId, action } = await request.json();

    if (!shareId || !action) {
      return NextResponse.json({ error: 'shareId and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const db = getAdminDbInstance();

    const proposalsRef = db.collectionGroup('proposals');
    const snapshot = await proposalsRef.where('shareId', '==', shareId).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposalDoc = snapshot.docs[0];

    const updateData: Record<string, any> = {
      status: action === 'accept' ? 'accepted' : 'rejected',
    };

    if (action === 'accept') {
      updateData.acceptedAt = new Date();
    } else {
      updateData.rejectedAt = new Date();
    }

    await proposalDoc.ref.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to handle proposal response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}