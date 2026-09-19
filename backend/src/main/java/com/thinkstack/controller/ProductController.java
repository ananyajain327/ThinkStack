package com.thinkstack.controller;

import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.PriceHistoryPoint;
import com.thinkstack.dto.response.PriceResponse;
import com.thinkstack.dto.response.ProductDetailResponse;
import com.thinkstack.dto.response.ProductSummaryResponse;
import com.thinkstack.dto.response.ReviewResponse;
import com.thinkstack.dto.response.SpecValueResponse;
import com.thinkstack.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final CatalogService catalogService;

    public ProductController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public ApiResponse<List<ProductSummaryResponse>> listProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok("Products",
                catalogService.listProducts(category, minPrice, maxPrice, sortBy, sortDir, page, size));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailResponse> getProduct(@PathVariable String slug) {
        return ApiResponse.ok("Product", catalogService.getProduct(slug));
    }

    @GetMapping("/{slug}/specifications")
    public ApiResponse<List<SpecValueResponse>> getSpecs(@PathVariable String slug) {
        return ApiResponse.ok("Specifications", catalogService.getProduct(slug).specifications());
    }

    @GetMapping("/{slug}/prices")
    public ApiResponse<List<PriceResponse>> getPrices(@PathVariable String slug) {
        return ApiResponse.ok("Prices", catalogService.getProduct(slug).prices());
    }

    @GetMapping("/{slug}/price-history")
    public ApiResponse<List<PriceHistoryPoint>> getPriceHistory(@PathVariable String slug) {
        return ApiResponse.ok("Price history", catalogService.getPriceHistory(slug));
    }

    @GetMapping("/{slug}/reviews")
    public ApiResponse<List<ReviewResponse>> getReviews(@PathVariable String slug) {
        return ApiResponse.ok("Reviews", catalogService.getReviews(slug));
    }
}