import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <Loader2 className="animate-spin w-12 h-12" />
    </div>
  );
}
