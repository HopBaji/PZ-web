package com.example.demo.Enums;

public enum CategoryEnum {
    Rifle("Винтовка"),
    Clothes("Одежда");
    
    private final String displayName;
    
    
    CategoryEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }


}
