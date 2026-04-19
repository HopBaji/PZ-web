package com.example.demo.Mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.demo.Request.XabapRequest;
import com.example.demo.Response.XabapResponse;
import com.example.demo.Xabap.Xabap;

@Mapper(componentModel="spring")

public interface XabapMapper {
    @Mapping(target = "id",ignore = true)
    @Mapping(target = "name")
    @Mapping(target = "price")
    @Mapping(target = "category",source = "category")

    Xabap toXabap(XabapRequest xabapRequest);
    
    XabapResponse toXabapResponse  (Xabap xabap);

    List<XabapResponse> toListXabapResponses(List<Xabap> items);
    
}
