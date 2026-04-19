package com.example.demo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;







@Controller
public class controller {
    @RequestMapping("/")
    public String Main() {
        return "index";
    }
    @RequestMapping("/catalog")
    public String catalog() {
        return "catalog";
    }
    @RequestMapping("/contacts")
    public String contacts() {
        return "contacts";
    }
    @RequestMapping("/favorites")
    public String favorites() {
        return "favorites";
    }
    @RequestMapping("/compare")
    public String compare() {
        return "compare";
    }
    @RequestMapping("/delivery")
    public String delivery() {
        return "delivery";
    }
    @RequestMapping("/about")
    public String about() {
        return "about";
    }
    @RequestMapping("/cart")
    public String cart() {
        return "cart";
    }
    
    
    
}
