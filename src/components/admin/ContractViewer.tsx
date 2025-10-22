'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Loader2, Eye, Calendar, User, Building2, Edit3, Save, X, Send } from 'lucide-react';
import type { Contract } from '@/types/contract';
import { toast } from 'react-hot-toast';

interface ContractViewerProps {
  contractId: string;
  showFullText?: boolean;
  onContractUpdate?: () => void;
}

export function ContractViewer({ contractId, showFullText = true, onContractUpdate }: ContractViewerProps) {
  const { db } = useFirebase();
  const { user } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      if (!db) return;

      try {
        setLoading(true);
        const contractRef = doc(db, 'contracts', contractId);
        const contractSnap = await getDoc(contractRef);

        if (!contractSnap.exists()) {
          throw new Error('Contratto non trovato');
        }

        setContract({ id: contractSnap.id, ...contractSnap.data() } as Contract);
      } catch (err: any) {
        console.error('Error fetching contract:', err);
        setError(err.message);
        toast.error('Errore nel caricamento del contratto');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, db]);

  const handleDownloadPDF = async () => {
    // TODO: Implementare generazione PDF
    toast.error('Generazione PDF non ancora implementata');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    setEditedText(contract?.generatedText || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText('');
  };

  const handleSaveEdit = async () => {
    if (!db || !contract) return;

    try {
      setIsSaving(true);
      const contractRef = doc(db, 'contracts', contractId);
      await updateDoc(contractRef, {
        generatedText: editedText,
        updatedAt: new Date(),
        status: 'DRAFT', // Rimane in bozza dopo modifica
      });

      setContract({ ...contract, generatedText: editedText });
      setIsEditing(false);
      toast.success('Contratto modificato con successo');

      if (onContractUpdate) {
        onContractUpdate();
      }
    } catch (err: any) {
      console.error('Error saving contract:', err);
      toast.error('Errore nel salvataggio delle modifiche');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNotifications = async (recipient: 'company' | 'professional' | 'both') => {
    if (!db || !contract) return;

    try {
      setIsSending(true);

      const response = await fetch('/api/contracts/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          recipient,
          adminUid: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'invio della notifica');
      }

      // Aggiorna lo stato del contratto
      const contractRef = doc(db, 'contracts', contractId);
      await updateDoc(contractRef, {
        status: 'PENDING_REVIEW',
        updatedAt: new Date(),
      });

      setContract({ ...contract, status: 'PENDING_REVIEW' });

      const recipientText =
        recipient === 'both' ? 'azienda e professionista' :
        recipient === 'company' ? 'azienda' : 'professionista';

      toast.success(`Bozza di contratto inviata a ${recipientText}`);

      if (onContractUpdate) {
        onContractUpdate();
      }
    } catch (err: any) {
      console.error('Error sending notification:', err);
      toast.error('Errore nell\'invio della notifica');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
        </CardContent>
      </Card>
    );
  }

  if (error || !contract) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-red-600">{error || 'Contratto non disponibile'}</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
    GENERATED: 'bg-gray-100 text-gray-700 border border-gray-200',
    PENDING_REVIEW: 'bg-[#008080] text-white',
    APPROVED: 'bg-gray-100 text-gray-700 border border-gray-200',
    REJECTED: 'bg-red-50 text-red-700 border border-red-200',
    ARCHIVED: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'Bozza',
    GENERATED: 'Generato',
    PENDING_REVIEW: 'In Revisione',
    APPROVED: 'Approvato',
    REJECTED: 'Rifiutato',
    ARCHIVED: 'Archiviato',
  };

  return (
    <div className="space-y-8">
      {/* Header con metadata */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#008080]" />
              <span className="break-words">Contratto di Collaborazione</span>
            </CardTitle>
            <Badge className={`${statusColors[contract.status]} whitespace-nowrap self-start sm:self-auto`}>
              {statusLabels[contract.status] || contract.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Info base */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Professionista</p>
              <p className="font-semibold text-sm mt-2">{contract.contractData.professional.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Azienda</p>
              <p className="font-semibold text-sm mt-2">{contract.contractData.company.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Generazione</p>
              <p className="font-semibold text-sm mt-2">
                {contract.generatedAt
                  ? new Date(contract.generatedAt.seconds * 1000).toLocaleDateString('it-IT')
                  : 'N/D'}
              </p>
            </div>
          </div>

          {/* Metadata AI */}
          <div className="bg-gray-50 p-4 rounded-md text-sm space-y-2 border border-gray-200">
            <p>
              <strong>Modello AI:</strong> {contract.aiModel}
            </p>
            <p>
              <strong>Versione Prompt:</strong> {contract.aiPromptVersion}
            </p>
            <p>
              <strong>Importo:</strong> <span className="font-mono tabular-nums">€{contract.contractData.payment.totalAmount.toLocaleString('it-IT')}</span>
            </p>
            <p>
              <strong>Durata:</strong> {contract.contractData.project.startDate} - {contract.contractData.project.endDate}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!isEditing && (
              <>
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm min-h-[40px] sm:min-h-[36px]"
                  disabled={contract.status === 'APPROVED' || contract.status === 'ARCHIVED'}
                >
                  <Edit3 className="h-4 w-4" />
                  Modifica
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm min-h-[40px] sm:min-h-[36px]"
                >
                  <Eye className="h-4 w-4" />
                  Stampa
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm min-h-[40px] sm:min-h-[36px]"
                >
                  <Download className="h-4 w-4" />
                  Scarica PDF
                </Button>
              </>
            )}

            {isEditing && (
              <>
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="flex items-center gap-2 bg-[#008080] hover:bg-[#006666] text-sm min-h-[40px] sm:min-h-[36px]"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salva Modifiche
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm min-h-[40px] sm:min-h-[36px]"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                  Annulla
                </Button>
              </>
            )}

            {!isEditing && (contract.status === 'DRAFT' || contract.status === 'GENERATED') && (
              <>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleSendNotifications('both')}
                    size="sm"
                    className="flex items-center gap-2 bg-[#008080] hover:bg-[#006666] text-sm min-h-[40px] sm:min-h-[36px] justify-center"
                    disabled={isSending}
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Invia ad Entrambi
                  </Button>
                  <Button
                    onClick={() => handleSendNotifications('company')}
                    variant="outline"
                    size="sm"
                    className="text-sm min-h-[40px] sm:min-h-[36px] justify-center"
                    disabled={isSending}
                  >
                    Invia Azienda
                  </Button>
                  <Button
                    onClick={() => handleSendNotifications('professional')}
                    variant="outline"
                    size="sm"
                    className="text-sm min-h-[40px] sm:min-h-[36px] justify-center"
                    disabled={isSending}
                  >
                    Invia Professionista
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Testo del contratto con layout professionale */}
      {showFullText && (
        <Card className="print:shadow-none border border-gray-200">
          <CardContent className="p-0">
            {/* Carta intestata BIMatch */}
            <div className="bg-[#008080] text-white px-4 sm:px-8 py-8 border-b-4 border-[#006666]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">BIMatch</h1>
                  <p className="text-sm mt-2">Piattaforma per professionisti BIM</p>
                </div>
                <div className="text-left sm:text-right text-sm">
                  <p>www.bimatch.it</p>
                  <p>info@bimatch.it</p>
                </div>
              </div>
            </div>

            {/* Contenuto del contratto */}
            {isEditing ? (
              <div className="p-4 sm:p-8">
                <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-md border border-blue-200">
                  <p className="font-semibold mb-2">Modalità Modifica HTML</p>
                  <p>Puoi modificare il testo del contratto. Usa i tag HTML per la formattazione se necessario.</p>
                </div>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full text-sm leading-relaxed resize-y"
                  rows={30}
                  style={{
                    fontFamily: 'Figtree, system-ui, sans-serif',
                    lineHeight: '1.8',
                    minHeight: '400px',
                    maxHeight: '600px',
                  }}
                />
              </div>
            ) : (
              <div className="p-8 sm:p-12">
                <style jsx>{`
                  .contract-body {
                    font-family: 'Figtree', system-ui, -apple-system, sans-serif;
                    color: #1a1a1a;
                    line-height: 1.8;
                  }

                  .contract-body .contract-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #008080;
                    text-align: center;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.025em;
                  }

                  .contract-body .contract-date {
                    text-align: center;
                    color: #666;
                    font-size: 0.95rem;
                    margin-bottom: 2rem;
                  }

                  .contract-body .contract-section {
                    margin-bottom: 2rem;
                  }

                  .contract-body .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #008080;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #e5e7eb;
                  }

                  .contract-body .section-content {
                    margin-left: 0;
                  }

                  .contract-body .section-content p {
                    margin-bottom: 1rem;
                    text-align: justify;
                  }

                  .contract-body .section-content ul {
                    margin: 1rem 0;
                    padding-left: 2rem;
                  }

                  .contract-body .section-content li {
                    margin-bottom: 0.5rem;
                  }

                  .contract-body .section-content strong {
                    font-weight: 600;
                    color: #000;
                  }

                  .contract-body .contract-signatures {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 3px solid #008080;
                  }

                  .contract-body .signatures-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 3rem;
                    margin-top: 2rem;
                  }

                  .contract-body .signature-block {
                    text-align: center;
                  }

                  .contract-body .signature-label {
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: #008080;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  }

                  .contract-body .signature-name {
                    font-weight: 600;
                    font-size: 1.125rem;
                    margin-bottom: 0.25rem;
                  }

                  .contract-body .signature-detail {
                    font-size: 0.875rem;
                    color: #666;
                    margin-bottom: 0.25rem;
                  }

                  .contract-body .signature-line {
                    width: 100%;
                    height: 60px;
                    border-bottom: 2px solid #333;
                    margin: 2rem 0 0.5rem 0;
                  }

                  .contract-body .signature-caption {
                    font-size: 0.75rem;
                    color: #999;
                    font-style: italic;
                  }

                  .contract-text-fallback {
                    font-family: 'Figtree', system-ui, sans-serif;
                    white-space: pre-wrap;
                    line-height: 1.8;
                    color: #1a1a1a;
                  }

                  @media print {
                    .contract-body, .contract-text-fallback {
                      font-size: 11pt;
                    }

                    .contract-body .contract-section {
                      page-break-inside: avoid;
                    }
                  }
                `}</style>
                {contract.generatedText.includes('<div') || contract.generatedText.includes('<section') ? (
                  <div
                    className="contract-body"
                    dangerouslySetInnerHTML={{ __html: contract.generatedText }}
                  />
                ) : (
                  <div className="contract-text-fallback">
                    {contract.generatedText}
                  </div>
                )}
              </div>
            )}

            {/* Footer con watermark */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-8 py-4 text-center text-sm text-gray-500 print:bg-white">
              <p>Documento generato da BIMatch - Piattaforma per professionisti BIM</p>
              <p className="mt-2">Generato il {contract.generatedAt ? new Date(contract.generatedAt.seconds * 1000).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/D'} con AI ({contract.aiModel})</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note admin (se presenti) */}
      {contract.adminNotes && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Note Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{contract.adminNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
