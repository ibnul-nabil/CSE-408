package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.BlogCustomDestination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogCustomDestinationRepository extends JpaRepository<BlogCustomDestination, Long> {
    
    List<BlogCustomDestination> findByBlog(Blog blog);
    
    List<BlogCustomDestination> findByDestinationNameContainingIgnoreCase(String destinationName);
    
    void deleteByBlog(Blog blog);
    
    @Query("SELECT bcd FROM BlogCustomDestination bcd WHERE bcd.blog.id = :blogId")
    List<BlogCustomDestination> findByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT bcd.destinationName, COUNT(bcd) FROM BlogCustomDestination bcd " +
           "GROUP BY bcd.destinationName ORDER BY COUNT(bcd) DESC")
    List<Object[]> findMostPopularCustomDestinations();
    
    @Query("SELECT COUNT(bcd) FROM BlogCustomDestination bcd WHERE bcd.destinationName = :destinationName")
    Long countByDestinationName(@Param("destinationName") String destinationName);
} 