package com.stayfinder.repository;

import com.stayfinder.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByUserIdAndHotelId(Long userId, Long hotelId);

    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.hotel.id = :hotelId ORDER BY r.createdAt DESC")
    Page<Review> findByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.hotel.id = :hotelId")
    List<Review> findByHotelIdList(@Param("hotelId") Long hotelId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Double calculateAvgRating(@Param("hotelId") Long hotelId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId")
    Long countByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT r FROM Review r JOIN FETCH r.hotel WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Review> findByUserId(@Param("userId") Long userId);
}
