package com.thinkstack.service;

import com.thinkstack.dto.request.BookmarkRequest;
import com.thinkstack.dto.response.BookmarkResponse;
import com.thinkstack.entity.Bookmark;
import com.thinkstack.entity.Product;
import com.thinkstack.entity.ProductPrice;
import com.thinkstack.entity.User;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.BookmarkRepository;
import com.thinkstack.repository.DecisionSessionRepository;
import com.thinkstack.repository.ProductPriceRepository;
import com.thinkstack.repository.ProductRepository;
import com.thinkstack.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/** User bookmarks for products and decision sessions. */
@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final ProductRepository productRepository;
    private final DecisionSessionRepository sessionRepository;
    private final ProductPriceRepository priceRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository,
                           ProductRepository productRepository,
                           DecisionSessionRepository sessionRepository,
                           ProductPriceRepository priceRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.productRepository = productRepository;
        this.sessionRepository = sessionRepository;
        this.priceRepository = priceRepository;
    }

    @Transactional
    public BookmarkResponse add(BookmarkRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        String type = request.getBookmarkType();

        Bookmark bookmark;
        if ("PRODUCT".equals(type)) {
            if (request.getProductId() == null) {
                throw new ThinkStackException("productId is required for PRODUCT bookmarks", "BAD_REQUEST");
            }
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ThinkStackException("Product not found", "NOT_FOUND"));
            if (bookmarkRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
                throw new ThinkStackException("Product already bookmarked", "ALREADY_EXISTS");
            }
            bookmark = Bookmark.builder().user(User.builder().id(userId).build())
                    .bookmarkType("PRODUCT").product(product).build();
        } else if ("SESSION".equals(type)) {
            if (request.getSessionId() == null) {
                throw new ThinkStackException("sessionId is required for SESSION bookmarks", "BAD_REQUEST");
            }
            var session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ThinkStackException("Session not found", "NOT_FOUND"));
            if (!session.getUser().getId().equals(userId)) {
                throw new ThinkStackException("Not your decision session", "FORBIDDEN");
            }
            bookmark = Bookmark.builder().user(User.builder().id(userId).build())
                    .bookmarkType("SESSION").session(session).build();
        } else {
            throw new ThinkStackException("bookmarkType must be PRODUCT or SESSION", "BAD_REQUEST");
        }
        return toResponse(bookmarkRepository.save(bookmark));
    }

    @Transactional(readOnly = true)
    public List<BookmarkResponse> list(String type) {
        UUID userId = SecurityUtils.currentUserId();
        List<Bookmark> bookmarks = (type != null && !type.isBlank())
                ? bookmarkRepository.findByUserIdAndBookmarkTypeOrderByCreatedAtDesc(userId, type)
                : bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bookmarks.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void delete(UUID bookmarkId) {
        Bookmark bookmark = bookmarkRepository.findById(bookmarkId)
                .orElseThrow(() -> new ThinkStackException("Bookmark not found", "NOT_FOUND"));
        if (!bookmark.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ThinkStackException("Not your bookmark", "FORBIDDEN");
        }
        bookmarkRepository.delete(bookmark);
    }

    private BookmarkResponse toResponse(Bookmark bookmark) {
        BookmarkResponse.BookmarkProduct product = null;
        BookmarkResponse.BookmarkSession session = null;
        if (bookmark.getProduct() != null) {
            Product p = bookmark.getProduct();
            product = new BookmarkResponse.BookmarkProduct(
                    p.getId(), p.getName(), p.getSlug(), p.getBrand(), p.getImageUrl(),
                    bestPrice(p), p.getAvgRating(),
                    p.getReviewCount() == null ? 0 : p.getReviewCount());
        }
        if (bookmark.getSession() != null) {
            var s = bookmark.getSession();
            session = new BookmarkResponse.BookmarkSession(
                    s.getId(), s.getTitle(), s.getCategory().getSlug(), s.getStatus(), s.getCreatedAt());
        }
        return new BookmarkResponse(bookmark.getId(), bookmark.getBookmarkType(),
                product, session, bookmark.getCreatedAt());
    }

    private java.math.BigDecimal bestPrice(Product product) {
        return priceRepository.findByProductIdOrderByPriceAsc(product.getId()).stream()
                .filter(ProductPrice::getInStock)
                .map(ProductPrice::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(product.getBasePrice());
    }
}