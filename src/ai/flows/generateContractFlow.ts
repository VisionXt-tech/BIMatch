import { ai } from '../genkit';
import { z } from 'zod';
import { buildContractPrompt } from '../prompts/contractPrompt';
import type { ProfessionalProfile, CompanyProfile } from '@/types/auth';
import type { Project } from '@/types/project';
import type { ContractData } from '@/types/contract';

// Schema di input per il flow
const GenerateContractInputSchema = z.object({
  professional: z.object({
    uid: z.string(),
    email: z.string().nullable(),
    displayName: z.string().nullable(),
    role: z.literal('professional'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    location: z.string().optional(),
    bimSkills: z.array(z.string()).optional(),
    softwareProficiency: z.array(z.string()).optional(),
    experienceLevel: z.string().optional(),
  }),
  company: z.object({
    uid: z.string(),
    email: z.string().nullable(),
    displayName: z.string().nullable(),
    role: z.literal('company'),
    companyName: z.string().optional(),
    companyVat: z.string().optional(),
    companyLocation: z.string().optional(),
    industry: z.string().optional(),
  }),
  project: z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    requiredSkills: z.array(z.string()),
    requiredSoftware: z.array(z.string()),
    projectType: z.string(),
    duration: z.string().optional(),
    budgetRange: z.string().optional(),
    location: z.string(),
  }),
  contractData: z.object({
    professional: z.object({
      name: z.string(),
      piva: z.string(),
      fiscalCode: z.string(),
      taxRegime: z.enum(['ordinario', 'forfettario', 'semplificato']),
      address: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }),
    company: z.object({
      businessName: z.string(),
      piva: z.string(),
      address: z.string(),
      legalRepresentative: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }),
    project: z.object({
      title: z.string(),
      description: z.string(),
      deliverables: z.array(z.string()),
      duration: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      workMode: z.enum(['remoto', 'ibrido', 'presenza']),
      location: z.string().optional(),
    }),
    payment: z.object({
      totalAmount: z.number(),
      currency: z.literal('EUR'),
      paymentTerms: z.string(),
      milestones: z
        .array(
          z.object({
            phase: z.string(),
            percentage: z.number(),
            amount: z.number(),
            description: z.string().optional(),
          })
        )
        .optional(),
    }),
    specialConditions: z
      .object({
        ndaRequired: z.boolean().optional(),
        insuranceRequired: z.boolean().optional(),
        travelExpenses: z.boolean().optional(),
        equipmentProvided: z.boolean().optional(),
        additionalClauses: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

// Schema di output
const GenerateContractOutputSchema = z.object({
  contractText: z.string(),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    wordCount: z.number(),
    articleCount: z.number(),
  }),
});

export type GenerateContractInput = z.infer<typeof GenerateContractInputSchema>;
export type GenerateContractOutput = z.infer<typeof GenerateContractOutputSchema>;

// Flow Genkit
export const generateContractFlow = ai.defineFlow(
  {
    name: 'generateContract',
    inputSchema: GenerateContractInputSchema,
    outputSchema: GenerateContractOutputSchema,
  },
  async (input) => {
    const { professional, company, project, contractData } = input;

    // Costruisci il prompt
    const prompt = buildContractPrompt(
      professional as ProfessionalProfile,
      company as CompanyProfile,
      project as Project,
      contractData as ContractData
    );

    console.log('[generateContractFlow] Generating contract with Gemini...');
    console.log('[generateContractFlow] Professional:', professional.displayName);
    console.log('[generateContractFlow] Company:', company.companyName);
    console.log('[generateContractFlow] Project:', project.title);

    // Genera il contratto con Gemini
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: prompt,
      config: {
        temperature: 0.3, // Bassa temperatura per output più deterministico e formale
        maxOutputTokens: 8000, // Contratti possono essere lunghi
        topK: 20,
        topP: 0.8,
      },
    });

    const contractText = response.text;

    // Validazione basica del contratto
    validateContractContent(contractText);

    // Calcola metadata
    const wordCount = contractText.split(/\s+/).length;
    const articleCount = (contractText.match(/Art\.\s*\d+/g) || []).length;

    console.log('[generateContractFlow] Contract generated successfully');
    console.log('[generateContractFlow] Word count:', wordCount);
    console.log('[generateContractFlow] Article count:', articleCount);

    return {
      contractText,
      metadata: {
        model: 'gemini-2.0-flash',
        promptVersion: 'v1.0',
        generatedAt: new Date().toISOString(),
        wordCount,
        articleCount,
      },
    };
  }
);

// Funzione di validazione del contratto
function validateContractContent(text: string): void {
  const requiredElements = [
    { term: 'Partita IVA', error: 'Manca P.IVA' },
    { term: 'Codice Fiscale', error: 'Manca CF' },
    { term: 'corrispettivo', error: 'Manca importo' },
    { term: 'durata', error: 'Manca durata' },
    { term: 'recesso', error: 'Manca clausola recesso' },
    { term: 'GDPR', error: 'Manca trattamento dati' },
    { term: 'proprietà intellettuale', error: 'Manca clausola IP' },
    { term: 'firma', error: 'Manca sezione firme' },
    { term: 'Art.', error: 'Contratto non articolato' },
  ];

  const missing = requiredElements.filter(
    (el) => !text.toLowerCase().includes(el.term.toLowerCase())
  );

  if (missing.length > 0) {
    throw new Error(
      `Contratto generato incompleto: ${missing.map((m) => m.error).join(', ')}`
    );
  }

  // Valida struttura articoli
  const articleCount = (text.match(/Art\.\s*\d+/g) || []).length;
  if (articleCount < 10) {
    throw new Error(
      `Contratto troppo breve o mal strutturato: solo ${articleCount} articoli trovati (minimo 10)`
    );
  }

  // Valida lunghezza minima
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 1000) {
    throw new Error(
      `Contratto troppo breve: ${wordCount} parole (minimo 1000 richieste)`
    );
  }

  console.log('[validateContractContent] Contract validation passed');
}
