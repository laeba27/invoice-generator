package com.invoice.customer.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CustomerRequest {
    private String name;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;
    
    @Pattern(regexp = "^[0-9]{2}$", message = "State code must be 2 digits")
    private String stateCode;
}
