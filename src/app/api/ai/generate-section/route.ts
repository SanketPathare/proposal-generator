import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionType, context } = body;

    if (!sectionType) {
      return NextResponse.json({ error: 'Section type is required' }, { status: 400 });
    }

    // AI stub - returns structured placeholder content
    // Replace with real Gemini/OpenAI integration when ready
    const generatedContent = generatePlaceholderContent(sectionType, context);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      sectionType,
    });
  } catch (error) {
    console.error('AI section generation error:', error);
    return NextResponse.json({ error: 'Failed to generate section' }, { status: 500 });
  }
}

function generatePlaceholderContent(sectionType: string, context?: { purpose?: string; clientName?: string; projectDescription?: string; services?: string[] }): string {
  const projectName = context?.purpose || 'this project';
  const clientName = context?.clientName || 'the client';

  const templates: Record<string, string> = {
    introduction: `<p>We are pleased to present this proposal for <strong>${projectName}</strong>. Our team brings extensive experience in delivering high-quality solutions that drive measurable results.</p>
<p>Through a thorough understanding of ${clientName}'s objectives, we have developed a strategic approach that balances innovation with practical execution. Our methodology focuses on delivering maximum value within the agreed timeline and budget.</p>
<p>This proposal outlines our comprehensive approach, detailed scope of work, timeline, and investment required to bring this project to successful completion.</p>`,
    scope: `<p>The scope of work for <strong>${projectName}</strong> includes the following key areas:</p>
<ul>
<li><strong>Discovery & Planning</strong> — Requirements gathering, stakeholder interviews, and project roadmap development</li>
<li><strong>Design & Architecture</strong> — System design, wireframes, and technical architecture planning</li>
<li><strong>Development & Implementation</strong> — Core feature development, integration, and API configuration</li>
<li><strong>Quality Assurance</strong> — Comprehensive testing, performance optimization, and bug resolution</li>
<li><strong>Deployment & Launch</strong> — Production deployment, DNS configuration, and go-live support</li>
<li><strong>Post-Launch Support</strong> — 30-day warranty period with bug fixes and performance monitoring</li>
</ul>`,
    overview: `<p><strong>${projectName}</strong> aims to deliver a comprehensive solution for ${clientName} that addresses key business challenges and positions the organization for sustainable growth.</p>
<p>Our approach combines industry best practices with innovative methodologies to ensure deliverables exceed expectations. We will work closely with your team throughout the engagement to ensure alignment and transparency at every stage.</p>
<p>The project will be executed in agile sprints with regular check-ins, demos, and iterative feedback loops to ensure the final deliverable perfectly matches your vision.</p>`,
    features: `<p>Key features and technical specifications for <strong>${projectName}</strong>:</p>
<ul>
<li>Responsive design optimized for desktop, tablet, and mobile devices</li>
<li>SEO-optimized architecture with semantic HTML and structured data</li>
<li>Performance targets: &lt;3s load time, 95+ Lighthouse score</li>
<li>Analytics integration with event tracking and conversion monitoring</li>
<li>Content management capabilities for easy updates</li>
<li>Security best practices including HTTPS, CSP headers, and input validation</li>
</ul>`,
    deliverables: `<p>The following deliverables will be provided as part of <strong>${projectName}</strong>:</p>
<ul>
<li>Complete project documentation and technical specifications</li>
<li>Design mockups and component library (Figma)</li>
<li>Source code with comprehensive README and setup instructions</li>
<li>Deployment scripts and CI/CD pipeline configuration</li>
<li>User guide and admin documentation</li>
<li>30-day post-launch support and bug resolution</li>
</ul>`,
    terms: `<p><strong>Intellectual Property:</strong> Upon full payment, all deliverables and intellectual property rights transfer to ${clientName}.</p>
<p><strong>Confidentiality:</strong> Both parties agree to maintain strict confidentiality regarding project details, business information, and proprietary data.</p>
<p><strong>Termination:</strong> Either party may terminate this agreement with 14 days written notice. Work completed to date will be invoiced and payable within the standard payment terms.</p>
<p><strong>Limitation of Liability:</strong> Total liability shall not exceed the total project fee. Neither party shall be liable for indirect, incidental, or consequential damages.</p>
<p><strong>Force Majeure:</strong> Neither party shall be held liable for delays caused by circumstances beyond reasonable control.</p>`,
    payment_terms: `<p><strong>Payment Schedule for ${projectName}:</strong></p>
<ul>
<li><strong>50% deposit</strong> — Due upon signing this agreement to commence work</li>
<li><strong>25% milestone payment</strong> — Due upon delivery of core features for review</li>
<li><strong>25% final payment</strong> — Due upon project completion and client acceptance</li>
</ul>
<p>All invoices are payable within 14 days of issuance. Late payments may incur a 1.5% monthly service charge. Work may be paused if payments are overdue by more than 30 days.</p>`,
    conclusion: `<p>We are excited about the opportunity to partner with ${clientName} on <strong>${projectName}</strong>. Our team is confident in our ability to deliver exceptional results that exceed your expectations.</p>
<p><strong>Next Steps:</strong></p>
<ul>
<li>Review this proposal and share any questions or feedback</li>
<li>Schedule a call to discuss any adjustments or clarifications</li>
<li>Sign the agreement and submit the initial deposit</li>
<li>Kick off the project within 5 business days of agreement</li>
</ul>
<p>We look forward to working together and creating something remarkable. Please don't hesitate to reach out if you have any questions.</p>`,
    about_me: `<p>With over <strong>8+ years of experience</strong> in the industry, we have delivered 100+ successful projects for clients ranging from ambitious startups to established enterprises.</p>
<p>Our team specializes in creating high-impact digital solutions that combine strategic thinking with technical excellence. We pride ourselves on transparent communication, on-time delivery, and measurable results.</p>
<p><strong>Key Highlights:</strong></p>
<ul>
<li>100+ projects delivered across 15+ industries</li>
<li>98% client satisfaction rate</li>
<li>Average project ROI of 340%</li>
<li>Expertise in modern frameworks and cloud infrastructure</li>
</ul>`,
    requirements: `<p>Based on our discovery sessions with ${clientName}, the following key requirements have been identified for <strong>${projectName}</strong>:</p>
<ul>
<li><strong>Business Requirements:</strong> Clear objectives, measurable KPIs, and target audience definition</li>
<li><strong>Technical Requirements:</strong> Platform compatibility, performance benchmarks, and integration needs</li>
<li><strong>Design Requirements:</strong> Brand alignment, accessibility standards, and responsive layouts</li>
<li><strong>Content Requirements:</strong> Copy structure, media assets, and content migration plan</li>
</ul>`,
    testimonials: `<p><strong>"Working with this team was a game-changer for our business."</strong></p>
<p>— Sarah Johnson, CEO at TechCorp</p>
<hr>
<p><strong>"Delivered on time, on budget, and beyond our expectations."</strong></p>
<p>— Michael Chen, Founder at StartupXYZ</p>
<hr>
<p><strong>"Professional, responsive, and truly invested in our success."</strong></p>
<p>— Emily Rodriguez, VP Marketing at BrandCo</p>`,
    contact: `<p><strong>Get in touch to discuss your project:</strong></p>
<ul>
<li><strong>Email:</strong> hello@yourstudio.com</li>
<li><strong>Phone:</strong> +1 (555) 123-4567</li>
<li><strong>Website:</strong> www.yourstudio.com</li>
<li><strong>LinkedIn:</strong> linkedin.com/in/yourprofile</li>
</ul>
<p>We typically respond within 24 hours during business days (Mon-Fri, 9AM-6PM EST).</p>`,
    cover: '',
    heading: '',
    paragraph: `<p>This section provides detailed information about <strong>${projectName}</strong>. Our approach ensures that every aspect of the project is carefully planned and executed to deliver maximum value for ${clientName}.</p>
<p>We leverage industry best practices and proven methodologies to ensure consistency, quality, and timely delivery across all project milestones.</p>`,
  };

  return templates[sectionType] || `<p>Content for the ${sectionType} section will be generated here. This section supports the overall narrative of <strong>${projectName}</strong> and is tailored to ${clientName}'s specific needs and objectives.</p>`;
}
