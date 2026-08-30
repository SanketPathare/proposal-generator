import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbInstance } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { shareId, action, clientSignName, clientEmail } = await request.json();

    if (!shareId || !action) {
      return NextResponse.json({ error: 'shareId and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    try {
      const db = getAdminDbInstance();

      // Look up userId + proposalId from the sharedProposals lookup table
      const sharedRef = db.collection('sharedProposals').doc(shareId);
      const sharedSnap = await sharedRef.get();

      if (sharedSnap.exists) {
        const { userId, proposalId } = sharedSnap.data()!;

        if (userId && proposalId) {
          const proposalRef = db.collection('users').doc(userId).collection('proposals').doc(proposalId);
          const proposalSnap = await proposalRef.get();

          if (proposalSnap.exists) {
            const updateData: Record<string, any> = {
              status: action === 'accept' ? 'accepted' : 'rejected',
            };

            if (action === 'accept') {
              updateData.acceptedAt = new Date();
              if (clientSignName) updateData.clientSignName = clientSignName;
              if (clientEmail) updateData.clientEmail = clientEmail;
            } else {
              updateData.rejectedAt = new Date();
            }

            await proposalRef.update(updateData);
          }
        }
      }
    } catch (adminErr) {
      console.warn('Admin DB update in respond route:', adminErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to handle proposal response:', error);
    return NextResponse.json({ success: true });
  }
}
