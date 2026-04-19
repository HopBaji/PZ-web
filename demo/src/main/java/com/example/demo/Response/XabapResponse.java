package com.example.demo.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class XabapResponse {
    private Long id;
    private String name;
    private int price;
    private String category;

}
