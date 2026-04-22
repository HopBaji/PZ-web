package com.example.demo.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.demo.Mapper.XabapMapper;
import com.example.demo.Reposit.XabapRepo;
import com.example.demo.Request.XabapRequest;
import com.example.demo.Xabap.Xabap;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j
public class XabapService {
    
    private static final Logger log = LoggerFactory.getLogger(XabapService.class);
    private final XabapMapper xabapMapper;
    private final XabapRepo xabapRepo;

    @PostConstruct
    public void preInitialisation(){
        log.info("Создание бина");
    }
    
    public void createXabap(XabapRequest xabapRequest){
        log.info("Создание карточки товара",xabapRequest);
        Xabap xabap = xabapMapper.toXabap(xabapRequest);
        xabapRepo.save(xabap);
    }
}
