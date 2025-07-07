package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.BlogDestination;
import com.tourify.tourify.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogDestinationRepository extends JpaRepository<BlogDestination, Long> {
    
    List<BlogDestination> findByBlog(Blog blog);
    
    List<BlogDestination> findByDestination(Destination destination);
    
    Optional<BlogDestination> findByBlogAndDestination(Blog blog, Destination destination);
    
    void deleteByBlog(Blog blog);
    
    void deleteByBlogAndDestination(Blog blog, Destination destination);
    
    @Query("SELECT bd FROM BlogDestination bd WHERE bd.destination.id = :destinationId")
    List<BlogDestination> findByDestinationId(@Param("destinationId") Long destinationId);
    
    @Query("SELECT bd FROM BlogDestination bd WHERE bd.blog.id = :blogId")
    List<BlogDestination> findByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT COUNT(bd) FROM BlogDestination bd WHERE bd.destination.id = :destinationId")
    Long countBlogsByDestinationId(@Param("destinationId") Long destinationId);
} 