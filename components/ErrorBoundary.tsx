
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9] p-6">
          <div className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl border border-red-50">
            <div className="w-20 h-20 bg-red-50 rounded-3xl items-center justify-center flex mx-auto text-red-500">
               <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-serif text-zinc-900">Oops, Ada Masalah!</h1>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Terjadi kesalahan sistem yang tidak terduga. Kami sudah mencatatnya untuk segera diperbaiki.
              </p>
            </div>
            <div className="flex flex-col gap-4">
               <button 
                 onClick={() => window.location.reload()}
                 className="flex items-center justify-center gap-3 w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#D4AF37] transition-all"
               >
                 <RefreshCw size={18} /> Refresh Halaman
               </button>
               <a 
                 href="/"
                 className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-zinc-100 text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all"
               >
                 <Home size={18} /> Balik ke Beranda
               </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
