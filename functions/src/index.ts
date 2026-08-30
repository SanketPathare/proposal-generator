import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

// Initialize Firebase Admin
admin.initializeApp();

// Set global options
setGlobalOptions({ 
  region: 'us-central1',
  maxInstances: 10 
});

// Types
interface GenerateProposalInput {
  purpose: string;
  clientName: string;
  projectDescription: string;
  services: string[];
  budget: string;
  timeline: string;
  additionalInstructions?: string;
}

interface GenerateSectionInput {
  sectionType: string;
  context: {
    purpose: string;
    clientName: string;
    projectDescription: string;
    services: string[];
    existingSections: any[];
  };
}

interface TransformTextInput {
  text: string;
  action: 'improve' | 'rewrite' | 'shorten' | 'expand' | 'professional' | 'simple' | 'fix_grammar';
}

interface CloudinarySignatureInput {
  folder: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

// Cloudinary configuration
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate a signed upload URL for Cloudinary
 */
export const getCloudinarySignature = onCall<CloudinarySignatureInput>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { folder, resourceType = 'image' } = request.data;
  const timestamp = Math.floor(Date.now() / 1000);
  
  const paramsToSign = {
    folder: `users/${request.auth.uid}/${folder}`,
    timestamp,
    resource_type: resourceType,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: paramsToSign.folder,
  };
});

/**
 * Delete a Cloudinary asset
 */
export const deleteCloudinaryAsset = onCall<{ publicId: string; resourceType?: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { publicId, resourceType = 'image' } = request.data;
  
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: result.result === 'ok' };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new HttpsError('internal', 'Failed to delete asset');
  }
});

// TODO: Add Gemini AI functions when API key is available
// export const generateFullProposal = onCall<GenerateProposalInput>(async (request) => { ... });
// export const generateSection = onCall<GenerateSectionInput>(async (request) => { ... });
// export const transformText = onCall<TransformTextInput>(async (request) => { ... });

/**
 * Track proposal view
 */
export const trackProposalView = onRequest(async (request, response) => {
  // CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  const { shareId } = request.body;
  
  if (!shareId) {
    response.status(400).json({ error: 'shareId is required' });
    return;
  }

  try {
    // Find proposal by shareId
    const proposalsRef = admin.firestore().collectionGroup('proposals');
    const snapshot = await proposalsRef.where('shareId', '==', shareId).limit(1).get();
    
    if (snapshot.empty) {
      response.status(404).json({ error: 'Proposal not found' });
      return;
    }

    const proposalDoc = snapshot.docs[0];
    const proposalData = proposalDoc.data();
    
    // Update view count and last viewed
    await proposalDoc.ref.update({
      viewCount: admin.firestore.FieldValue.increment(1),
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: proposalData.status === 'sent' ? 'viewed' : proposalData.status,
    });

    response.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle proposal accept/reject
 */
export const handleProposalResponse = onRequest(async (request, response) => {
  // CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  const { shareId, action } = request.body; // action: 'accept' | 'reject'
  
  if (!shareId || !action) {
    response.status(400).json({ error: 'shareId and action are required' });
    return;
  }

  if (!['accept', 'reject'].includes(action)) {
    response.status(400).json({ error: 'Invalid action' });
    return;
  }

  try {
    const proposalsRef = admin.firestore().collectionGroup('proposals');
    const snapshot = await proposalsRef.where('shareId', '==', shareId).limit(1).get();
    
    if (snapshot.empty) {
      response.status(404).json({ error: 'Proposal not found' });
      return;
    }

    const proposalDoc = snapshot.docs[0];
    
    const updateData: any = {
      status: action === 'accept' ? 'accepted' : 'rejected',
    };
    
    if (action === 'accept') {
      updateData.acceptedAt = admin.firestore.FieldValue.serverTimestamp();
    } else {
      updateData.rejectedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await proposalDoc.ref.update(updateData);

    response.json({ success: true });
  } catch (error) {
    console.error('Handle response error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});