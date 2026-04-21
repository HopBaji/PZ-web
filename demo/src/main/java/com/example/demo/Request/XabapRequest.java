package com.example.demo.Request;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class XabapRequest {
    @NotBlank(message = "Кличка")
    private String name;
    @NotBlank
    private String category;
    @NotBlank 
    private int price;

}
