package com.example.demo.Xabap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Xabap {
    private long id;
    private String name;
    private String category;
    private int price;
}
