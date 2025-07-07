package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.BlogMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogMediaRepository extends JpaRepository<BlogMedia, Long> {
    
    List<BlogMedia> findByBlogOrderByMediaOrder(Blog blog);
    
    List<BlogMedia> findByBlogAndMediaType(Blog blog, String mediaType);
    
    Optional<BlogMedia> findByBlogAndIsThumbnail(Blog blog, Boolean isThumbnail);
    
    void deleteByBlog(Blog blog);
    
    @Query("SELECT bm FROM BlogMedia bm WHERE bm.blog.id = :blogId ORDER BY bm.mediaOrder ASC")
    List<BlogMedia> findByBlogIdOrderByMediaOrder(@Param("blogId") Long blogId);
    
    @Query("SELECT bm FROM BlogMedia bm WHERE bm.blog.id = :blogId AND bm.mediaType = :mediaType ORDER BY bm.mediaOrder ASC")
    List<BlogMedia> findByBlogIdAndMediaType(@Param("blogId") Long blogId, @Param("mediaType") String mediaType);
    
    @Query("SELECT bm FROM BlogMedia bm WHERE bm.blog.id = :blogId AND bm.isThumbnail = true")
    Optional<BlogMedia> findThumbnailByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT COUNT(bm) FROM BlogMedia bm WHERE bm.blog.id = :blogId")
    Long countByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT COUNT(bm) FROM BlogMedia bm WHERE bm.blog.id = :blogId AND bm.mediaType = :mediaType")
    Long countByBlogIdAndMediaType(@Param("blogId") Long blogId, @Param("mediaType") String mediaType);
    
    @Query("SELECT bm FROM BlogMedia bm WHERE bm.blog.id = :blogId AND bm.mediaOrder = " +
           "(SELECT MAX(bm2.mediaOrder) FROM BlogMedia bm2 WHERE bm2.blog.id = :blogId)")
    Optional<BlogMedia> findLastMediaByBlogId(@Param("blogId") Long blogId);
} 