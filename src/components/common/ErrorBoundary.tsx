"use client";

import { Component, type ReactNode } from "react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 에러 바운더리 컴포넌트
 *
 * 하위 컴포넌트에서 발생하는 에러를 잡아서
 * 전체 앱이 깨지는 것을 방지합니다.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 (프로덕션에서는 Sentry 등으로 전송)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="mb-2 font-serif text-fluid-h2 font-bold text-ink">
              문제가 발생했습니다
            </h2>
            <p className="mb-6 text-muted">
              일시적인 오류가 발생했습니다. 다시 시도해주세요.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="primary" onClick={this.handleReset}>
                다시 시도
              </Button>
              <Button
                variant="ghost"
                onClick={() => (window.location.href = "/")}
              >
                홈으로
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-body text-muted">
                  에러 상세 (개발 모드)
                </summary>
                <pre className="mt-2 overflow-auto border border-rule bg-stone p-4 text-caption text-red-600">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 어드민 페이지용 에러 바운더리
 */
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[400px] flex-col items-center justify-center border border-rule bg-white p-8">
          <div className="text-center">
            <h2 className="mb-2 font-serif text-fluid-h2 font-bold text-ink">
              페이지 로드 중 오류 발생
            </h2>
            <p className="mb-6 text-muted">
              데이터를 불러오는 중 문제가 발생했습니다.
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              페이지 새로고침
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
