package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.BlogComment;
import com.tourify.tourify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Long> {
    
    List<BlogComment> findByBlogOrderByCreatedAtDesc(Blog blog);
    
    List<BlogComment> findByBlogAndParentCommentIsNullOrderByCreatedAtDesc(Blog blog);
    
    List<BlogComment> findByParentCommentOrderByCreatedAtAsc(BlogComment parentComment);
    
    List<BlogComment> findByUser(User user);
    
    void deleteByBlog(Blog blog);
    
    @Query("SELECT bc FROM BlogComment bc WHERE bc.blog.id = :blogId AND bc.parentComment IS NULL ORDER BY bc.createdAt DESC")
    List<BlogComment> findTopLevelCommentsByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT bc FROM BlogComment bc WHERE bc.parentComment.id = :parentCommentId ORDER BY bc.createdAt ASC")
    List<BlogComment> findRepliesByParentCommentId(@Param("parentCommentId") Long parentCommentId);
    
    @Query("SELECT bc FROM BlogComment bc WHERE bc.blog.id = :blogId ORDER BY bc.createdAt DESC")
    List<BlogComment> findByBlogIdOrderByCreatedAtDesc(@Param("blogId") Long blogId);
    
    @Query("SELECT COUNT(bc) FROM BlogComment bc WHERE bc.blog.id = :blogId")
    Long countByBlogId(@Param("blogId") Long blogId);
    
    @Query("SELECT COUNT(bc) FROM BlogComment bc WHERE bc.parentComment.id = :parentCommentId")
    Long countRepliesByParentCommentId(@Param("parentCommentId") Long parentCommentId);
    
    @Query("SELECT COUNT(bc) FROM BlogComment bc WHERE bc.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT bc FROM BlogComment bc WHERE bc.blog.id = :blogId AND bc.parentComment IS NULL " +
           "ORDER BY bc.likes DESC, bc.createdAt DESC")
    List<BlogComment> findTopLevelCommentsByBlogIdOrderByLikes(@Param("blogId") Long blogId);
} 