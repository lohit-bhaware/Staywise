package com.stayfinder.repository;

import com.stayfinder.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelIdAndIsActiveTrue(Long hotelId);

    @Query("SELECT r.hotel.id, MIN(r.pricePerNight) FROM Room r WHERE r.isActive = true AND r.hotel.id IN :hotelIds GROUP BY r.hotel.id")
    List<Object[]> findMinPricesForHotelIds(@Param("hotelIds") List<Long> hotelIds);

    /**
     * Finds rooms for a hotel that are available (no overlapping CONFIRMED bookings) for the given dates.
     */
    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.isActive = true AND r.id NOT IN (" +
           "  SELECT b.room.id FROM Booking b WHERE b.room.hotel.id = :hotelId " +
           "  AND b.status = 'CONFIRMED' " +
           "  AND b.checkInDate < :checkOut AND b.checkOutDate > :checkIn" +
           ")")
    List<Room> findAvailableRooms(@Param("hotelId") Long hotelId,
                                  @Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);
}
