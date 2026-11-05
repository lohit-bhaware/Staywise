package com.stayfinder.repository;

import com.stayfinder.model.Booking;
import com.stayfinder.model.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Checks for any CONFIRMED bookings that overlap with the requested date range.
     * Overlap condition: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
     */
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.status = 'CONFIRMED' " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn")
    boolean existsOverlappingBooking(@Param("roomId") Long roomId,
                                     @Param("checkIn") LocalDate checkIn,
                                     @Param("checkOut") LocalDate checkOut);

    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.room r " +
           "JOIN FETCH r.hotel " +
           "WHERE b.user.id = :userId " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.room r " +
           "JOIN FETCH r.hotel " +
           "JOIN FETCH b.user " +
           "ORDER BY b.createdAt DESC")
    Page<Booking> findAllWithDetails(Pageable pageable);

    /**
     * Checks whether a user has a completed booking at a specific hotel.
     */
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.user.id = :userId " +
           "AND b.room.hotel.id = :hotelId " +
           "AND b.status = 'COMPLETED'")
    boolean existsCompletedBookingByUserAndHotel(@Param("userId") Long userId,
                                                  @Param("hotelId") Long hotelId);
}
