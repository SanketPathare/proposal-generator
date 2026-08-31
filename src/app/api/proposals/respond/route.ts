import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbInstance } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId, action, clientSignName, clientEmail, clientMobile, clientMessage } = body;

    if (!shareId || !action) {
      return NextResponse.json({ error: 'shareId and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject', 'undo_accept'].includes(action)) {
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
          const proposalRef = db
            .collection('users')
            .doc(userId)
            .collection('proposals')
            .doc(proposalId);
          const proposalSnap = await proposalRef.get();

          if (proposalSnap.exists) {
            const proposalData = proposalSnap.data()!;

            if (action === 'accept') {
              const newAcceptor = {
                id: Date.now().toString(36) + Math.random().toString(36).substring(2, 10),
                clientSignName: clientSignName || '',
                clientEmail: clientEmail || '',
                clientMobile: clientMobile || '',
                clientMessage: clientMessage || '',
                acceptedAt: new Date(),
              };

              await proposalRef.update({
                status: 'accepted',
                acceptors: FieldValue.arrayUnion(newAcceptor),
                // keep a legacy flat field for backward compat
                clientSignName: clientSignName || proposalData.clientSignName || '',
                clientEmail: clientEmail || proposalData.clientEmail || '',
                acceptedAt: new Date(),
              });
            } else if (action === 'undo_accept') {
              const currentAcceptors: any[] = proposalData.acceptors || [];
              const updatedAcceptors = currentAcceptors.filter(
                (a: any) =>
                  !(a.clientEmail === clientEmail && a.clientSignName === clientSignName)
              );

              const newStatus = updatedAcceptors.length > 0 ? 'accepted' : 'viewed';
              await proposalRef.update({
                acceptors: updatedAcceptors,
                status: newStatus,
              });
            } else {
              // reject
              await proposalRef.update({
                status: 'rejected',
                rejectedAt: new Date(),
              });
            }
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
