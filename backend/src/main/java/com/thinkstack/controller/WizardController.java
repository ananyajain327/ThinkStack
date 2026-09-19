package com.thinkstack.controller;

import com.thinkstack.dto.response.ApiResponse;
import com.thinkstack.dto.response.WizardResponse;
import com.thinkstack.service.WizardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wizards")
public class WizardController {

    private final WizardService wizardService;

    public WizardController(WizardService wizardService) {
        this.wizardService = wizardService;
    }

    @GetMapping
    public ApiResponse<List<WizardResponse>> listWizards() {
        return ApiResponse.ok("Wizards", wizardService.listWizards());
    }

    @GetMapping("/by-category/{categorySlug}")
    public ApiResponse<WizardResponse> getWizardByCategory(@PathVariable String categorySlug) {
        return ApiResponse.ok("Wizard", wizardService.getWizardByCategory(categorySlug));
    }
}