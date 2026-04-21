package com.example.demo.Model;

import com.example.demo.Enums.CategoryEnum;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Table(name= " Товар")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class madel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private long id;
    @Column(name="Название")
    private String name;
    @Enumerated(EnumType.STRING)
    private CategoryEnum category;
    @Column(name= "цена")
    private int price;


    
}
