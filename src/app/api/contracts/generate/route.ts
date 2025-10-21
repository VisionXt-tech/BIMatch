import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { generateContractFlow } from '@/ai/flows/generateContractFlow';
import type { ProfessionalProfile, CompanyProfile } from '@/types/auth';
import type { Project, ProjectApplication } from '@/types/project';
import type { ContractData } from '@/types/contract';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  // Use Firebase Admin SDK (bypasses security rules)
  const db = getAdminDb();

  try {
    const body = await request.json();
    const { applicationId, jobId, contractData, adminUid } = body;

    // Validazione input
    if (!applicationId || !jobId || !contractData || !adminUid) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, jobId, contractData, adminUid' },
        { status: 400 }
      );
    }

    console.log('[API /contracts/generate] Starting contract generation');
    console.log('[API /contracts/generate] Application:', applicationId);
    console.log('[API /contracts/generate] Job:', jobId);
    console.log('[API /contracts/generate] Admin:', adminUid);

    // TODO: Verifica che adminUid sia effettivamente un admin
    // Per ora assumiamo che la chiamata sia autenticata correttamente

    // 1. Recupera dati dell'application da Firestore
    // Prova prima nella struttura jobs/{id}/applications, poi in projectApplications
    let applicationRef = db.collection('jobs').doc(jobId).collection('applications').doc(applicationId);
    let applicationSnap = await applicationRef.get();

    if (!applicationSnap.exists) {
      console.log('[API /contracts/generate] Application not found in jobs subcollection, trying projectApplications...');
      applicationRef = db.collection('projectApplications').doc(applicationId);
      applicationSnap = await applicationRef.get();
    }

    if (!applicationSnap.exists) {
      return NextResponse.json({ error: 'Application not found in both collections' }, { status: 404 });
    }

    const application = applicationSnap.data() as ProjectApplication;

    // Verifica che l'application sia in stato colloquio
    const validStatuses = [
      'colloquio_proposto',
      'colloquio_accettato_prof',
      'colloquio_ripianificato_prof',
    ];
    if (!validStatuses.includes(application.status)) {
      return NextResponse.json(
        {
          error: `Application must be in interview stage. Current status: ${application.status}`,
        },
        { status: 400 }
      );
    }

    // 2. Recupera dati del progetto
    // Prova prima in jobs, poi in projects
    let projectRef = db.collection('jobs').doc(jobId);
    let projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      console.log('[API /contracts/generate] Project not found in jobs collection, trying projects...');
      projectRef = db.collection('projects').doc(jobId);
      projectSnap = await projectRef.get();
    }

    if (!projectSnap.exists) {
      return NextResponse.json({ error: 'Project not found in both jobs and projects collections' }, { status: 404 });
    }

    const project = { id: projectSnap.id, ...projectSnap.data() } as Project;

    // 3. Recupera profili professionista e azienda
    const professionalRef = db.collection('users').doc(application.professionalId);
    const companyRef = db.collection('users').doc(application.companyId);

    const [professionalSnap, companySnap] = await Promise.all([
      professionalRef.get(),
      companyRef.get(),
    ]);

    if (!professionalSnap.exists || !companySnap.exists) {
      return NextResponse.json(
        { error: 'Professional or Company profile not found' },
        { status: 404 }
      );
    }

    const professional = professionalSnap.data() as ProfessionalProfile;
    const company = companySnap.data() as CompanyProfile;

    // 4. Chiama il Genkit flow per generare il contratto
    console.log('[API /contracts/generate] Calling Genkit flow...');

    const result = await generateContractFlow({
      professional: {
        uid: professional.uid,
        email: professional.email,
        displayName: professional.displayName,
        role: 'professional' as const,
        firstName: professional.firstName,
        lastName: professional.lastName,
        location: professional.location,
        bimSkills: professional.bimSkills,
        softwareProficiency: professional.softwareProficiency,
        experienceLevel: professional.experienceLevel,
      },
      company: {
        uid: company.uid,
        email: company.email,
        displayName: company.displayName,
        role: 'company' as const,
        companyName: company.companyName,
        companyVat: company.companyVat,
        companyLocation: company.companyLocation,
        industry: company.industry,
      },
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        requiredSkills: project.requiredSkills,
        requiredSoftware: project.requiredSoftware,
        projectType: project.projectType,
        duration: project.duration,
        budgetRange: project.budgetRange,
        location: project.location,
      },
      contractData: contractData as ContractData,
    });

    console.log('[API /contracts/generate] Contract generated successfully');
    console.log(
      '[API /contracts/generate] Metadata:',
      JSON.stringify(result.metadata, null, 2)
    );

    // 5. Salva il contratto in Firestore
    const contractRef = await db.collection('contracts').add({
      jobId,
      applicationId,
      companyId: application.companyId,
      professionalId: application.professionalId,
      status: 'GENERATED',
      generatedText: result.contractText,
      generatedAt: FieldValue.serverTimestamp(),
      generatedBy: adminUid,
      aiModel: result.metadata.model,
      aiPromptVersion: result.metadata.promptVersion,
      contractData: contractData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log('[API /contracts/generate] Contract saved to Firestore:', contractRef.id);

    // 6. Aggiorna l'application con il riferimento al contratto
    await applicationRef.update({
      contractId: contractRef.id,
      contractStatus: 'generated',
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log('[API /contracts/generate] Application updated with contract reference');

    // 7. Ritorna il risultato
    return NextResponse.json({
      success: true,
      contractId: contractRef.id,
      contractText: result.contractText,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error('[API /contracts/generate] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate contract',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
