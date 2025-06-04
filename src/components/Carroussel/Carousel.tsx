import React from 'react';
import styles from './Carousel.module.css';

interface Review {
  id: string | number;
  // Ex: title: string;
  // Ex: content: string;
}

interface CarouselProps {
  reviews: Review[];
}

export const Carousel: React.FC<CarouselProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className={styles.carouselContainer} aria-label="Review Carousel">
      <ul className={styles.carouselList}>
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