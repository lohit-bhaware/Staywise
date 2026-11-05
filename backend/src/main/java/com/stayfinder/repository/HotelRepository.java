package com.stayfinder.repository;

import com.stayfinder.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByCity(String city);

    @Query("SELECT h FROM Hotel h WHERE " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.area) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Hotel> searchHotels(@Param("query") String query);

    @Query("SELECT h FROM Hotel h WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "  LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(h.area) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:city IS NULL OR :city = '' OR LOWER(h.city) = LOWER(:city))")
    List<Hotel> searchHotelsWithFilters(@Param("query") String query, @Param("city") String city);
}
