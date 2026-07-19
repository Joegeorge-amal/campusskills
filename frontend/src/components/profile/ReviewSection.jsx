import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import { IconStar, IconStarFilled } from '@tabler/icons-react';

const ReviewSection = ({ userId, averageRating, reviewCount, onLoaded }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    reviewService.getUserReviews(userId)
      .then(data => {
        const items = data?.items || [];
        setReviews(items);
        if (onLoaded) {
          onLoaded(items);
        }
      })
      .catch(err => {
        console.error("Failed to load reviews", err);
        if (onLoaded) {
          onLoaded([]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  // Helper for stars (blue & grey theme with half-fill support)
  const renderStars = (rating) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {stars.map(starIndex => {
          const leftVal = starIndex - 0.5;
          const rightVal = starIndex;
          const isLeftFilled = rating >= leftVal;
          const isRightFilled = rating >= rightVal;
          
          return (
            <div key={starIndex} style={{ width: '18px', height: '18px', display: 'inline-block' }}>
              <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id={`display-grad-${userId}-${starIndex}-${rating}`}>
                    <stop offset="50%" stopColor={isLeftFilled ? '#1d4ed8' : '#e5e7eb'} />
                    <stop offset="50%" stopColor={isRightFilled ? '#1d4ed8' : '#e5e7eb'} />
                  </linearGradient>
                </defs>
                <path 
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" 
                  fill={`url(#display-grad-${userId}-${starIndex}-${rating})`}
                />
              </svg>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper for relative time (e.g. 2 weeks ago)
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div id="reviews-section" style={{ background: 'var(--cs-bg-white)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px', border: '1px solid #f3f4f6', scrollMarginTop: '100px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Ratings & Reviews
      </h2>

      {/* Trust Score & Info Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '48px', fontWeight: 900, color: '#111827' }}>
            {averageRating !== undefined && averageRating !== null ? Number(averageRating).toFixed(1) : '0.0'}
          </span>
          <div style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
            {renderStars(averageRating || 0)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#374151' }}>Trust Score</div>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>
            Based on {reviewCount || 0} reviews
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ color: '#6b7280', fontSize: '14px', padding: '16px 0', textAlign: 'center' }}>Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div id="reviews-list-top" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => (
            <div key={rev._id || rev.id} style={{ background: 'var(--cs-bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--cs-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {renderStars(rev.rating)}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', fontWeight: 500 }}>
                  {getRelativeTime(rev.createdAt)}
                </span>
              </div>

              <div style={{ fontSize: '14px', color: 'var(--cs-text-main)', lineHeight: '1.5', fontStyle: 'italic', fontWeight: 500 }}>
                "{rev.comment || 'No comment provided.'}"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid var(--cs-border)', paddingTop: '8px' }}>
                <span style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 700 }}>
                  — {rev.reviewerName}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, background: 'var(--cs-bg-hover)', padding: '2px 8px', borderRadius: '100px' }}>
                  {rev.sessionTitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: '14px', color: 'var(--cs-text-inactive)', padding: '24px 0', textAlign: 'center' }}>
          No reviews yet.
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
