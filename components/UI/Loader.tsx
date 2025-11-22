import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full text-white/80">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);
