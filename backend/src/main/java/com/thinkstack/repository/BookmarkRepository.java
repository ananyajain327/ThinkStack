package com.thinkstack.repository;

import com.thinkstack.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Bookmark> findByUserIdAndBookmarkTypeOrderByCreatedAtDesc(UUID userId, String bookmarkType);

    Optional<Bookmark> findByUserIdAndProductId(UUID userId, UUID productId);

    Optional<Bookmark> findByUserIdAndSessionId(UUID userId, UUID sessionId);

    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
}