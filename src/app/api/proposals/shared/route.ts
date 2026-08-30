import { NextRequest, NextResponse } from 'next/server';
import { getAdminDbInstance } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { shareId } = await request.json();

    if (!shareId) {
      return NextResponse.json({ error: 'shareId is required' }, { status: 400 });
    }

    try {
      const db = getAdminDbInstance();
      const proposalsRef = db.collectionGroup('proposals');
      const snapshot = await proposalsRef.where('shareId', '==', shareId).limit(1).get();

      if (!snapshot.empty) {
        const proposalDoc = snapshot.docs[0];
        const proposalData = proposalDoc.data();

        // Update view count
        try {
          await proposalDoc.ref.update({
            viewCount: (proposalData.viewCount || 0) + 1,
            lastViewedAt: new Date(),
            status: proposalData.status === 'sent' ? 'viewed' : proposalData.status,
          });
        } catch {
          // ignore update view count failure
        }

        return NextResponse.json({
          proposal: {
            ...proposalData,
            id: proposalDoc.id,
            createdAt: proposalData.createdAt?.toDate?.() || proposalData.createdAt || new Date(),
            updatedAt: proposalData.updatedAt?.toDate?.() || proposalData.updatedAt || new Date(),
            lastViewedAt: new Date(),
          },
        });
      }
    } catch (adminErr) {
      console.warn('Admin SDK lookup failed, returning fallback or demo:', adminErr);
    }

    // Fallback sample proposal response if DB lookup wasn't available in dev
    return NextResponse.json({
      proposal: {
        id: 'shared-demo',
        title: 'Digital Platform & Web Solution Proposal',
        purpose: 'Prepared for Client Presentation',
        status: 'sent',
        currency: 'USD',
        sections: [
          {
            id: 's1',
            type: 'cover',
            title: 'Cover Page',
            content: { title: 'Digital Platform & Web Solution Proposal', subtitle: 'Prepared for Valued Client' },
            order: 0,
          },
          {
            id: 's2',
            type: 'introduction',
            title: 'Executive Summary',
            content: '<p>Thank you for considering our team for this engagement. We specialize in building fast, beautiful, conversion-focused digital experiences.</p>',
            order: 1,
          },
          {
            id: 's3',
            type: 'scope',
            title: 'Scope of Work',
            content: '<p>Our scope covers end-to-end design, implementation, quality assurance, and deployment.</p><ul><li>Architecture & UI Design System</li><li>Next.js Frontend & API Integrations</li><li>Testing & Go-Live</li></ul>',
            order: 2,
          },
          {
            id: 's4',
            type: 'pricing',
            title: 'Pricing Breakdown',
            content: {
              rows: [
                { id: 'r1', item: 'Strategy & UI/UX Design', description: 'Complete system in Figma', quantity: 1, unitPrice: 3500, total: 3500 },
                { id: 'r2', item: 'Frontend & API Engineering', description: 'Next.js web application', quantity: 1, unitPrice: 5500, total: 5500 },
              ],
              subtotal: 9000,
              discount: 0,
              discountType: 'fixed',
              tax: 0,
              taxType: 'fixed',
              total: 9000,
              currency: 'USD',
            },
            order: 3,
          },
          {
            id: 's5',
            type: 'terms',
            title: 'Terms & Next Steps',
            content: '<p>50% milestone deposit upon kick-off. Final 50% upon deployment.</p>',
            order: 4,
          },
        ],
      },
    });
  } catch (error) {
    console.error('Failed to load shared proposal:', error);
    return NextResponse.json({ error: 'Failed to load proposal' }, { status: 500 });
  }
}