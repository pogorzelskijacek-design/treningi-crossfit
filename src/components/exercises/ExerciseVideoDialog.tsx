import { CirclePlay, ExternalLink, Search } from 'lucide-react';
import { exerciseVideo, ESSENTIALS_PLAYLIST_ID } from '@/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ExerciseVideoDialogProps {
  exerciseId?: string;
  exerciseName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExerciseVideoDialog({
  exerciseId,
  exerciseName,
  open,
  onOpenChange,
}: ExerciseVideoDialogProps) {
  const video = exerciseId ? exerciseVideo(exerciseId, exerciseName) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CirclePlay className="size-5 text-red-500" />
            {exerciseName ?? 'Technique'}
          </DialogTitle>
          <DialogDescription>
            {video?.exact
              ? 'Official CrossFit demo from the Essentials series.'
              : 'No exact demo on file — here are CrossFit results on YouTube.'}
          </DialogDescription>
        </DialogHeader>

        {video?.exact && video.videoId ? (
          <div className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              {/* key forces a fresh iframe per exercise so the player resets */}
              <iframe
                key={video.videoId}
                className="size-full"
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&list=${ESSENTIALS_PLAYLIST_ID}`}
                title={exerciseName}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">
                <ExternalLink className="size-4" /> Open on YouTube
              </Button>
            </a>
          </div>
        ) : (
          video && (
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              <Button className="w-full">
                <Search className="size-4" /> Search on YouTube
              </Button>
            </a>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
