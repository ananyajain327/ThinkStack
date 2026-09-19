package com.thinkstack.service;

import com.thinkstack.dto.response.CategoryResponse;
import com.thinkstack.dto.response.PriceHistoryPoint;
import com.thinkstack.dto.response.PriceResponse;
import com.thinkstack.dto.response.ProductDetailResponse;
import com.thinkstack.dto.response.ProductSummaryResponse;
import com.thinkstack.dto.response.ReviewResponse;
import com.thinkstack.dto.response.SpecValueResponse;
import com.thinkstack.entity.Category;
import com.thinkstack.entity.PriceHistory;
import com.thinkstack.entity.Product;
import com.thinkstack.entity.ProductPrice;
import com.thinkstack.entity.ProductReview;
import com.thinkstack.entity.ProductSpecification;
import com.thinkstack.entity.SpecificationDefinition;
import com.thinkstack.exception.ThinkStackException;
import com.thinkstack.repository.CategoryRepository;
import com.thinkstack.repository.PriceHistoryRepository;
import com.thinkstack.repository.ProductPriceRepository;
import com.thinkstack.repository.ProductRepository;
import com.thinkstack.repository.ProductReviewRepository;
import com.thinkstack.repository.ProductSpecificationRepository;
import com.thinkstack.repository.SpecificationDefinitionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/** Read-side aggregation for categories, products, specifications, prices and reviews. */
@Service
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final SpecificationDefinitionRepository specDefinitionRepository;
    private final ProductRepository productRepository;
    private final ProductSpecificationRepository productSpecRepository;
    private final ProductPriceRepository productPriceRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ProductReviewRepository productReviewRepository;

    public CatalogService(CategoryRepository categoryRepository,
                          SpecificationDefinitionRepository specDefinitionRepository,
                          ProductRepository productRepository,
                          ProductSpecificationRepository productSpecRepository,
                          ProductPriceRepository productPriceRepository,
                          PriceHistoryRepository priceHistoryRepository,
                          ProductReviewRepository productReviewRepository) {
        this.categoryRepository = categoryRepository;
        this.specDefinitionRepository = specDefinitionRepository;
        this.productRepository = productRepository;
        this.productSpecRepository = productSpecRepository;
        this.productPriceRepository = productPriceRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.productReviewRepository = productReviewRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategory(String slug) {
        return toCategoryResponse(
                categoryRepository.findBySlug(slug)
                        .orElseThrow(() -> new ThinkStackException("Category not found", "NOT_FOUND")));
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> listProducts(String categorySlug,
                                                     BigDecimal minPrice,
                                                     BigDecimal maxPrice,
                                                     String sortBy,
                                                     String sortDir,
                                                     int page,
                                                     int size) {
        Pageable pageable = PageRequest.of(page, size, toSort(sortBy, sortDir));

        if (categorySlug != null && !categorySlug.isBlank()) {
            Category category = categoryRepository.findBySlug(categorySlug)
                    .orElseThrow(() -> new ThinkStackException("Category not found", "NOT_FOUND"));
            if (minPrice != null && maxPrice != null) {
                return productRepository
                        .findActiveByCategoryAndPriceRange(
                                category.getId(), minPrice, maxPrice)
                        .stream().map(this::toSummary).toList();
            }
            return productRepository
                    .findByCategoryId(category.getId(), pageable)
                    .getContent().stream().map(this::toSummary).toList();
        }

        return productRepository.findAll(pageable)
                .getContent().stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProduct(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ThinkStackException("Product not found", "NOT_FOUND"));

        List<SpecValueResponse> specs = productSpecRepository.findByProductId(product.getId())
                .stream().map(this::toSpecValue).toList();
        List<PriceResponse> prices = productPriceRepository
                .findByProductIdOrderByPriceAsc(product.getId())
                .stream().map(this::toPrice).toList();
        List<ReviewResponse> reviews = productReviewRepository
                .findByProductIdOrderByReviewDateDesc(product.getId())
                .stream().map(this::toReview).toList();

        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getBrand(),
                product.getModel(),
                product.getCategory().getSlug(),
                product.getCategory().getName(),
                product.getDescription(),
                product.getImageUrl(),
                product.getBasePrice(),
                bestPrice(product),
                product.getCurrency(),
                product.getAvgRating(),
                product.getReviewCount(),
                specs,
                prices,
                reviews);
    }

    @Transactional(readOnly = true)
    public List<PriceHistoryPoint> getPriceHistory(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ThinkStackException("Product not found", "NOT_FOUND"));
        return priceHistoryRepository.findByProductIdOrderByRecordedAtAsc(product.getId())
                .stream().map(this::toHistoryPoint).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ThinkStackException("Product not found", "NOT_FOUND"));
        return productReviewRepository.findByProductIdOrderByReviewDateDesc(product.getId())
                .stream().map(this::toReview).toList();
    }

    private CategoryResponse toCategoryResponse(Category category) {
        long productCount = productRepository.findByCategoryId(
                category.getId(), PageRequest.of(0, 1)).getTotalElements();
        List<CategoryResponse.SpecDefinitionResponse> defs =
                specDefinitionRepository.findByCategoryIdOrderByDisplayOrderAsc(category.getId())
                        .stream().map(this::toSpecDef).toList();
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIcon(),
                category.getDisplayOrder(),
                productCount,
                defs);
    }

    private CategoryResponse.SpecDefinitionResponse toSpecDef(SpecificationDefinition def) {
        return new CategoryResponse.SpecDefinitionResponse(
                def.getId(), def.getName(), def.getKeyName(), def.getDataType(),
                def.getUnit(), def.getExplanation(), def.getIsRequired(),
                def.getIsFilterable(), def.getDisplayOrder());
    }

    private SpecValueResponse toSpecValue(ProductSpecification spec) {
        SpecificationDefinition def = spec.getSpecDef();
        String displayValue = switch (def.getDataType()) {
            case "NUMERIC" -> spec.getNumericValue() == null ? null
                    : spec.getNumericValue().stripTrailingZeros().toPlainString()
                    + (def.getUnit() != null ? " " + def.getUnit() : "");
            case "BOOLEAN" -> spec.getBooleanValue() == null ? null
                    : (spec.getBooleanValue() ? "Yes" : "No");
            default -> spec.getTextValue();
        };
        return new SpecValueResponse(
                def.getId(), def.getKeyName(), def.getName(), def.getDataType(),
                def.getUnit(), def.getExplanation(), spec.getTextValue(),
                spec.getNumericValue(), spec.getBooleanValue(), displayValue);
    }

    private PriceResponse toPrice(ProductPrice price) {
        return new PriceResponse(
                price.getId(), price.getSellerName(), price.getSellerUrl(), price.getPrice(),
                price.getOriginalPrice(), price.getCurrency(), price.getInStock(),
                price.getShippingCost(), price.getAvailability(), price.getSellerRating(),
                price.getDeliveryInfo(), price.getLastCheckedAt());
    }

    private PriceHistoryPoint toHistoryPoint(PriceHistory point) {
        return new PriceHistoryPoint(
                point.getId(), point.getSellerName(), point.getPrice(),
                point.getCurrency(), point.getRecordedAt());
    }

    private ReviewResponse toReview(ProductReview review) {
        return new ReviewResponse(
                review.getId(), review.getReviewType(), review.getSource(),
                review.getSourceUrl(), review.getAuthorName(), review.getRating(),
                review.getTitle(), review.getContent(), review.getSentiment(),
                review.getSentimentScore(), review.getVerifiedPurchase(),
                review.getHelpfulCount(), review.getReviewDate(), review.getCreatedAt());
    }

    private ProductSummaryResponse toSummary(Product product) {
        return new ProductSummaryResponse(
                product.getId(), product.getName(), product.getSlug(), product.getBrand(),
                product.getModel(), product.getCategory().getSlug(),
                product.getCategory().getName(), product.getImageUrl(), product.getBasePrice(),
                bestPrice(product), product.getCurrency(), product.getAvgRating(),
                product.getReviewCount());
    }

    private BigDecimal bestPrice(Product product) {
        return productPriceRepository.findByProductIdOrderByPriceAsc(product.getId())
                .stream()
                .filter(ProductPrice::getInStock)
                .map(ProductPrice::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(product.getBasePrice());
    }

    private Sort toSort(String sortBy, String sortDir) {
        String field = switch (sortBy == null ? "" : sortBy) {
            case "price" -> "basePrice";
            case "name" -> "name";
            case "rating" -> "avgRating";
            default -> "reviewCount";
        };
        boolean asc = "asc".equalsIgnoreCase(sortDir);
        return asc ? Sort.by(Sort.Direction.ASC, field) : Sort.by(Sort.Direction.DESC, field);
    }
}