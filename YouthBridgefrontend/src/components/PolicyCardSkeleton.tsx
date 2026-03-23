// src/components/PolicyCardSkeleton.tsx
// 정책 카드 로딩 스켈레톤

import "./PolicyCardSkeleton.css";

interface Props {
  count?: number;
}

function PolicyCardSkeleton({ count = 4 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-top">
            <span className="skeleton-badge" />
            <span className="skeleton-badge short" />
          </div>
          <div className="skeleton-title" />
          <div className="skeleton-desc" />
          <div className="skeleton-desc short" />
        </div>
      ))}
    </>
  );
}

export default PolicyCardSkeleton;
