package com.stayfinder.config;

import com.stayfinder.model.*;
import com.stayfinder.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Seeds the database with realistic Indian hotel data on first startup.
 * Runs only when the users table is empty.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping data seeding.");
            return;
        }

        log.info("Seeding database with demo data...");

        // ── Users ──────────────────────────────────────────────────────────────
        User admin = createUser("admin@stayfinder.com", "admin123", "Admin", "StayFinder", Role.ADMIN);
        User alice = createUser("alice@example.com", "password123", "Alice", "Sharma", Role.USER);
        User bob   = createUser("bob@example.com",   "password123", "Bob",   "Kumar",  Role.USER);
        User carol = createUser("carol@example.com", "password123", "Carol", "Patel",  Role.USER);

        List<User> users = userRepository.saveAll(List.of(admin, alice, bob, carol));
        admin = users.get(0); alice = users.get(1); bob = users.get(2); carol = users.get(3);
        log.info("Created {} users", users.size());

        // ── Hotels ─────────────────────────────────────────────────────────────
        Hotel tajMumbai = createHotel(
                "Taj Mahal Palace Mumbai",
                "Mumbai", "Colaba",
                "Apollo Bunder, Colaba, Mumbai - 400001",
                "An iconic luxury hotel overlooking the Arabian Sea and the Gateway of India. " +
                "Built in 1903, it blends Moorish, Oriental, and Florentine styles with world-class amenities.",
                5, "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym", "Parking",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Concierge", "Butler Service"),
                18.9220, 72.8347
        );

        Hotel oberoi = createHotel(
                "The Oberoi Mumbai",
                "Mumbai", "Nariman Point",
                "Nariman Point, Mumbai - 400021",
                "A sophisticated urban retreat offering panoramic views of Marine Drive and the Arabian Sea. " +
                "Known for impeccable service and world-class dining.",
                5, "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Business Center"),
                18.9256, 72.8242
        );

        Hotel leela = createHotel(
                "The Leela Palace Delhi",
                "Delhi", "Chanakyapuri",
                "Diplomatic Enclave, Chanakyapuri, New Delhi - 110023",
                "Delhi's most luxurious address in the heart of the diplomatic enclave. " +
                "Blends Mughal architecture with modern luxury and features award-winning restaurants.",
                5, "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym", "Parking",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Helipad", "Concierge"),
                28.5921, 77.1897
        );

        Hotel itcMaurya = createHotel(
                "ITC Maurya Delhi",
                "Delhi", "Sardar Patel Marg",
                "Sardar Patel Marg, Diplomatic Enclave, New Delhi - 110021",
                "Home to the legendary Bukhara restaurant, this 5-star property is a Delhi institution. " +
                "Renowned for its heritage hospitality and sustainable luxury practices.",
                5, "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Business Center", "Tennis Court"),
                28.5987, 77.1750
        );

        Hotel goaHilton = createHotel(
                "Hilton Goa Resort",
                "Goa", "Candolim",
                "Candolim Beach Road, Candolim, North Goa - 403515",
                "A beachfront paradise nestled along the stunning Candolim coast. " +
                "Lush tropical gardens, multiple pools, and direct beach access make this the perfect Goa getaway.",
                5, "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym", "Parking",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Water Sports", "Kids Club"),
                15.5169, 73.7626
        );

        Hotel goaDoubleTree = createHotel(
                "DoubleTree by Hilton Goa",
                "Goa", "Panaji",
                "Campal, Panaji, Goa - 403001",
                "Located in the heart of Goa's capital, this contemporary hotel offers a tranquil retreat " +
                "with views of the Mandovi River and easy access to Old Goa's UNESCO heritage sites.",
                4, "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Restaurant", "Gym", "Parking",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar"),
                15.4909, 73.8278
        );

        Hotel jwBangalore = createHotel(
                "JW Marriott Bangalore",
                "Bangalore", "Vittal Mallya Road",
                "24/1, Vittal Mallya Road, KG Halli, Bangalore - 560001",
                "A sophisticated luxury hotel in the heart of Bangalore's business and entertainment district. " +
                "Features an impressive art collection, rooftop pool, and multiple award-winning restaurants.",
                5, "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym", "Parking",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Business Center"),
                12.9716, 77.5946
        );

        Hotel ritzkarlton = createHotel(
                "The Ritz-Carlton Bangalore",
                "Bangalore", "Residency Road",
                "99, Residency Road, Ashok Nagar, Bangalore - 560025",
                "Bangalore's most opulent luxury hotel set in a stunning heritage building. " +
                "An oasis of calm in the bustling city with legendary Ritz-Carlton service.",
                5, "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Concierge", "Valet Parking"),
                12.9627, 77.6038
        );

        Hotel jaipur = createHotel(
                "Rambagh Palace Jaipur",
                "Jaipur", "Bhawani Singh Road",
                "Bhawani Singh Rd, Jaipur, Rajasthan - 302005",
                "Once the residence of the Maharaja of Jaipur, this 'Jewel of Jaipur' has been transformed " +
                "into a palace hotel offering a royal experience amidst 47 acres of lush Mughal gardens.",
                5, "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym", "Parking",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar", "Tennis Court", "Polo Ground"),
                26.8972, 75.8089
        );

        Hotel jeepurCity = createHotel(
                "Trident Jaipur",
                "Jaipur", "Amer Road",
                "Amer Road, Jaipur, Rajasthan - 302002",
                "A stunning property set in 7 acres of landscaped gardens near the Man Sagar Lake. " +
                "Offers spectacular views of the Jal Mahal and the surrounding Aravalli hills.",
                4, "https://images.unsplash.com/photo-1587213811864-c8d8c79d60f7?w=1200",
                List.of("Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Gym", "Parking",
                        "24-hour Front Desk", "Room Service", "Air Conditioning", "Bar"),
                26.9644, 75.8503
        );

        List<Hotel> savedHotels = hotelRepository.saveAll(List.of(
                tajMumbai, oberoi, leela, itcMaurya, goaHilton, goaDoubleTree,
                jwBangalore, ritzkarlton, jaipur, jeepurCity));
        log.info("Created {} hotels", savedHotels.size());

        // ── Rooms ──────────────────────────────────────────────────────────────
        seedRooms(savedHotels);

        // ── Bookings & Reviews ─────────────────────────────────────────────────
        List<Room> allRooms = roomRepository.findAll();
        seedBookingsAndReviews(allRooms, savedHotels, alice, bob, carol);

        log.info("Database seeding completed successfully.");
    }

    private void seedRooms(List<Hotel> hotels) {
        for (Hotel hotel : hotels) {
            List<Room> rooms = buildRoomsForHotel(hotel);
            roomRepository.saveAll(rooms);
        }
        log.info("Created rooms for {} hotels", hotels.size());
    }

    private List<Room> buildRoomsForHotel(Hotel hotel) {
        boolean is5Star = hotel.getStars() == 5;
        String city = hotel.getCity();

        // Base pricing by city and star rating
        double base = switch (city) {
            case "Mumbai" -> is5Star ? 18000 : 12000;
            case "Delhi"  -> is5Star ? 16000 : 10000;
            case "Goa"    -> is5Star ? 14000 : 8000;
            case "Bangalore" -> is5Star ? 15000 : 9000;
            case "Jaipur" -> is5Star ? 25000 : 10000;
            default -> 12000;
        };

        return List.of(
                Room.builder().hotel(hotel).name("Deluxe Room").type(RoomType.DELUXE)
                        .pricePerNight(bd(base)).capacity(2)
                        .description("Spacious room with king bed, city view, and modern amenities.")
                        .imageUrl("https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800")
                        .amenities(List.of("Free WiFi", "Air Conditioning", "Flat-screen TV", "Mini Bar", "Safe"))
                        .isActive(true).build(),
                Room.builder().hotel(hotel).name("Superior Room").type(RoomType.STANDARD)
                        .pricePerNight(bd(base * 0.75)).capacity(2)
                        .description("Comfortable room with twin or double bed and garden view.")
                        .imageUrl("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800")
                        .amenities(List.of("Free WiFi", "Air Conditioning", "Flat-screen TV", "Tea/Coffee Maker"))
                        .isActive(true).build(),
                Room.builder().hotel(hotel).name("Premier Suite").type(RoomType.SUITE)
                        .pricePerNight(bd(base * 2.5)).capacity(3)
                        .description("Luxurious suite with separate living area, marble bathroom with soaking tub, and panoramic views.")
                        .imageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800")
                        .amenities(List.of("Free WiFi", "Air Conditioning", "Butler Service", "Jacuzzi", "Mini Bar",
                                "Dining Area", "Premium Toiletries", "Nespresso Machine"))
                        .isActive(true).build(),
                Room.builder().hotel(hotel).name("Family Room").type(RoomType.FAMILY)
                        .pricePerNight(bd(base * 1.4)).capacity(4)
                        .description("Generously sized room ideal for families with connecting twin and double beds.")
                        .imageUrl("https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800")
                        .amenities(List.of("Free WiFi", "Air Conditioning", "Flat-screen TV", "Tea/Coffee Maker",
                                "Extra Beds Available", "Kids Amenities"))
                        .isActive(true).build()
        );
    }

    private void seedBookingsAndReviews(List<Room> allRooms, List<Hotel> hotels, User alice, User bob, User carol) {
        // Create COMPLETED bookings in the past so reviews can be written
        LocalDate pastCheckIn  = LocalDate.now().minusDays(60);
        LocalDate pastCheckOut = LocalDate.now().minusDays(55);

        // Map hotels to their first deluxe rooms for seeding
        for (int i = 0; i < hotels.size(); i++) {
            Hotel hotel = hotels.get(i);
            List<Room> hotelRooms = allRooms.stream()
                    .filter(r -> r.getHotel().getId().equals(hotel.getId()))
                    .toList();

            if (hotelRooms.isEmpty()) continue;
            Room deluxeRoom = hotelRooms.get(0);
            Room standardRoom = hotelRooms.size() > 1 ? hotelRooms.get(1) : hotelRooms.get(0);

            // Alice and Bob have completed bookings at every hotel (so they can review)
            Booking aliceBooking = Booking.builder()
                    .user(alice).room(deluxeRoom)
                    .checkInDate(pastCheckIn.plusDays(i)).checkOutDate(pastCheckOut.plusDays(i))
                    .totalPrice(deluxeRoom.getPricePerNight().multiply(BigDecimal.valueOf(5)))
                    .guestCount(2).status(BookingStatus.COMPLETED).build();

            Booking bobBooking = Booking.builder()
                    .user(bob).room(standardRoom)
                    .checkInDate(pastCheckIn.plusDays(i + 1)).checkOutDate(pastCheckOut.plusDays(i + 1))
                    .totalPrice(standardRoom.getPricePerNight().multiply(BigDecimal.valueOf(5)))
                    .guestCount(1).status(BookingStatus.COMPLETED).build();

            List<Booking> saved = bookingRepository.saveAll(List.of(aliceBooking, bobBooking));
            Booking savedAlice = saved.get(0);
            Booking savedBob   = saved.get(1);

            // Carol has completed booking at first 5 hotels
            if (i < 5) {
                Room carolRoom = hotelRooms.size() > 2 ? hotelRooms.get(2) : hotelRooms.get(0);
                Booking carolBooking = Booking.builder()
                        .user(carol).room(carolRoom)
                        .checkInDate(pastCheckIn.plusDays(i + 2)).checkOutDate(pastCheckOut.plusDays(i + 2))
                        .totalPrice(carolRoom.getPricePerNight().multiply(BigDecimal.valueOf(5)))
                        .guestCount(2).status(BookingStatus.COMPLETED).build();
                bookingRepository.save(carolBooking);
            }

            // Write reviews
            Review aliceReview = buildReview(alice, hotel, savedAlice, ALICE_REVIEWS[i % ALICE_REVIEWS.length]);
            Review bobReview   = buildReview(bob, hotel, savedBob,   BOB_REVIEWS[i % BOB_REVIEWS.length]);
            reviewRepository.saveAll(List.of(aliceReview, bobReview));
        }

        // Recalculate hotel ratings
        for (Hotel hotel : hotels) {
            Double avg = reviewRepository.calculateAvgRating(hotel.getId());
            Long count = reviewRepository.countByHotelId(hotel.getId());
            hotel.setAvgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
            hotel.setReviewCount(count != null ? count.intValue() : 0);
        }
        hotelRepository.saveAll(hotels);

        // Add a few future / active bookings
        Room futureRoom = allRooms.get(0);
        Booking futureBooking = Booking.builder()
                .user(alice).room(futureRoom)
                .checkInDate(LocalDate.now().plusDays(30))
                .checkOutDate(LocalDate.now().plusDays(33))
                .totalPrice(futureRoom.getPricePerNight().multiply(BigDecimal.valueOf(3)))
                .guestCount(2).status(BookingStatus.CONFIRMED).build();
        bookingRepository.save(futureBooking);

        log.info("Created bookings and reviews for all hotels");
    }

    private Review buildReview(User user, Hotel hotel, Booking booking, ReviewSeed seed) {
        return Review.builder()
                .user(user).hotel(hotel).booking(booking)
                .rating(seed.rating()).title(seed.title()).body(seed.body())
                .build();
    }

    // ── Seed Data ──────────────────────────────────────────────────────────────

    private record ReviewSeed(int rating, String title, String body) {}

    private static final ReviewSeed[] ALICE_REVIEWS = {
        new ReviewSeed(5, "An absolute dream stay!",
            "The Taj is simply unparalleled in hospitality. The staff remembered our names after day one and the sea-view room took our breath away. The breakfast spread is legendary — we tried something new every morning. Worth every rupee for a special occasion."),
        new ReviewSeed(5, "Flawless in every way",
            "From check-in to check-out, everything was perfect. The room was immaculate, the bed was cloud-like, and the in-room dining was restaurant quality. The pool overlooks the city skyline — absolutely stunning at sunset."),
        new ReviewSeed(4, "Regal experience, minor hiccups",
            "The property itself is stunning — majestic Mughal architecture meets contemporary luxury. The spa treatments were outstanding. Lost one star because room service took longer than expected one evening, but the apology gesture from management was gracious."),
        new ReviewSeed(5, "Delhi's finest, no contest",
            "Bukhara alone is worth a trip to Delhi. The hotel feels like a dignified retreat from the city chaos. Rooms are spacious, beds exceptionally comfortable, and the pool is a lovely escape. Business facilities are top-notch too."),
        new ReviewSeed(5, "Paradise found in Goa",
            "Woke up every morning to the sound of waves and walked barefoot to the beach in minutes. The water sports were incredibly well organized, the kids loved the pool, and the seafood restaurant was phenomenal. Already planning our return trip."),
        new ReviewSeed(4, "Great value and location",
            "Panaji location is perfect for exploring Old Goa and the local markets. Property is clean and well-maintained. The river-view rooms are worth the upgrade. Pool area gets crowded on weekends but service remained attentive throughout."),
        new ReviewSeed(5, "Bangalore's best-kept secret",
            "The art installations throughout the hotel are captivating. Rooftop pool is spectacular — especially at night with the city lights. Had dinner at the Italian restaurant and it rivaled anything in Europe. Highly recommend for business or leisure."),
        new ReviewSeed(4, "Classic luxury done right",
            "The Ritz's heritage building is gorgeous. Rooms are beautifully appointed with quality linens and thoughtful touches. The spa is superb. Located perfectly for Bangalore's MG Road. Only wish the gym was slightly larger."),
        new ReviewSeed(5, "Living like royalty in Jaipur",
            "Rambagh Palace is not just a hotel, it's a time machine to Rajputana splendour. The grounds at dusk are magical. The heritage walk curated by the hotel historian was fascinating. Dinner at the Suvarna Mahal — pure theatre. Unforgettable."),
        new ReviewSeed(4, "Serene lake views, great base",
            "Woke up to views of Jal Mahal every morning — that alone justified the trip. Property is immaculate, the pool garden is gorgeous, and the Jaipur food festival dinner was memorable. Easy access to Amber Fort made sightseeing effortless.")
    };

    private static final ReviewSeed[] BOB_REVIEWS = {
        new ReviewSeed(5, "Gateway to Mumbai's soul",
            "Staying at the Taj directly across from the Gateway of India is a bucket-list experience. The Heritage Wing rooms are worth the premium — high ceilings, period furniture, stunning views. The Sea Lounge high tea is an institution. Exceptional."),
        new ReviewSeed(4, "Prime Nariman Point location",
            "Great location for business travellers — 10 minutes from most corporate offices. Rooms are well-sized with excellent workspaces. The Marine Drive view from the infinity pool is an experience in itself. Executive lounge benefits are generous."),
        new ReviewSeed(5, "Delhi at its grandest",
            "The Leela's lobby sets the tone — grand, opulent, deeply Indian. The service is anticipatory without being intrusive. The spa uses local Ayurvedic rituals and I left feeling completely restored. The breakfast is a lavish affair. 10/10."),
        new ReviewSeed(4, "Solid 5-star experience",
            "Very polished operation. Rooms are large and well-equipped, housekeeping is meticulous. The Dum Pukht restaurant is phenomenal — book well in advance. Gym is well-stocked. Would be 5 stars if check-in process was faster."),
        new ReviewSeed(4, "Great Goa resort",
            "Perfect for a beach holiday with the family. The pools are pristine, beach access is easy, and the kids' club kept my little ones thoroughly entertained. Food quality across all outlets is consistently good. Will return next season."),
        new ReviewSeed(5, "Hidden gem in Goa's capital",
            "Better than many larger resort properties in Goa. Excellent service, spotless rooms, and a peaceful pool area. The in-house restaurant serves surprisingly authentic Goan cuisine — the fish curry was outstanding. Great value for the location."),
        new ReviewSeed(5, "Tech city's most glamorous stay",
            "Perfect for Bangalore business trips that deserve a reward. The lobby bar is buzzing with Bangalore's creative class. Room tech is impressive — app-controlled everything. The breakfast is indulgent and the coffee selection is excellent."),
        new ReviewSeed(5, "Understated elegance",
            "The Ritz Bangalore gets the balance right — luxurious without being ostentatious. Wonderful personal touches throughout the stay. The Club Lounge evening service is a highlight. Restaurant serves excellent contemporary Indian cuisine."),
        new ReviewSeed(5, "A palace stay like no other",
            "Nothing I write can do justice to Rambagh. Wandering the moonlit palace gardens with a glass of Rajasthani wine is a moment I will carry forever. The rooms are palatial, service is courtly, and the heritage polo experience is extraordinary."),
        new ReviewSeed(4, "Tranquil and well-positioned",
            "Trident is reliable quality done beautifully. The Jal Mahal view from the pool terrace is a screensaver come to life. Food is very good — especially the Rajasthani thali dinner. Easy rickshaw to old city markets. Great mid-range 5-star option.")
    };

    // ── Helpers ────────────────────────────────────────────────────────────────

    private User createUser(String email, String password, String firstName, String lastName, Role role) {
        return User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .build();
    }

    private Hotel createHotel(String name, String city, String area, String address,
                               String description, int stars, String imageUrl,
                               List<String> amenities, double lat, double lng) {
        return Hotel.builder()
                .name(name).city(city).area(area).address(address)
                .description(description).stars(stars).mainImageUrl(imageUrl)
                .amenities(amenities).avgRating(0.0).reviewCount(0)
                .latitude(lat).longitude(lng)
                .build();
    }

    private BigDecimal bd(double val) {
        return BigDecimal.valueOf(Math.round(val));
    }
}
