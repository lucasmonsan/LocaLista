import React from 'react';
import styles from './Reviews.module.css';

interface Review {
  id: string | number;
  // Ex: title: string;
  // Ex: content: string;
}

interface ReviewsProps {
  reviews: Review[];
}

export const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className={styles.reviewsContainer} aria-label="Review Reviews">
      <button>

      </button>
      <ul className={styles.reviewsList}>
        {reviews.map((review, index) => (
          <li key={review.id || index} className={styles.reviewCard}>
            {/* Conteúdo do card de review */}
            {/* Placeholder: */}
            Review Card {index + 1}
          </li>
        ))}
      </ul>
    </div>
  );
};