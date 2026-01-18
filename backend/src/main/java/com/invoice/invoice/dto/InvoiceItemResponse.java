package com.invoice.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class InvoiceItemResponse {

    private Long id;
    private String itemName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal gstRate;
    private BigDecimal lineTotal;
}
