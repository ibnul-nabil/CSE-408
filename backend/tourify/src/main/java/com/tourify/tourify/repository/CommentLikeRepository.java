package com.tourify.tourify.repository;

import com.tourify.tourify.entity.BlogComment;
import com.tourify.tourify.entity.CommentLike;
import com.tourify.tourify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    
    Optional<CommentLike> findByCommentAndUser(BlogComment comment, User user);
    
    List<CommentLike> findByComment(BlogComment comment);
    
    List<CommentLike> findByUser(User user);
    
    boolean existsByCommentAndUser(BlogComment comment, User user);
    
    void deleteByCommentAndUser(BlogComment comment, User user);
    
    void deleteByComment(BlogComment comment);
    
    @Query("SELECT cl FROM CommentLike cl WHERE cl.comment.id = :commentId")
    List<CommentLike> findByCommentId(@Param("commentId") Long commentId);
    
    @Query("SELECT cl FROM CommentLike cl WHERE cl.user.id = :userId")
    List<CommentLike> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment.id = :commentId")
    Long countByCommentId(@Param("commentId") Long commentId);
    
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT CASE WHEN COUNT(cl) > 0 THEN true ELSE false END FROM CommentLike cl " +
           "WHERE cl.comment.id = :commentId AND cl.user.id = :userId")
    boolean existsByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Long userId);
} 