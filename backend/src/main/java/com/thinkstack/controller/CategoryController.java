package com.thinkstack.controller;

import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.CategoryResponse;
import com.thinkstack.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CatalogService catalogService;

    public CategoryController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> listCategories() {
        return ApiResponse.ok("Categories", catalogService.listCategories());
    }

    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> getCategory(@PathVariable String slug) {
        return ApiResponse.ok("Category", catalogService.getCategory(slug));
    }
}