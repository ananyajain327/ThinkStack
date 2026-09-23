package com.thinkstack.controller;

import com.thinkstack.dto.request.BookmarkRequest;
import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.BookmarkResponse;
import com.thinkstack.service.BookmarkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Authenticated bookmarks (PRODUCT or SESSION). */
@RestController
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookmarkResponse> add(@Valid @RequestBody BookmarkRequest request) {
        return ApiResponse.created(bookmarkService.add(request));
    }

    @GetMapping
    public ApiResponse<List<BookmarkResponse>> list(
            @RequestParam(required = false) String type) {
        return ApiResponse.ok(bookmarkService.list(type));
    }

    @DeleteMapping("/{bookmarkId}")
    public ApiResponse<Void> delete(@PathVariable UUID bookmarkId) {
        bookmarkService.delete(bookmarkId);
        return ApiResponse.ok(null);
    }
}