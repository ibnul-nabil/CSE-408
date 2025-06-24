package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    Optional<Session> findByToken(String token);
    
    @Query("SELECT s FROM Session s WHERE s.token = :token AND s.expiresAt > :now")
    Optional<Session> findByTokenAndNotExpired(@Param("token") String token, @Param("now") LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM Session s WHERE s.expiresAt < :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM Session s WHERE s.user.id = :userId")
    void deleteAllSessionsByUserId(@Param("userId") Long userId);
} 