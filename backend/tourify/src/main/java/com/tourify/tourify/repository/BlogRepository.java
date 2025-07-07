package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByUser(User user);
    
    List<Blog> findByStatus(String status);
    
    List<Blog> findByUserAndStatus(User user, String status);
    
    List<Blog> findByStatusOrderByCreatedAtDesc(String status);
    
    List<Blog> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT b FROM Blog b WHERE b.status = 'published' ORDER BY b.createdAt DESC")
    List<Blog> findPublishedBlogsOrderByCreatedAtDesc();
    
    @Query("SELECT b FROM Blog b WHERE b.status = 'published' ORDER BY b.likes DESC, b.createdAt DESC")
    List<Blog> findPublishedBlogsOrderByLikes();
    
    @Query("SELECT DISTINCT b FROM Blog b " +
           "JOIN b.blogDestinations bd " +
           "WHERE bd.destination.id = :destinationId AND b.status = 'published' " +
           "ORDER BY b.createdAt DESC")
    List<Blog> findPublishedBlogsByDestinationId(@Param("destinationId") Long destinationId);
    
    @Query("SELECT DISTINCT b FROM Blog b " +
           "JOIN b.blogCustomDestinations bcd " +
           "WHERE LOWER(bcd.destinationName) = LOWER(:destinationName) AND b.status = 'published' " +
           "ORDER BY b.createdAt DESC")
    List<Blog> findPublishedBlogsByCustomDestination(@Param("destinationName") String destinationName);
    
    @Query("SELECT DISTINCT b FROM Blog b " +
           "LEFT JOIN b.blogDestinations bd " +
           "LEFT JOIN b.blogCustomDestinations bcd " +
           "WHERE (bd.destination.id = :destinationId OR LOWER(bcd.destinationName) = LOWER(:customDestinationName)) " +
           "AND b.status = 'published' ORDER BY b.createdAt DESC")
    List<Blog> findPublishedBlogsByAnyDestination(@Param("destinationId") Long destinationId, 
                                                  @Param("customDestinationName") String customDestinationName);
    
    @Query("SELECT b FROM Blog b WHERE " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND b.status = 'published' ORDER BY b.createdAt DESC")
    List<Blog> searchPublishedBlogs(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT COUNT(b) FROM Blog b WHERE b.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Blog b WHERE b.status = :status")
    Long countByStatus(@Param("status") String status);
}