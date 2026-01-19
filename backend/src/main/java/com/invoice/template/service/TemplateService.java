package com.invoice.template.service;

import com.invoice.template.dto.TemplateRequest;
import com.invoice.template.dto.TemplateResponse;
import com.invoice.template.entity.InvoiceTemplate;
import com.invoice.template.repository.InvoiceTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final InvoiceTemplateRepository templateRepository;

    @Transactional
    public TemplateResponse createTemplate(TemplateRequest request) {
        // If this is set as default, unset all other defaults for this business
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefaultTemplates(request.getBusinessId());
        }

        InvoiceTemplate template = new InvoiceTemplate();
        template.setBusinessId(request.getBusinessId());
        template.setName(request.getName());
        template.setConfigJson(request.getConfigJson());
        template.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        InvoiceTemplate saved = templateRepository.save(template);
        return mapToResponse(saved);
    }

    public List<TemplateResponse> getTemplatesByBusiness(Long businessId) {
        return templateRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TemplateResponse getDefaultTemplate(Long businessId) {
        return templateRepository.findByBusinessIdAndIsDefaultTrue(businessId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public TemplateResponse getTemplateById(Long id) {
        InvoiceTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        return mapToResponse(template);
    }

    @Transactional
    public TemplateResponse updateTemplate(Long id, TemplateRequest request) {
        InvoiceTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // If setting as default, unset other defaults
        if (Boolean.TRUE.equals(request.getIsDefault()) && !template.getIsDefault()) {
            unsetDefaultTemplates(template.getBusinessId());
        }

        template.setName(request.getName());
        template.setConfigJson(request.getConfigJson());
        template.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        InvoiceTemplate updated = templateRepository.save(template);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }

    private void unsetDefaultTemplates(Long businessId) {
        List<InvoiceTemplate> templates = templateRepository.findByBusinessId(businessId);
        templates.forEach(t -> t.setIsDefault(false));
        templateRepository.saveAll(templates);
    }

    private TemplateResponse mapToResponse(InvoiceTemplate template) {
        TemplateResponse response = new TemplateResponse();
        response.setId(template.getId());
        response.setBusinessId(template.getBusinessId());
        response.setName(template.getName());
        response.setConfigJson(template.getConfigJson());
        response.setIsDefault(template.getIsDefault());
        response.setCreatedAt(template.getCreatedAt());
        return response;
    }
}
