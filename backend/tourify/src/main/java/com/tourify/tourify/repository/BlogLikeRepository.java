package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.BlogLike;
import com.tourify.tourify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogLikeRepository extends JpaRepository<BlogLike, Long> {
    
    Optional<BlogLike> findByBlogAndUser(Blog blog, User user);
    
    List<BlogLike> findByBlog(Blog blog);
    
    List<BlogLike> findByUser(User user);
    
    boolean existsByBlogAndUser(Blog blog, User user);
    
    void deleteByBlogAndUser(Blog blog, User user);
    
    void deleteByBlog(Blog blog);
    
    @Query("SELECT bl FROM BlogLike bl WHERE bl.blog.id = :blogId")
    List<BlogLike> findByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT bl FROM BlogLike bl WHERE bl.user.id = :userId")
    List<BlogLike> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(bl) FROM BlogLike bl WHERE bl.blog.id = :blogId")
    Long countByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT COUNT(bl) FROM BlogLike bl WHERE bl.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT CASE WHEN COUNT(bl) > 0 THEN true ELSE false END FROM BlogLike bl " +
           "WHERE bl.blog.id = :blogId AND bl.user.id = :userId")
    boolean existsByBlogIdAndUserId(@Param("blogId") Long blogId, @Param("userId") Long userId);
} 