package com.example.demo.Reposit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Xabap.Xabap;

@Repository

    public interface XabapRepo extends JpaRepository<Xabap,Long>{
        List<Xabap> findByNameContainingIgnoreCase(String name);
    }
    
        
    
    
