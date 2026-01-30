'use client';

import { Resume } from '@/lib/db/schema'; // We might need to infer type or import from schema
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/Progress';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { deleteResume } from '@/lib/actions/resume-actions';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ResumeCardProps {
  resume: typeof Resume.$inferSelect; // Or just any compatible type
}

export function ResumeCard({ resume }: { resume: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this resume?')) return;

    startTransition(async () => {
      try {
        await deleteResume(resume.id);
        // Router refresh is handled by server action revalidatePath, but sometimes client refresh helps
      } catch (error) {
        alert('Failed to delete resume');
      }
    });
  };

  return (
    <Link href={`/dashboard/resumes/${resume.id}`}>
      <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full flex flex-col relative overflow-hidden">
        <CardContent className="p-6 flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            {resume.atsScore ? (
               <div className="transform scale-75 origin-top-right">
                 <CircularProgress 
                    value={resume.atsScore} 
                    size={60} 
                    strokeWidth={8} 
                    showValue={true}
                    color={resume.atsScore >= 80 ? 'success' : resume.atsScore >= 60 ? 'warning' : 'danger'}
                 />
               </div>
            ) : (
                <Badge variant="secondary">Processing</Badge>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg truncate pr-2" title={resume.originalFilename}>
              {resume.originalFilename}
            </h3>
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              Uploaded {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto pt-2">
             <Badge variant={
                resume.status === 'analyzed' ? 'success' : 
                resume.status === 'failed' ? 'danger' : 
                'secondary'
             }>
                {resume.status === 'analyzed' ? 'Analyzed' : resume.status}
             </Badge>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 bg-muted/30 flex justify-between items-center border-t">
           <Button 
             variant="ghost" 
             size="sm" 
             className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
             onClick={handleDelete}
             disabled={isPending}
           >
             {isPending ? '...' : <Trash2 className="w-4 h-4" />}
           </Button>
           
           <div className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
             View Analysis <ArrowRight className="w-4 h-4" />
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
