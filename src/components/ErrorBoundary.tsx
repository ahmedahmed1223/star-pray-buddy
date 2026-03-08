import React from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6" dir="rtl">
          <div className="bg-card rounded-3xl p-8 text-center border border-border max-w-sm w-full">
            <div className="text-5xl mb-4">😢</div>
            <h2 className="text-xl font-bold text-foreground mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-muted-foreground mb-6 text-sm">نعتذر عن ذلك، يرجى إعادة تحميل الصفحة</p>
            <button
              onClick={() => window.location.reload()}
              className="gradient-gold text-primary-foreground font-bold px-6 py-3 rounded-xl glow-gold"
            >
              إعادة تحميل 🔄
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
