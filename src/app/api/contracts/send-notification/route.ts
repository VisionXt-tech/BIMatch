import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Contract } from '@/types/contract';
import type { UserNotification } from '@/types/notification';

export async function POST(request: NextRequest) {
  try {
    console.log('[API /contracts/send-notification] Starting notification send');

    const body = await request.json();
    const { contractId, recipient, adminUid } = body;

    if (!contractId || !recipient || !adminUid) {
      return NextResponse.json(
        { error: 'Missing required fields: contractId, recipient, adminUid' },
        { status: 400 }
      );
    }

    console.log('[API /contracts/send-notification] Contract:', contractId);
    console.log('[API /contracts/send-notification] Recipient:', recipient);

    const db = getAdminDb();

    // Recupera il contratto
    const contractRef = db.collection('contracts').doc(contractId);
    const contractSnap = await contractRef.get();

    if (!contractSnap.exists) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const contract = { id: contractSnap.id, ...contractSnap.data() } as Contract;

    // Crea le notifiche
    const notifications: Array<Omit<UserNotification, 'id'>> = [];
    const now = new Date();

    if (recipient === 'company' || recipient === 'both') {
      notifications.push({
        userId: contract.companyId,
        type: 'CONTRACT_DRAFT_SENT',
        title: 'Bozza di contratto disponibile',
        message: `È disponibile una bozza di contratto per il progetto con ${contract.contractData.professional.name}. Rivedi il documento e fornisci il tuo feedback.`,
        isRead: false,
        createdAt: now as any,
        linkTo: `/dashboard/admin/contracts?contractId=${contractId}`,
        contractId: contract.id || contractId,
        professionalName: contract.contractData.professional.name,
        projectTitle: contract.contractData.project.title,
        amount: contract.contractData.payment.totalAmount,
      });
    }

    if (recipient === 'professional' || recipient === 'both') {
      notifications.push({
        userId: contract.professionalId,
        type: 'CONTRACT_DRAFT_SENT',
        title: 'Bozza di contratto disponibile',
        message: `È disponibile una bozza di contratto per il progetto "${contract.contractData.project.title}" con ${contract.contractData.company.businessName}. Rivedi il documento e fornisci il tuo feedback.`,
        isRead: false,
        createdAt: now as any,
        linkTo: `/dashboard/professional/contracts?contractId=${contractId}`,
        contractId: contract.id || contractId,
        companyName: contract.contractData.company.businessName,
        projectTitle: contract.contractData.project.title,
        amount: contract.contractData.payment.totalAmount,
      });
    }

    // Salva le notifiche in Firestore
    const notificationPromises = notifications.map((notification) =>
      db.collection('notifications').add(notification)
    );

    await Promise.all(notificationPromises);

    console.log('[API /contracts/send-notification] Notifications sent successfully');
    console.log('[API /contracts/send-notification] Number of notifications:', notifications.length);

    return NextResponse.json({
      success: true,
      notificationsSent: notifications.length,
      recipients: recipient === 'both' ? ['company', 'professional'] : [recipient],
    });
  } catch (error: any) {
    console.error('[API /contracts/send-notification] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
