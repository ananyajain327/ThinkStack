package com.thinkstack.controller;

import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.FeedItemResponse;
import com.thinkstack.service.FeedService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Authenticated dashboard feed. */
@RestController
@RequestMapping("/api/v1/feed")
public class FeedController {

    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping
    public ApiResponse<List<FeedItemResponse>> getFeed(
            @RequestParam(defaultValue = "25") int limit) {
        return ApiResponse.ok(feedService.getFeed(limit));
    }
}