package com.thinkstack.controller;

import com.thinkstack.dto.request.PriceAlertRequest;
import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.PriceAlertResponse;
import com.thinkstack.service.PriceAlertService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Authenticated price-drop alerts for products. */
@RestController
@RequestMapping("/api/v1/price-alerts")
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    public PriceAlertController(PriceAlertService priceAlertService) {
        this.priceAlertService = priceAlertService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PriceAlertResponse> create(@Valid @RequestBody PriceAlertRequest request) {
        return ApiResponse.created(priceAlertService.createPriceAlert(request));
    }

    @GetMapping("/mine")
    public ApiResponse<List<PriceAlertResponse>> myAlerts() {
        return ApiResponse.ok(priceAlertService.myAlerts());
    }

    @PostMapping("/check")
    public ApiResponse<Map<String, Integer>> checkPriceDrops() {
        int triggered = priceAlertService.checkForPriceDrops();
        return ApiResponse.ok(Map.of("notificationsCreated", triggered));
    }

    @PostMapping("/{alertId}/toggle")
    public ApiResponse<Void> toggle(@PathVariable UUID alertId) {
        priceAlertService.toggleAlert(alertId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{alertId}")
    public ApiResponse<Void> delete(@PathVariable UUID alertId) {
        priceAlertService.deleteAlert(alertId);
        return ApiResponse.ok(null);
    }
}