package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Blog b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Blog> findUserBlogsWithLimit(@Param("userId") Long userId);
}