'use client';

import { resumes } from '@/lib/db/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/Progress';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { deleteResume } from '@/lib/actions/resume-actions';
import { useTransition } from 'react';


// Define the type from the schema
type Resume = typeof resumes.$inferSelect;

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const [isPending, startTransition] = useTransition();

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
    <Link href={`/dashboard/resumes/${resume.id}`} className="block h-full">
      <Card className="hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer group h-full flex flex-col relative overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="p-6 flex-1 flex flex-col gap-5 relative z-10">
          <div className="flex justify-between items-start">
            <div className="p-3.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300 shadow-sm">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            {resume.atsScore !== null && resume.atsScore !== undefined ? (
               <div className="transform scale-90 origin-top-right group-hover:scale-100 transition-transform duration-300">
                 <CircularProgress 
                    value={resume.atsScore} 
                    size={64} 
                    strokeWidth={6} 
                    color={resume.atsScore >= 80 ? 'success' : resume.atsScore >= 60 ? 'warning' : 'danger'}
                 />
               </div>
            ) : (
                <Badge variant="secondary" className="animate-pulse">Processing</Badge>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-lg truncate pr-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-300" title={resume.originalFilename}>
              {resume.originalFilename}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5" suppressHydrationWarning>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              Uploaded {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto pt-3">
             <Badge 
               variant={
                resume.status === 'analyzed' ? 'success' : 
                resume.status === 'failed' ? 'danger' : 
                'secondary'
               }
               className="capitalize shadow-sm bg-opacity-90"
             >
                {resume.status === 'analyzed' ? 'Analyzed' : resume.status}
             </Badge>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 relative z-10">
           <Button 
             variant="ghost" 
             size="sm" 
             className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -ml-2"
             onClick={handleDelete}
             disabled={isPending}
           >
             {isPending ? '...' : <><Trash2 className="w-4 h-4 mr-1.5" /> <span className="text-xs">Delete</span></>}
           </Button>
           
           <div className="text-primary text-sm font-semibold flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
             View Analysis <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
