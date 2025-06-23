package com.tourify.tourify.repository;

import com.tourify.tourify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.blogs LEFT JOIN FETCH u.tours WHERE u.id = :userId")
    Optional<User> findByIdWithBlogsAndTours(@Param("userId") Long userId);
}
