import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purpose, clientName, services, budget, timeline, instructions } = body;

    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 });
    }

    // AI is optional - this is a stub for future Gemini integration
    // Returns a placeholder response that the user can edit
    const sections = [
      {
        id: crypto.randomUUID(),
        type: 'cover',
        title: 'Cover Page',
        content: { title: `Proposal for ${clientName || 'Your Project'}`, subtitle: purpose },
        order: 0,
      },
      {
        id: crypto.randomUUID(),
        type: 'introduction',
        title: 'Introduction',
        content: `Thank you for the opportunity to present this proposal. ${purpose}\n\nWe understand your requirements and are confident in our ability to deliver exceptional results.`,
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        type: 'scope',
        title: 'Scope of Work',
        content: services || 'Based on our discussion, the scope of work includes the following key areas:\n\n- Analysis and planning\n- Design and development\n- Testing and quality assurance\n- Deployment and launch\n- Post-launch support',
        order: 2,
      },
      {
        id: crypto.randomUUID(),
        type: 'timeline',
        title: 'Project Timeline',
        content: timeline || 'The estimated timeline for this project is 4-6 weeks from the date of commencement.',
        order: 3,
      },
      {
        id: crypto.randomUUID(),
        type: 'pricing',
        title: 'Pricing',
        content: null,
        order: 4,
      },
      {
        id: crypto.randomUUID(),
        type: 'terms',
        title: 'Terms & Conditions',
        content: 'Standard terms and conditions apply. Payment is due according to the agreed payment schedule.',
        order: 5,
      },
      {
        id: crypto.randomUUID(),
        type: 'conclusion',
        title: 'Conclusion',
        content: 'We look forward to working with you on this project. Please don\'t hesitate to reach out if you have any questions.',
        order: 6,
      },
    ];

    return NextResponse.json({
      success: true,
      sections,
      title: `Proposal for ${clientName || 'Your Project'}`,
      purpose,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 });
  }
}