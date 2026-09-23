package com.thinkstack.controller;

import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.DnaFactorResponse;
import com.thinkstack.security.SecurityUtils;
import com.thinkstack.service.DnaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Authenticated decision DNA for the current user. */
@RestController
@RequestMapping("/api/v1/dna")
public class DnaController {

    private final DnaService dnaService;

    public DnaController(DnaService dnaService) {
        this.dnaService = dnaService;
    }

    @GetMapping
    public ApiResponse<List<DnaFactorResponse>> getDna() {
        return ApiResponse.ok(dnaService.getFactors(SecurityUtils.currentUserId()));
    }

    @PostMapping("/refresh")
    public ApiResponse<List<DnaFactorResponse>> refresh() {
        return ApiResponse.ok(dnaService.refreshFromUser(SecurityUtils.currentUserId()));
    }
}