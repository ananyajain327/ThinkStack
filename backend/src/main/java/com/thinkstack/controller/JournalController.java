package com.thinkstack.controller;

import com.thinkstack.dto.request.JournalEntryRequest;
import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.JournalEntryResponse;
import com.thinkstack.service.JournalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Authenticated post-purchase journal. */
@RestController
@RequestMapping("/api/v1/journal")
public class JournalController {

    private final JournalService journalService;

    public JournalController(JournalService journalService) {
        this.journalService = journalService;
    }

    @GetMapping
    public ApiResponse<List<JournalEntryResponse>> list() {
        return ApiResponse.ok(journalService.list());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JournalEntryResponse> create(
            @Valid @RequestBody JournalEntryRequest request) {
        return ApiResponse.created(journalService.create(request));
    }

    @PutMapping("/{entryId}")
    public ApiResponse<JournalEntryResponse> update(
            @PathVariable UUID entryId,
            @Valid @RequestBody JournalEntryRequest request) {
        return ApiResponse.ok(journalService.update(entryId, request));
    }

    @DeleteMapping("/{entryId}")
    public ApiResponse<Void> delete(@PathVariable UUID entryId) {
        journalService.delete(entryId);
        return ApiResponse.ok(null);
    }
}