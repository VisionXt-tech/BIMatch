'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { UserProfile, ProfessionalProfile, CompanyProfile } from '@/types/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, Building, Mail, Calendar, MapPin, Phone, Edit, Trash2, Save, X, Activity, BarChart2, Briefcase, HandHeart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export default function UserDetailModal({ user, isOpen, onClose, onUserUpdated }: UserDetailModalProps) {
  const { db } = useFirebase();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [userApplications, setUserApplications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user || !db) return;

    try {
      // Fetch user's projects (if company)
      if (user.role === 'company') {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('companyId', '==', user.uid)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserProjects(projects);
      }

      // Fetch user's applications (if professional)
      if (user.role === 'professional') {
        const applicationsQuery = query(
          collection(db, 'projectApplications'),
          where('professionalId', '==', user.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserApplications(applications);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSave = async () => {
    if (!editedUser || !db) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', editedUser.uid);
      await updateDoc(userRef, {
        ...editedUser,
        updatedAt: new Date()
      });

      toast({
        title: "Utente aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      });

      setIsEditing(false);
      onUserUpdated();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'utente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !db) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      
      toast({
        title: "Utente eliminato",
        description: "L'utente è stato eliminato con successo.",
      });

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'utente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (!user || !editedUser) return null;

  const isProfessional = user.role === 'professional';
  const isCompany = user.role === 'company';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
                  {isProfessional && <User className="h-6 w-6 text-blue-600" />}
                  {isCompany && <Building className="h-6 w-6 text-green-600" />}
                  {(user.role as any) === 'admin' && <User className="h-6 w-6 text-red-600" />}
                </div>
                <div className="space-y-2">
                      {(user.role as any) === 'admin' && <User className="h-6 w-6 text-red-600" />}
                  <DialogTitle className="text-xl font-semibold">
                    {isProfessional 
                      ? `${(user as ProfessionalProfile).firstName} ${(user as ProfessionalProfile).lastName}`
                      : (user as CompanyProfile).companyName || user.displayName
                    }
                  </DialogTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant={isProfessional ? 'secondary' : (user.role as any) === 'admin' ? 'destructive' : 'default'} className="font-medium">
                      {user.role === 'professional' && <User className="mr-1 h-3 w-3" />}
                      {user.role === 'company' && <Building className="mr-1 h-3 w-3" />}
                      {user.role === 'professional' ? 'Professionista' : user.role === 'company' ? 'Azienda' : 'Amministratore'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Registrato il {user.createdAt?.toDate?.()?.toLocaleDateString('it-IT') || 'N/D'}
                    </div>
                  </div>
                  <DialogDescription className="text-sm">
                    {user.email}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-1" /> Modifica
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Elimina
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-1" /> Annulla
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-1" /> Salva
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="profile" className="w-full h-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profilo
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Attività
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Statistiche
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <Card className="shadow-sm">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informazioni Personali
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {isEditing ? (
                            <Input
                              id="email"
                                value={editedUser.email || ''}
                              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                              className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                            />
                          ) : (
                            <span className="text-sm">{user.email}</span>
                          )}
                        </div>
                      </div>

                      {isProfessional && (
                        <>
                          <div className="space-y-3">
                            <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">Nome</Label>
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              {isEditing ? (
                                <Input
                                  id="firstName"
                                  value={(editedUser as ProfessionalProfile).firstName || ''}
                                  onChange={(e) => setEditedUser({ 
                                    ...editedUser, 
                                    firstName: e.target.value 
                                  } as ProfessionalProfile)}
                                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                                />
                              ) : (
                                <span className="text-sm">{(user as ProfessionalProfile).firstName}</span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">Cognome</Label>
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              {isEditing ? (
                                <Input
                                  id="lastName"
                                  value={(editedUser as ProfessionalProfile).lastName || ''}
                                  onChange={(e) => setEditedUser({ 
                                    ...editedUser, 
                                    lastName: e.target.value 
                                  } as ProfessionalProfile)}
                                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                                />
                              ) : (
                                <span className="text-sm">{(user as ProfessionalProfile).lastName}</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {isCompany && (
                        <div className="space-y-3">
                          <Label htmlFor="companyName" className="text-sm font-medium text-muted-foreground">Nome Azienda</Label>
                          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {isEditing ? (
                              <Input
                                id="companyName"
                                value={(editedUser as CompanyProfile).companyName || ''}
                                onChange={(e) => setEditedUser({ 
                                  ...editedUser, 
                                  companyName: e.target.value 
                                } as CompanyProfile)}
                                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                              />
                            ) : (
                              <span className="text-sm">{(user as CompanyProfile).companyName}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">Ruolo</Label>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                          {isEditing ? (
                            <Select
                              value={editedUser.role}
                              onValueChange={(value) => setEditedUser({ ...editedUser, role: value as any } as any)}
                            >
                              <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">Professionista</SelectItem>
                                <SelectItem value="company">Azienda</SelectItem>
                                <SelectItem value="admin">Amministratore</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={isProfessional ? 'secondary' : (user.role as any) === 'admin' ? 'destructive' : 'default'}>
                              {(user.role as any) === 'professional' ? 'Professionista' : (user.role as any) === 'company' ? 'Azienda' : 'Amministratore'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-sm font-medium text-muted-foreground">Bio/Descrizione</Label>
                      <div className="p-3 border rounded-lg bg-muted/20">
                        {isEditing ? (
                          <Textarea
                            id="bio"
                            value={(editedUser as any).bio || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value } as any)}
                            rows={3}
                            className="border-0 bg-transparent p-0 resize-none focus-visible:ring-0"
                            placeholder="Inserisci una descrizione..."
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground min-h-[60px]">
                            {(user as any).bio || 'Nessuna descrizione disponibile'}
                          </p>
                        )}
                      </div>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-6">
                {isCompany && (
                  <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Progetti Pubblicati ({userProjects.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {userProjects.length > 0 ? (
                        <div className="space-y-4">
                          {userProjects.map((project) => (
                            <div key={project.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 hover:shadow-md transition-shadow">
                              <h4 className="font-semibold text-lg mb-2">{project.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                              <div className="flex items-center gap-6 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Budget:</span>
                                  <span className="text-green-600 font-semibold">€{project.budget}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Scadenza: {project.deadline?.toDate?.()?.toLocaleDateString('it-IT') || 'Non specificata'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Nessun progetto pubblicato</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {isProfessional && (
                  <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30">
                      <CardTitle className="flex items-center gap-2">
                        <HandHeart className="h-5 w-5" />
                        Candidature Inviate ({userApplications.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {userApplications.length > 0 ? (
                        <div className="space-y-4">
                          {userApplications.map((application) => (
                            <div key={application.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-lg">Progetto #{application.projectId}</h4>
                                <Badge variant={
                                  application.status === 'accepted' ? 'default' :
                                  application.status === 'rejected' ? 'destructive' : 'secondary'
                                }>
                                  {application.status === 'accepted' ? 'Accettata' : 
                                   application.status === 'rejected' ? 'Rifiutata' : 'In Attesa'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Candidatura inviata il {application.appliedAt?.toDate?.()?.toLocaleDateString('it-IT')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Nessuna candidatura inviata</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

              <TabsContent value="stats" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data Registrazione
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {user.createdAt?.toDate?.()?.toLocaleDateString('it-IT') || 'N/D'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Ultimo Accesso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(user as any).lastLoginAt?.toDate?.()?.toLocaleDateString('it-IT') || 'Mai'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        ID Utente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs font-mono bg-muted p-2 rounded">
                        {user.uid}
                      </div>
                    </CardContent>
                  </Card>

                  {isProfessional && (
                    <>
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <HandHeart className="h-4 w-4" />
                            Candidature Totali
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-600">{userApplications.length}</div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" />
                            Tasso Successo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600">
                            {userApplications.length > 0 
                              ? Math.round((userApplications.filter(app => app.status === 'accepted').length / userApplications.length) * 100)
                              : 0
                            }%
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {isCompany && (
                    <>
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Progetti Pubblicati
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600">{userProjects.length}</div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" />
                            Budget Totale
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-600">
                            €{userProjects.reduce((sum, project) => sum + (project.budget || 0), 0).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L&apos;utente verrà eliminato permanentemente dal sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}